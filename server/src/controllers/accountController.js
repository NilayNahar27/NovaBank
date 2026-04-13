import { validationResult } from 'express-validator'
import { getSummaryForUser, getProfile, updateProfile, findByUserId } from '../services/accountService.js'
import { getBalanceForAccount } from '../services/balanceService.js'
import * as authService from '../services/authService.js'
import pool from '../config/db.js'

function handleValidation(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() })
    return true
  }
  return false
}

export async function summary(req, res, next) {
  try {
    const data = await getSummaryForUser(req.user.userId)
    if (!data) return res.status(404).json({ error: 'Account not found' })
    res.json({
      account: {
        id: data.account.id,
        cardNumber: data.account.card_number,
        accountNumber: data.account.account_number,
        accountType: data.account.account_type,
        ifscCode: data.account.ifsc_code,
        branchName: data.account.branch_name,
      },
      balance: data.balance,
      recentTransactions: data.recent,
      chart: data.chart,
      monthlyCredits: data.month.credits,
      monthlyDebits: data.month.debits,
    })
  } catch (e) {
    next(e)
  }
}

export async function balance(req, res, next) {
  try {
    const bal = await getBalanceForAccount(req.user.accountId)
    res.json({ balance: bal })
  } catch (e) {
    next(e)
  }
}

export async function changePin(req, res, next) {
  try {
    if (handleValidation(req, res)) return
    const { currentPin, newPin } = req.body
    await authService.changePin(req.user.userId, currentPin, newPin)
    res.json({ ok: true, message: 'PIN updated successfully' })
  } catch (e) {
    next(e)
  }
}

export async function changePassword(req, res, next) {
  try {
    if (handleValidation(req, res)) return
    const { currentPassword, newPassword } = req.body
    await authService.changePassword(req.user.userId, currentPassword, newPassword)
    res.json({ ok: true, message: 'Password updated successfully' })
  } catch (e) {
    next(e)
  }
}

export async function details(req, res, next) {
  try {
    const account = await findByUserId(req.user.userId)
    if (!account) return res.status(404).json({ error: 'Account not found' })
    const [rows] = await pool.query(
      `SELECT customer_id, full_name, email, phone, created_at FROM users WHERE id = ? LIMIT 1`,
      [req.user.userId]
    )
    const u = rows[0]
    res.json({
      customerId: u.customer_id,
      fullName: u.full_name,
      email: u.email,
      phone: u.phone,
      memberSince: u.created_at,
      account: {
        id: account.id,
        accountNumber: account.account_number,
        accountType: account.account_type,
        ifscCode: account.ifsc_code,
        branchName: account.branch_name,
        cardNumber: account.card_number,
        createdAt: account.created_at,
      },
    })
  } catch (e) {
    next(e)
  }
}

export async function profileGet(req, res, next) {
  try {
    const p = await getProfile(req.user.userId)
    if (!p) return res.status(404).json({ error: 'Profile not found' })
    res.json({ profile: p })
  } catch (e) {
    next(e)
  }
}

export async function profilePatch(req, res, next) {
  try {
    if (handleValidation(req, res)) return
    await updateProfile(req.user.userId, req.body)
    const p = await getProfile(req.user.userId)
    res.json({ profile: p })
  } catch (e) {
    next(e)
  }
}
