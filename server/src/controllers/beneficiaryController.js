import { validationResult } from 'express-validator'
import * as beneficiaryService from '../services/beneficiaryService.js'
import * as notificationService from '../services/notificationService.js'

function handleValidation(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() })
    return true
  }
  return false
}

export async function list(req, res, next) {
  try {
    const rows = await beneficiaryService.listByUser(req.user.userId)
    res.json({ beneficiaries: rows })
  } catch (e) {
    next(e)
  }
}

export async function create(req, res, next) {
  try {
    if (handleValidation(req, res)) return
    const id = await beneficiaryService.createBeneficiary(req.user.userId, req.body)
    await notificationService.createNotification(
      req.user.userId,
      'beneficiary',
      'Beneficiary added',
      `${req.body.beneficiaryName || 'Payee'} saved to your list.`
    )
    res.status(201).json({ id })
  } catch (e) {
    next(e)
  }
}

export async function remove(req, res, next) {
  try {
    if (handleValidation(req, res)) return
    const ok = await beneficiaryService.removeBeneficiary(req.user.userId, Number(req.params.id))
    if (!ok) return res.status(404).json({ error: 'Beneficiary not found' })
    res.json({ ok: true })
  } catch (e) {
    next(e)
  }
}
