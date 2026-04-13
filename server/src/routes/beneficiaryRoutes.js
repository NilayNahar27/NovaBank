import { Router } from 'express'
import { body, param } from 'express-validator'
import * as ctrl from '../controllers/beneficiaryController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

const createRules = [
  body('beneficiaryName').trim().isLength({ min: 2, max: 120 }),
  body('bankName').trim().isLength({ min: 2, max: 120 }),
  body('accountNumber').trim().isLength({ min: 6, max: 20 }),
  body('ifscCode').trim().isLength({ min: 8, max: 20 }),
  body('nickname').optional().trim().isLength({ max: 80 }),
]

router.get('/', ctrl.list)
router.post('/', createRules, ctrl.create)
router.delete('/:id', [param('id').isInt({ min: 1 }).toInt()], ctrl.remove)

export default router
