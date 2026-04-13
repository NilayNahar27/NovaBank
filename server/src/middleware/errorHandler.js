export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }
  const code = err.code
  if (code === 'INSUFFICIENT_FUNDS') {
    return res.status(400).json({ error: err.message })
  }
  if (code === 'INVALID_PIN') {
    return res.status(400).json({ error: err.message })
  }
  if (code === 'NOT_FOUND') {
    return res.status(404).json({ error: err.message })
  }
  console.error(err)
  const status = err.status || 500
  res.status(status).json({
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
  })
}
