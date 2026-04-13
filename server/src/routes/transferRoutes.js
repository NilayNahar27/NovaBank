import { Router } from 'express'
import { body, param, query } from 'express-validator'
import * as ctrl from '../controllers/transferController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

const createRules = [
  body('amount')
    .isFloat({ gt: 0 })
    .toFloat()
    .custom((v) => v <= 1_000_000)
    .withMessage('Invalid amount'),
  body('beneficiaryId').optional().isInt({ min: 1 }).toInt(),
  body('beneficiaryName').optional().trim().isLength({ min: 2, max: 120 }),
  body('bankName').optional().trim().isLength({ min: 2, max: 120 }),
  body('accountNumber').optional().trim().isLength({ min: 6, max: 20 }),
  body('ifscCode').optional().trim().isLength({ min: 8, max: 20 }),
  body('remarks').optional().trim().isLength({ max: 255 }),
  body().custom((_, { req }) => {
    const v = req.body
    if (v.beneficiaryId) return true
    if (v.beneficiaryName && v.bankName && v.accountNumber && v.ifscCode) return true
    throw new Error('Provide beneficiaryId or full payee details')
  }),
]

router.post('/', createRules, ctrl.create)
router.get('/history', [query('limit').optional().isInt({ min: 1, max: 100 }).toInt()], ctrl.history)
router.get('/:id', [param('id').isInt({ min: 1 }).toInt()], ctrl.one)

export default router
