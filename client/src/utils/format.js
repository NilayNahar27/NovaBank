export function formatINR(amount) {
  const n = Number(amount)
  if (Number.isNaN(n)) return '—'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(n)
}

export function formatDateTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d)
}

export function maskCard(cardNumber) {
  const s = String(cardNumber || '').replace(/\s/g, '')
  if (s.length < 8) return '•••• •••• •••• ••••'
  const last4 = s.slice(-4)
  return `•••• •••• •••• ${last4}`
}

export function maskAccount(accountNumber) {
  const s = String(accountNumber || '').replace(/\s/g, '')
  if (s.length < 5) return '•••••'
  return `••••••${s.slice(-4)}`
}

/** Groups digits as 4532 0151 1283 0366 for display / login field. */
export function formatCardGroups(cardNumber) {
  const d = String(cardNumber || '').replace(/\D/g, '')
  return d.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}
