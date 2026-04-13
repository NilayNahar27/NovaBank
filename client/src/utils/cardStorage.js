/** Simulator-only: optional saved card number for login pre-fill (this device). */
const KEY = 'novabank_saved_card_number'

export function getSavedCardNumber() {
  try {
    const v = localStorage.getItem(KEY)
    return v && /^\d{14,19}$/.test(v) ? v : null
  } catch {
    return null
  }
}

export function setSavedCardNumber(digitsOnly) {
  const s = String(digitsOnly || '').replace(/\D/g, '')
  if (!/^\d{14,19}$/.test(s)) return
  try {
    localStorage.setItem(KEY, s)
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearSavedCardNumber() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
