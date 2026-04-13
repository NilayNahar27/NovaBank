import crypto from 'crypto'

/** Human-readable transfer / receipt reference */
export function makeTransferReference() {
  const t = Date.now().toString(36).toUpperCase().slice(-6)
  const r = crypto.randomBytes(3).toString('hex').toUpperCase()
  return `NBTX${t}${r}`
}
