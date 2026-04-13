/**
 * Seeds a demo user + ledger transactions.
 * Run from server folder: npm run seed
 * Requires .env with valid DB credentials and existing schema.
 */
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import mysql from 'mysql2/promise'

dotenv.config()

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'novabank_atm',
    multipleStatements: true,
  })

  const pin = '1234'
  const pinHash = await bcrypt.hash(pin, 10)
  const email = 'demo@novabank.test'

  await conn.beginTransaction()
  try {
    await conn.query('DELETE FROM users WHERE email = ?', [email])

    const [u] = await conn.query(
      `INSERT INTO users (full_name, email, phone, pin_hash)
       VALUES ('Demo Customer', ?, '+919876543210', ?)`,
      [email, pinHash]
    )
    const userId = u.insertId

    await conn.query(
      `INSERT INTO user_profiles
       (user_id, dob, gender, address, city, state, pincode, occupation, income, education, marital_status)
       VALUES (?, '1990-01-15', 'Prefer not to say', '12 MG Road', 'Bengaluru', 'KA', '560001', 'Engineer', '10-20 LPA', 'Graduate', 'Single')`,
      [userId]
    )

    const cardNumber = '4532015112830366'
    const accountNumber = '120093847562'
    const [a] = await conn.query(
      `INSERT INTO accounts (user_id, card_number, account_number, account_type)
       VALUES (?, ?, ?, 'Savings')`,
      [userId, cardNumber, accountNumber]
    )
    const accountId = a.insertId

    const txs = [
      ['credit', 25000, 'Opening deposit'],
      ['credit', 500, 'Salary credit'],
      ['debit', 1200, 'ATM withdrawal'],
      ['debit', 450, 'POS purchase'],
      ['credit', 2000, 'Refund'],
    ]
    for (const [type, amount, desc] of txs) {
      await conn.query(
        `INSERT INTO transactions (account_id, type, amount, description) VALUES (?, ?, ?, ?)`,
        [accountId, type, amount, desc]
      )
    }

    await conn.commit()
    console.log('Seed complete.')
    console.log('Demo login:')
    console.log('  Card number:', cardNumber)
    console.log('  PIN:', pin)
  } catch (e) {
    await conn.rollback()
    console.error('Seed failed:', e.message)
    process.exit(1)
  } finally {
    await conn.end()
  }
}

main()
