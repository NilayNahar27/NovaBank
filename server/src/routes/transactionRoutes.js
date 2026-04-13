import { Router } from 'express'
import { body, query } from 'express-validator'
import * as ctrl from '../controllers/transactionController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

const moneyRules = [
  body('amount')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be greater than zero')
    .toFloat()
    .custom((v) => v <= 1_000_000)
    .withMessage('Amount too large'),
  body('description').optional().trim().isLength({ max: 255 }),
]

router.post('/deposit', moneyRules, ctrl.deposit)
router.post('/withdraw', moneyRules, ctrl.withdraw)
router.post(
  '/fast-cash',
  [
    body('amount')
      .toInt()
      .isIn([500, 1000, 2000, 5000])
      .withMessage('Invalid fast cash amount'),
  ],
  ctrl.fastCash
)

router.get(
  '/history',
  [
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('page').optional().isInt({ min: 1, max: 10_000 }).toInt(),
    query('type').optional().isIn(['credit', 'debit']),
    query('category').optional().trim().isLength({ max: 50 }),
    query('from').optional().isISO8601(),
    query('to').optional().isISO8601(),
    query('q').optional().trim().isLength({ max: 80 }),
  ],
  ctrl.history
)

export default router
