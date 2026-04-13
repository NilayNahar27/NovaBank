import pool from '../config/db.js'
import { sanitizeText } from '../utils/sanitize.js'
import { getBalanceForAccount } from './balanceService.js'
import * as notificationService from './notificationService.js'

function metaDefaults(meta = {}) {
  return {
    category: meta.category || 'general',
    referenceId: meta.referenceId ?? null,
    status: meta.status || 'posted',
    transferId: meta.transferId ?? null,
  }
}

export async function addCredit(accountId, amount, description, conn = null, meta = {}) {
  const db = conn || pool
  const desc = sanitizeText(description, 255) || 'Deposit'
  const m = metaDefaults(meta)
  await db.query(
    `INSERT INTO transactions (account_id, type, category, amount, description, reference_id, status, transfer_id)
     VALUES (?, 'credit', ?, ?, ?, ?, ?, ?)`,
    [accountId, m.category, amount, desc, m.referenceId, m.status, m.transferId]
  )
}

export async function addDebit(accountId, amount, description, conn = null, meta = {}) {
  const db = conn || pool
  const desc = sanitizeText(description, 255) || 'Withdrawal'
  const m = metaDefaults(meta)
  await db.query(
    `INSERT INTO transactions (account_id, type, category, amount, description, reference_id, status, transfer_id)
     VALUES (?, 'debit', ?, ?, ?, ?, ?, ?)`,
    [accountId, m.category, amount, desc, m.referenceId, m.status, m.transferId]
  )
}

export async function deposit(accountId, amount, description, userId = null) {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    await conn.query('SELECT id FROM accounts WHERE id = ? FOR UPDATE', [accountId])
    await addCredit(accountId, amount, description, conn, { category: 'deposit' })
    await conn.commit()
    const bal = await getBalanceForAccount(accountId)
    if (userId) {
      await notificationService.createNotification(
        userId,
        'deposit',
        'Deposit posted',
        `₹${Number(amount).toFixed(2)} credited to your account. New balance ₹${bal.toFixed(2)}.`
      )
    }
    return bal
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
}

export async function withdraw(accountId, amount, description, userId = null) {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    await conn.query('SELECT id FROM accounts WHERE id = ? FOR UPDATE', [accountId])
    const balance = await getBalanceForAccount(accountId, conn)
    if (balance < amount) {
      await conn.rollback()
      const err = new Error('Insufficient balance')
      err.code = 'INSUFFICIENT_FUNDS'
      throw err
    }
    await addDebit(accountId, amount, description, conn, { category: 'withdrawal' })
    await conn.commit()
    const bal = await getBalanceForAccount(accountId)
    if (userId) {
      await notificationService.createNotification(
        userId,
        'withdrawal',
        'Withdrawal successful',
        `₹${Number(amount).toFixed(2)} debited. New balance ₹${bal.toFixed(2)}.`
      )
    }
    return bal
  } catch (e) {
    try {
      await conn.rollback()
    } catch {
      /* ignore */
    }
    throw e
  } finally {
    conn.release()
  }
}

export async function listHistory(accountId, opts = {}) {
  const limit = Math.min(Math.max(Number(opts.limit) || 25, 1), 100)
  const page = Math.max(Number(opts.page) || 1, 1)
  const offset = (page - 1) * limit
  const type = opts.type
  const category = opts.category
  const from = opts.from
  const to = opts.to
  const q = opts.q ? sanitizeText(opts.q, 80) : ''

  let where = 'WHERE account_id = ?'
  const params = [accountId]
  if (type === 'credit' || type === 'debit') {
    where += ' AND type = ?'
    params.push(type)
  }
  if (category && category !== 'all') {
    where += ' AND category = ?'
    params.push(category)
  }
  if (from) {
    where += ' AND created_at >= ?'
    params.push(from)
  }
  if (to) {
    where += ' AND created_at < DATE_ADD(?, INTERVAL 1 DAY)'
    params.push(to)
  }
  if (q) {
    where += ' AND (description LIKE ? OR CAST(reference_id AS CHAR) LIKE ?)'
    const like = `%${q}%`
    params.push(like, like)
  }

  const countSql = `SELECT COUNT(*) AS total FROM transactions ${where}`
  const [countRows] = await pool.query(countSql, params)
  const total = Number(countRows[0]?.total ?? 0)

  const sql = `SELECT id, type, category, amount, description, reference_id, status, transfer_id, created_at
               FROM transactions ${where}
               ORDER BY created_at DESC, id DESC
               LIMIT ? OFFSET ?`
  const listParams = [...params, limit, offset]
  const [rows] = await pool.query(sql, listParams)
  return { rows, total, page, limit }
}

export async function recentForDashboard(accountId, limit = 8) {
  const [rows] = await pool.query(
    `SELECT id, type, category, amount, description, reference_id, status, transfer_id, created_at
     FROM transactions WHERE account_id = ?
     ORDER BY created_at DESC, id DESC LIMIT ?`,
    [accountId, limit]
  )
  return rows
}

/** Aggregates for chart: last N days credit vs debit totals */
export async function summaryByDay(accountId, days = 7) {
  const [rows] = await pool.query(
    `SELECT DATE(created_at) AS d,
            SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) AS credits,
            SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) AS debits
     FROM transactions
     WHERE account_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
     GROUP BY DATE(created_at)
     ORDER BY d ASC`,
    [accountId, days]
  )
  return rows.map((r) => ({
    date: r.d,
    credits: Number(r.credits || 0),
    debits: Number(r.debits || 0),
  }))
}

export async function monthlyTotals(accountId) {
  const [rows] = await pool.query(
    `SELECT
       COALESCE(SUM(CASE WHEN type = 'credit' THEN amount END), 0) AS credits,
       COALESCE(SUM(CASE WHEN type = 'debit' THEN amount END), 0) AS debits
     FROM transactions
     WHERE account_id = ?
       AND YEAR(created_at) = YEAR(CURDATE())
       AND MONTH(created_at) = MONTH(CURDATE())`,
    [accountId]
  )
  return {
    credits: Number(rows[0]?.credits ?? 0),
    debits: Number(rows[0]?.debits ?? 0),
  }
}
