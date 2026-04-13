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
