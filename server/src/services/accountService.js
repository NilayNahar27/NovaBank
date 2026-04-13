import pool from '../config/db.js'
import { getBalanceForAccount } from './balanceService.js'
import { recentForDashboard, summaryByDay, monthlyTotals } from './transactionService.js'
import { sanitizeText } from '../utils/sanitize.js'

export async function findByUserId(userId) {
  const [rows] = await pool.query(
    `SELECT a.id, a.user_id, a.card_number, a.account_number, a.account_type, a.ifsc_code, a.branch_name, a.created_at
     FROM accounts a WHERE a.user_id = ? LIMIT 1`,
    [userId]
  )
  return rows[0] || null
}

export async function findByCardNumber(cardNumber) {
  const normalized = String(cardNumber).replace(/\s/g, '')
  const [rows] = await pool.query(
    `SELECT a.id, a.user_id, a.card_number, a.account_number, a.account_type,
            u.id AS uid, u.customer_id, u.full_name, u.email, u.phone, u.pin_hash
     FROM accounts a
     JOIN users u ON u.id = a.user_id
     WHERE a.card_number = ? LIMIT 1`,
    [normalized]
  )
  return rows[0] || null
}

export async function findByEmailWithAccount(email) {
  const e = String(email || '').trim()
  const [rows] = await pool.query(
    `SELECT u.id AS user_id, u.full_name, u.email, u.password_hash,
            a.id AS account_id
     FROM users u
     JOIN accounts a ON a.user_id = u.id
     WHERE LOWER(u.email) = LOWER(?)
     LIMIT 1`,
    [e]
  )
  return rows[0] || null
}

export async function getSummaryForUser(userId) {
  const account = await findByUserId(userId)
  if (!account) return null
  const balance = await getBalanceForAccount(account.id)
  const recent = await recentForDashboard(account.id, 8)
  const chart = await summaryByDay(account.id, 7)
  const month = await monthlyTotals(account.id)
  return { account, balance, recent, chart, month }
}

export async function getProfile(userId) {
  const [rows] = await pool.query(
    `SELECT u.id, u.full_name, u.email, u.phone, u.created_at,
            p.dob, p.gender, p.address, p.city, p.state, p.pincode, p.occupation, p.income, p.education, p.marital_status
     FROM users u
     LEFT JOIN user_profiles p ON p.user_id = u.id
     WHERE u.id = ?
     LIMIT 1`,
    [userId]
  )
  return rows[0] || null
}

export async function updateProfile(userId, body) {
  if (body.fullName !== undefined) {
    const fullName = sanitizeText(body.fullName, 120)
    if (fullName) await pool.query('UPDATE users SET full_name = ? WHERE id = ?', [fullName, userId])
  }
  if (body.phone !== undefined) {
    const phone = sanitizeText(body.phone, 20)
    if (phone) await pool.query('UPDATE users SET phone = ? WHERE id = ?', [phone, userId])
  }

  const map = [
    ['dob', body.dob],
    ['gender', body.gender !== undefined ? sanitizeText(body.gender, 30) : undefined],
    ['address', body.address !== undefined ? sanitizeText(body.address, 500) : undefined],
    ['city', body.city !== undefined ? sanitizeText(body.city, 100) : undefined],
    ['state', body.state !== undefined ? sanitizeText(body.state, 100) : undefined],
    ['pincode', body.pincode !== undefined ? sanitizeText(body.pincode, 20) : undefined],
    ['occupation', body.occupation !== undefined ? sanitizeText(body.occupation, 100) : undefined],
    ['income', body.income !== undefined ? sanitizeText(body.income, 50) : undefined],
    ['education', body.education !== undefined ? sanitizeText(body.education, 100) : undefined],
    ['marital_status', body.maritalStatus !== undefined ? sanitizeText(body.maritalStatus, 50) : undefined],
  ]
  const sets = []
  const vals = []
  for (const [col, val] of map) {
    if (val !== undefined) {
      sets.push(`${col} = ?`)
      vals.push(val === '' ? null : val)
    }
  }
  if (sets.length) {
    vals.push(userId)
    await pool.query(`UPDATE user_profiles SET ${sets.join(', ')} WHERE user_id = ?`, vals)
  }
}
