// Load .env before any app module reads process.env (e.g. jwt.js secret).
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/authRoutes.js'
import accountRoutes from './routes/accountRoutes.js'
import transactionRoutes from './routes/transactionRoutes.js'
import beneficiaryRoutes from './routes/beneficiaryRoutes.js'
import transferRoutes from './routes/transferRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'
import { apiLimiter } from './middleware/rateLimiter.js'

const app = express()
const PORT = process.env.PORT || 5000

const origins =
  process.env.CORS_ORIGIN?.split(',')
    .map((s) => s.trim())
    .filter(Boolean) || []

app.use(
  cors({
    origin: origins.length ? origins : true,
    credentials: true,
  })
)
app.use(express.json({ limit: '100kb' }))
app.use('/api', apiLimiter)

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'NovaBank Net Banking API' })
})

app.use('/api/auth', authRoutes)
app.use('/api/account', accountRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/beneficiaries', beneficiaryRoutes)
app.use('/api/transfers', transferRoutes)
app.use('/api/notifications', notificationRoutes)

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

app.use(errorHandler)

const server = app.listen(PORT, () => {
  console.log(`NovaBank API listening on http://localhost:${PORT}`)
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the other process or set PORT in .env.`)
  } else {
    console.error('Server failed to start:', err.message)
  }
  process.exit(1)
})
