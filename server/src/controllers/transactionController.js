import { validationResult } from 'express-validator'
import * as txService from '../services/transactionService.js'
import { getBalanceForAccount } from '../services/balanceService.js'

function handleValidation(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() })
    return true
  }
  return false
}

export async function deposit(req, res, next) {
  try {
    if (handleValidation(req, res)) return
    const { amount, description } = req.body
    const balance = await txService.deposit(req.user.accountId, amount, description, req.user.userId)
    res.json({ balance, message: 'Deposit successful' })
  } catch (e) {
    next(e)
  }
}

export async function withdraw(req, res, next) {
  try {
    if (handleValidation(req, res)) return
    const { amount, description } = req.body
    const balance = await txService.withdraw(req.user.accountId, amount, description, req.user.userId)
    res.json({ balance, message: 'Withdrawal successful' })
  } catch (e) {
    next(e)
  }
}

const FAST_AMOUNTS = new Set([500, 1000, 2000, 5000])

export async function fastCash(req, res, next) {
  try {
    if (handleValidation(req, res)) return
    const amount = Number(req.body.amount)
    if (!FAST_AMOUNTS.has(amount)) {
      return res.status(400).json({ error: 'Invalid fast cash amount' })
    }
    const balance = await txService.withdraw(
      req.user.accountId,
      amount,
      `Fast cash ₹${amount}`,
      req.user.userId
    )
    res.json({ balance, message: 'Fast cash dispensed' })
  } catch (e) {
    next(e)
  }
}

export async function history(req, res, next) {
  try {
    if (handleValidation(req, res)) return
    const { limit, page, type, category, from, to, q } = req.query
    const { rows, total, page: p, limit: l } = await txService.listHistory(req.user.accountId, {
      limit,
      page,
      type,
      category,
      from,
      to,
      q,
    })
    const balance = await getBalanceForAccount(req.user.accountId)
    res.json({
      transactions: rows,
      pagination: { total, page: p, limit: l, totalPages: Math.max(1, Math.ceil(total / l)) },
      currentBalance: balance,
    })
  } catch (e) {
    next(e)
  }
}
