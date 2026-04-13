import pool from '../config/db.js'
import { sanitizeText } from '../utils/sanitize.js'
import { getBalanceForAccount } from './balanceService.js'
import * as beneficiaryService from './beneficiaryService.js'
import * as notificationService from './notificationService.js'
import { addCredit, addDebit } from './transactionService.js'
import { makeTransferReference } from '../utils/reference.js'

function normalizeAcct(n) {
  return String(n || '').replace(/\s/g, '')
}

async function findDestinationAccount(accountNumber, conn) {
  const n = normalizeAcct(accountNumber)
  const [rows] = await conn.query(
    `SELECT a.id AS account_id, a.user_id, a.account_number, u.full_name
     FROM accounts a
     JOIN users u ON u.id = a.user_id
     WHERE a.account_number = ?
     LIMIT 1`,
    [n]
  )
  return rows[0] || null
}

export async function getTransferForUser(userId, transferId) {
  const [rows] = await pool.query(
    `SELECT t.id, t.from_account_id, t.beneficiary_id, t.beneficiary_name, t.to_account_number,
            t.to_bank_name, t.to_ifsc_code, t.amount, t.remarks, t.reference_number, t.status, t.created_at,
            a.account_number AS from_account_number, a.ifsc_code AS from_ifsc_code
     FROM transfers t
     JOIN accounts a ON a.id = t.from_account_id
     WHERE t.id = ? AND a.user_id = ?
     LIMIT 1`,
    [transferId, userId]
  )
  return rows[0] || null
}

export async function listTransferHistory(userId, { limit = 40 } = {}) {
  const lim = Math.min(Number(limit) || 40, 100)
  const [rows] = await pool.query(
    `SELECT t.id, t.beneficiary_name, t.to_account_number, t.to_bank_name, t.amount, t.reference_number,
            t.status, t.created_at, t.remarks
     FROM transfers t
     JOIN accounts a ON a.id = t.from_account_id
     WHERE a.user_id = ?
     ORDER BY t.created_at DESC, t.id DESC
     LIMIT ?`,
    [userId, lim]
  )
  return rows
}

/**
 * @param {number} fromAccountId JWT account
 * @param {number} userId JWT user
 * @param {object} body
 */
export async function executeTransfer(fromAccountId, userId, body) {
  const amount = Number(body.amount)
  if (!Number.isFinite(amount) || amount <= 0) {
    const err = new Error('Invalid amount')
    err.code = 'VALIDATION'
    throw err
  }
  if (amount > 1_000_000) {
    const err = new Error('Amount exceeds demo limit')
    err.code = 'VALIDATION'
    throw err
  }

  let beneficiaryId = body.beneficiaryId ? Number(body.beneficiaryId) : null
  let beneficiaryName = sanitizeText(body.beneficiaryName, 120)
  let bankName = sanitizeText(body.bankName, 120)
  let accountNumber = body.accountNumber ? normalizeAcct(body.accountNumber) : ''
  let ifscCode = body.ifscCode ? String(body.ifscCode).trim().toUpperCase() : ''

  if (beneficiaryId) {
    const b = await beneficiaryService.findOwned(userId, beneficiaryId)
    if (!b) {
      const err = new Error('Beneficiary not found')
      err.code = 'NOT_FOUND'
      throw err
    }
    beneficiaryName = b.beneficiary_name
    bankName = b.bank_name
    accountNumber = normalizeAcct(b.account_number)
    ifscCode = String(b.ifsc_code).trim().toUpperCase()
  }

  if (!beneficiaryName || !bankName || !accountNumber || !ifscCode) {
    const err = new Error('Select a beneficiary or enter full transfer details')
    err.code = 'VALIDATION'
    throw err
  }

  const remarks = sanitizeText(body.remarks, 255) || ''

  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    const [accRows] = await conn.query(
      `SELECT a.id, a.user_id, a.account_number
       FROM accounts a
       WHERE a.id = ? FOR UPDATE`,
      [fromAccountId]
    )
    const sender = accRows[0]
    if (!sender || Number(sender.user_id) !== Number(userId)) {
      const err = new Error('Account not found')
      err.code = 'NOT_FOUND'
      throw err
    }

    if (normalizeAcct(sender.account_number) === accountNumber) {
      const err = new Error('Cannot transfer to the same account')
      err.code = 'INVALID_TRANSFER'
      throw err
    }

    const balance = await getBalanceForAccount(fromAccountId, conn)
    if (balance < amount) {
      const err = new Error('Insufficient balance')
      err.code = 'INSUFFICIENT_FUNDS'
      throw err
    }

    const referenceNumber = makeTransferReference()

    const [tRes] = await conn.query(
      `INSERT INTO transfers
       (from_account_id, beneficiary_id, beneficiary_name, to_account_number, to_bank_name, to_ifsc_code,
        amount, remarks, reference_number, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'success')`,
      [
        fromAccountId,
        beneficiaryId || null,
        beneficiaryName,
        accountNumber,
        bankName,
        ifscCode,
        amount,
        remarks,
        referenceNumber,
      ]
    )
    const transferId = tRes.insertId

    const debitDesc = sanitizeText(
      `Transfer to ${beneficiaryName} · ${bankName} · …${accountNumber.slice(-4)}`,
      255
    )
    await addDebit(fromAccountId, amount, debitDesc, conn, {
      category: 'transfer',
      referenceId: referenceNumber,
      status: 'posted',
      transferId,
    })

    const dest = await findDestinationAccount(accountNumber, conn)
    if (dest && Number(dest.account_id) !== Number(fromAccountId)) {
      const creditDesc = sanitizeText(
        `Transfer from account …${String(sender.account_number).slice(-4)} (${remarks || 'IMPS'})`,
        255
      )
      await addCredit(dest.account_id, amount, creditDesc, conn, {
        category: 'transfer',
        referenceId: referenceNumber,
        status: 'posted',
        transferId,
      })
      await notificationService.createNotification(
        dest.user_id,
        'transfer_in',
        'Funds received',
        `You received ${amount.toFixed(2)} INR. Ref ${referenceNumber}.`,
        conn
      )
    }

    await notificationService.createNotification(
      userId,
      'transfer_out',
      'Transfer successful',
      `Sent ${amount.toFixed(2)} INR to ${beneficiaryName}. Ref ${referenceNumber}.`,
      conn
    )

    await conn.commit()

    const [rows] = await pool.query(
      `SELECT id, reference_number, status, amount, created_at FROM transfers WHERE id = ? LIMIT 1`,
      [transferId]
    )
    return rows[0]
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
}
