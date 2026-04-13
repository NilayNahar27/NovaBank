import pool from '../config/db.js'
import { sanitizeText } from '../utils/sanitize.js'

export async function createNotification(userId, type, title, body, conn = null) {
  const db = conn || pool
  await db.query(
    `INSERT INTO notifications (user_id, type, title, body) VALUES (?, ?, ?, ?)`,
    [userId, sanitizeText(type, 40) || 'info', sanitizeText(title, 120), sanitizeText(body, 500)]
  )
}

export async function listForUser(userId, { limit = 40 } = {}) {
  const lim = Math.min(Number(limit) || 40, 100)
  const [rows] = await pool.query(
    `SELECT id, type, title, body, read_at, created_at
     FROM notifications WHERE user_id = ?
     ORDER BY created_at DESC, id DESC
     LIMIT ?`,
    [userId, lim]
  )
  return rows
}

export async function unreadCount(userId) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS n FROM notifications WHERE user_id = ? AND read_at IS NULL`,
    [userId]
  )
  return Number(rows[0]?.n ?? 0)
}

export async function markRead(userId, id) {
  const [res] = await pool.query(
    `UPDATE notifications SET read_at = COALESCE(read_at, NOW())
     WHERE id = ? AND user_id = ?`,
    [id, userId]
  )
  return res.affectedRows > 0
}

export async function markAllRead(userId) {
  await pool.query(`UPDATE notifications SET read_at = NOW() WHERE user_id = ? AND read_at IS NULL`, [
    userId,
  ])
}
