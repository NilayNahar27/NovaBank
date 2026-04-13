import { validationResult } from 'express-validator'
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
    const limit = req.query.limit
    const notifications = await notificationService.listForUser(req.user.userId, { limit })
    res.json({ notifications })
  } catch (e) {
    next(e)
  }
}

export async function markRead(req, res, next) {
  try {
    if (handleValidation(req, res)) return
    const ok = await notificationService.markRead(req.user.userId, Number(req.params.id))
    if (!ok) return res.status(404).json({ error: 'Notification not found' })
    res.json({ ok: true })
  } catch (e) {
    next(e)
  }
}

export async function markAllRead(req, res, next) {
  try {
    await notificationService.markAllRead(req.user.userId)
    res.json({ ok: true })
  } catch (e) {
    next(e)
  }
}
