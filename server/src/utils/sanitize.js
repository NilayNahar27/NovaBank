/** Strip angle brackets and trim for safe display / storage in logs. */
export function sanitizeText(input, maxLen = 200) {
  if (input == null) return ''
  const s = String(input).trim().replace(/[<>]/g, '')
  return s.length > maxLen ? s.slice(0, maxLen) : s
}
