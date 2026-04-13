import pool from '../config/db.js'
import { getBalanceForAccount } from './balanceService.js'
import { recentForDashboard, summaryByDay } from './transactionService.js'

export async function findByUserId(userId) {
  const [rows] = await pool.query(
    `SELECT a.id, a.user_id, a.card_number, a.account_number, a.account_type, a.created_at
     FROM accounts a WHERE a.user_id = ? LIMIT 1`,
    [userId]
  )
  return rows[0] || null
}

export async function findByCardNumber(cardNumber) {
  const normalized = String(cardNumber).replace(/\s/g, '')
  const [rows] = await pool.query(
    `SELECT a.id, a.user_id, a.card_number, a.account_number, a.account_type,
            u.id AS uid, u.full_name, u.email, u.phone, u.pin_hash
     FROM accounts a
     JOIN users u ON u.id = a.user_id
     WHERE a.card_number = ? LIMIT 1`,
    [normalized]
  )
  return rows[0] || null
}

export async function getSummaryForUser(userId) {
  const account = await findByUserId(userId)
  if (!account) return null
  const balance = await getBalanceForAccount(account.id)
  const recent = await recentForDashboard(account.id, 8)
  const chart = await summaryByDay(account.id, 7)
  return { account, balance, recent, chart }
}
