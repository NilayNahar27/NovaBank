import crypto from 'crypto'
import pool from '../config/db.js'

function randomDigits(len) {
  let out = ''
  while (out.length < len) {
    const byte = crypto.randomInt(0, 10)
    if (out.length === 0 && byte === 0) continue
    out += String(byte)
  }
  return out
}

/** 12-digit account number, uniqueness checked against DB */
export async function generateUniqueAccountNumber(connection = null) {
  const exec = connection || pool
  for (let i = 0; i < 25; i++) {
    const num = randomDigits(12)
    const [rows] = await exec.query('SELECT id FROM accounts WHERE account_number = ? LIMIT 1', [
      num,
    ])
    if (!rows.length) return num
  }
  throw new Error('Could not generate unique account number')
}

/** 16-digit card number (no spaces), uniqueness checked */
export async function generateUniqueCardNumber(connection = null) {
  const exec = connection || pool
  for (let i = 0; i < 25; i++) {
    const num = randomDigits(16)
    const [rows] = await exec.query('SELECT id FROM accounts WHERE card_number = ? LIMIT 1', [num])
    if (!rows.length) return num
  }
  throw new Error('Could not generate unique card number')
}
