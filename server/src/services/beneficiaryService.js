import pool from '../config/db.js'
import { sanitizeText } from '../utils/sanitize.js'

function normalizeAcct(n) {
  return String(n || '').replace(/\s/g, '')
}

function normalizeIfsc(c) {
  return String(c || '').trim().toUpperCase()
}

export async function listByUser(userId) {
  const [rows] = await pool.query(
    `SELECT id, beneficiary_name, bank_name, account_number, ifsc_code, nickname, created_at
     FROM beneficiaries WHERE user_id = ?
     ORDER BY created_at DESC, id DESC`,
    [userId]
  )
  return rows
}

export async function findOwned(userId, id) {
  const [rows] = await pool.query(
    `SELECT id, user_id, beneficiary_name, bank_name, account_number, ifsc_code, nickname
     FROM beneficiaries WHERE id = ? AND user_id = ? LIMIT 1`,
    [id, userId]
  )
  return rows[0] || null
}

export async function createBeneficiary(userId, body) {
  const beneficiaryName = sanitizeText(body.beneficiaryName, 120)
  const bankName = sanitizeText(body.bankName, 120)
  const accountNumber = normalizeAcct(body.accountNumber)
  const ifscCode = normalizeIfsc(body.ifscCode)
  const nickname = body.nickname ? sanitizeText(body.nickname, 80) : null

  if (!beneficiaryName || !bankName || !accountNumber || !ifscCode) {
    const err = new Error('Missing beneficiary details')
    err.code = 'VALIDATION'
    throw err
  }

  try {
    const [res] = await pool.query(
      `INSERT INTO beneficiaries (user_id, beneficiary_name, bank_name, account_number, ifsc_code, nickname)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, beneficiaryName, bankName, accountNumber, ifscCode, nickname]
    )
    return res.insertId
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      const err = new Error('This beneficiary is already saved')
      err.code = 'DUPLICATE_BENEFICIARY'
      throw err
    }
    throw e
  }
}

export async function removeBeneficiary(userId, id) {
  const [res] = await pool.query(`DELETE FROM beneficiaries WHERE id = ? AND user_id = ?`, [id, userId])
  return res.affectedRows > 0
}
