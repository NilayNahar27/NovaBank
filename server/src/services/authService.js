import bcrypt from 'bcryptjs'
import pool from '../config/db.js'
import { generateUniqueAccountNumber, generateUniqueCardNumber } from '../utils/numbers.js'
import {
  createSignupSession,
  deleteSignupSession,
  getSignupSession,
  mergeSignupSession,
} from './signupSessionService.js'
import { addCredit } from './transactionService.js'
import { findByCardNumber } from './accountService.js'

const SALT_ROUNDS = 10

export async function emailExists(email) {
  const [rows] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email])
  return rows.length > 0
}

export async function startSignupStep1(body) {
  if (await emailExists(body.email)) {
    return { error: 'EMAIL_TAKEN' }
  }
  const signupToken = createSignupSession({
    fullName: body.fullName,
    email: body.email,
    phone: body.phone,
  })
  return { signupToken }
}

export function continueSignupStep2(signupToken, body) {
  const merged = mergeSignupSession(signupToken, {
    dob: body.dob,
    gender: body.gender,
    address: body.address,
    city: body.city,
    state: body.state,
    pincode: body.pincode,
    occupation: body.occupation,
    income: body.income,
    education: body.education,
    maritalStatus: body.maritalStatus,
  })
  if (!merged) return { error: 'INVALID_OR_EXPIRED_SIGNUP_SESSION' }
  return { ok: true }
}

export async function finalizeSignup(signupToken, { pin, accountType }) {
  const s = getSignupSession(signupToken)
  if (!s) return { error: 'INVALID_OR_EXPIRED_SIGNUP_SESSION' }

  const d = s.data
  if (await emailExists(d.email)) {
    return { error: 'EMAIL_TAKEN' }
  }

  const pinHash = await bcrypt.hash(String(pin), SALT_ROUNDS)
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const [userRes] = await conn.query(
      `INSERT INTO users (full_name, email, phone, pin_hash) VALUES (?, ?, ?, ?)`,
      [d.fullName, d.email, d.phone, pinHash]
    )
    const userId = userRes.insertId

    await conn.query(
      `INSERT INTO user_profiles
       (user_id, dob, gender, address, city, state, pincode, occupation, income, education, marital_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        d.dob || null,
        d.gender || null,
        d.address || null,
        d.city || null,
        d.state || null,
        d.pincode || null,
        d.occupation || null,
        d.income || null,
        d.education || null,
        d.maritalStatus || null,
      ]
    )

    const accountNumber = await generateUniqueAccountNumber(conn)
    const cardNumber = await generateUniqueCardNumber(conn)
    const [accRes] = await conn.query(
      `INSERT INTO accounts (user_id, card_number, account_number, account_type)
       VALUES (?, ?, ?, ?)`,
      [userId, cardNumber, accountNumber, accountType || 'Savings']
    )
    const accountId = accRes.insertId

    await addCredit(accountId, 500, 'Welcome bonus — NovaBank (simulated)', conn)

    await conn.commit()
    deleteSignupSession(signupToken)
    return {
      userId,
      accountId,
      cardNumber,
      accountNumber,
      accountType: accountType || 'Savings',
    }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
}

export async function verifyLogin(cardNumber, pin) {
  const row = await findByCardNumber(cardNumber)
  if (!row) return null
  const ok = await bcrypt.compare(String(pin), row.pin_hash)
  if (!ok) return null
  return {
    userId: row.user_id,
    accountId: row.id,
    fullName: row.full_name,
    email: row.email,
  }
}

export async function changePin(userId, currentPin, newPin) {
  const [rows] = await pool.query('SELECT id, pin_hash FROM users WHERE id = ? LIMIT 1', [userId])
  const user = rows[0]
  if (!user) {
    const err = new Error('User not found')
    err.code = 'NOT_FOUND'
    throw err
  }
  const ok = await bcrypt.compare(String(currentPin), user.pin_hash)
  if (!ok) {
    const err = new Error('Current PIN is incorrect')
    err.code = 'INVALID_PIN'
    throw err
  }
  const pinHash = await bcrypt.hash(String(newPin), SALT_ROUNDS)
  await pool.query('UPDATE users SET pin_hash = ? WHERE id = ?', [pinHash, userId])
}
