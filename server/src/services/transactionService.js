import pool from '../config/db.js'
import { sanitizeText } from '../utils/sanitize.js'
import { getBalanceForAccount } from './balanceService.js'

export async function addCredit(accountId, amount, description, conn = null) {
  const db = conn || pool
  const desc = sanitizeText(description, 255) || 'Deposit'
  await db.query(
    `INSERT INTO transactions (account_id, type, amount, description) VALUES (?, 'credit', ?, ?)`,
    [accountId, amount, desc]
  )
}

export async function addDebit(accountId, amount, description, conn = null) {
  const db = conn || pool
  const desc = sanitizeText(description, 255) || 'Withdrawal'
  await db.query(
    `INSERT INTO transactions (account_id, type, amount, description) VALUES (?, 'debit', ?, ?)`,
    [accountId, amount, desc]
  )
}

export async function deposit(accountId, amount, description) {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    await conn.query('SELECT id FROM accounts WHERE id = ? FOR UPDATE', [accountId])
    await addCredit(accountId, amount, description, conn)
    await conn.commit()
    return getBalanceForAccount(accountId)
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
}

export async function withdraw(accountId, amount, description) {
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
    await addDebit(accountId, amount, description, conn)
    await conn.commit()
    return getBalanceForAccount(accountId, conn)
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

export async function listHistory(accountId, { limit = 50, type } = {}) {
  let sql = `SELECT id, type, amount, description, created_at
             FROM transactions WHERE account_id = ?`
  const params = [accountId]
  if (type === 'credit' || type === 'debit') {
    sql += ' AND type = ?'
    params.push(type)
  }
  sql += ' ORDER BY created_at DESC, id DESC LIMIT ?'
  params.push(Math.min(Number(limit) || 50, 200))
  const [rows] = await pool.query(sql, params)
  return rows
}

export async function recentForDashboard(accountId, limit = 6) {
  const [rows] = await pool.query(
    `SELECT id, type, amount, description, created_at
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
