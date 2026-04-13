import pool from '../config/db.js'

/**
 * Ledger balance: sum(credits) - sum(debits)
 * @param {import('mysql2/promise').PoolConnection} [conn]
 */
export async function getBalanceForAccount(accountId, conn = null) {
  const db = conn || pool
  const [rows] = await db.query(
    `SELECT COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE -amount END), 0) AS balance
     FROM transactions WHERE account_id = ?`,
    [accountId]
  )
  return Number(rows[0]?.balance ?? 0)
}
