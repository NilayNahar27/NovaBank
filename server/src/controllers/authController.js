import { validationResult } from 'express-validator'
import { signToken } from '../utils/jwt.js'
import * as authService from '../services/authService.js'
import { getSummaryForUser } from '../services/accountService.js'
import * as notificationService from '../services/notificationService.js'
import pool from '../config/db.js'

function handleValidation(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() })
    return true
  }
  return false
}

export async function signupStep1(req, res, next) {
  try {
    if (handleValidation(req, res)) return
    const result = await authService.startSignupStep1(req.body)
    if (result.error === 'EMAIL_TAKEN') {
      return res.status(400).json({ error: 'This email is already registered' })
    }
    res.status(201).json({ signupToken: result.signupToken })
  } catch (e) {
    next(e)
  }
}

export async function signupStep2(req, res, next) {
  try {
    if (handleValidation(req, res)) return
    const { signupToken, ...profile } = req.body
    const result = authService.continueSignupStep2(signupToken, profile)
    if (result.error) {
      return res.status(400).json({ error: 'Signup session expired. Please start again.' })
    }
    res.json({ ok: true })
  } catch (e) {
    next(e)
  }
}

export async function signupStep3(req, res, next) {
  try {
    if (handleValidation(req, res)) return
    const { signupToken, pin, password, accountType } = req.body
    const result = await authService.finalizeSignup(signupToken, { pin, password, accountType })
    if (result.error === 'INVALID_OR_EXPIRED_SIGNUP_SESSION') {
      return res.status(400).json({ error: 'Signup session expired. Please start again.' })
    }
    if (result.error === 'EMAIL_TAKEN') {
      return res.status(400).json({ error: 'This email is already registered' })
    }
    const token = signToken({ sub: result.userId, accountId: result.accountId })
    res.status(201).json({
      token,
      account: {
        cardNumber: result.cardNumber,
        accountNumber: result.accountNumber,
        accountType: result.accountType,
      },
    })
  } catch (e) {
    next(e)
  }
}

export async function login(req, res, next) {
  try {
    const { email, password, cardNumber, pin } = req.body || {}
    let user = null
    if (email && password) {
      user = await authService.verifyLoginByEmail(email, password)
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' })
      }
    } else if (cardNumber && pin) {
      user = await authService.verifyLogin(cardNumber, pin)
      if (!user) {
        return res.status(401).json({ error: 'Invalid card number or PIN' })
      }
    } else {
      return res.status(400).json({ error: 'Provide email and password, or card number and PIN' })
    }
    const token = signToken({ sub: user.userId, accountId: user.accountId })
    res.json({
      token,
      user: { fullName: user.fullName, email: user.email },
    })
  } catch (e) {
    next(e)
  }
}

export async function me(req, res, next) {
  try {
    const summary = await getSummaryForUser(req.user.userId)
    if (!summary) {
      return res.status(404).json({ error: 'Account not found' })
    }
    const { account, balance, recent, chart, month } = summary
    const [userRows] = await pool.query(
      'SELECT id, customer_id, full_name, email, phone, password_hash, created_at FROM users WHERE id = ?',
      [req.user.userId]
    )
    const user = userRows[0]
    const unread = await notificationService.unreadCount(req.user.userId)
    res.json({
      user: {
        id: user.id,
        customerId: user.customer_id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        createdAt: user.created_at,
        hasPassword: Boolean(user.password_hash),
      },
      account: {
        id: account.id,
        cardNumber: account.card_number,
        accountNumber: account.account_number,
        accountType: account.account_type,
        ifscCode: account.ifsc_code,
        branchName: account.branch_name,
        createdAt: account.created_at,
      },
      balance,
      recentTransactions: recent,
      chart,
      monthlyCredits: month.credits,
      monthlyDebits: month.debits,
      unreadNotifications: unread,
    })
  } catch (e) {
    next(e)
  }
}
