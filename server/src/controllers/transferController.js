import { validationResult } from 'express-validator'
import * as transferService from '../services/transferService.js'
import { getBalanceForAccount } from '../services/balanceService.js'

function handleValidation(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() })
    return true
  }
  return false
}

export async function create(req, res, next) {
  try {
    if (handleValidation(req, res)) return
    const row = await transferService.executeTransfer(req.user.accountId, req.user.userId, req.body)
    const balance = await getBalanceForAccount(req.user.accountId)
    const transfer = row
      ? {
          id: Number(row.id),
          reference_number: row.reference_number,
          status: row.status,
          amount: Number(row.amount),
          created_at: row.created_at,
        }
      : null
    res.status(201).json({
      transfer,
      balance,
      message: 'Transfer completed',
    })
  } catch (e) {
    next(e)
  }
}

export async function history(req, res, next) {
  try {
    const limit = req.query.limit
    const rows = await transferService.listTransferHistory(req.user.userId, { limit })
    res.json({ transfers: rows })
  } catch (e) {
    next(e)
  }
}

export async function one(req, res, next) {
  try {
    if (handleValidation(req, res)) return
    const row = await transferService.getTransferForUser(req.user.userId, Number(req.params.id))
    if (!row) return res.status(404).json({ error: 'Transfer not found' })
    res.json({ transfer: row })
  } catch (e) {
    next(e)
  }
}
