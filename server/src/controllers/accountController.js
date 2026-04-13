import { validationResult } from 'express-validator'
import { getSummaryForUser } from '../services/accountService.js'
import { getBalanceForAccount } from '../services/balanceService.js'
import * as authService from '../services/authService.js'

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
      },
      balance: data.balance,
      recentTransactions: data.recent,
      chart: data.chart,
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
