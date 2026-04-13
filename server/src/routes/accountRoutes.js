import { Router } from 'express'
import { body } from 'express-validator'
import * as ctrl from '../controllers/accountController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

const changePinRules = [
  body('currentPin')
    .isLength({ min: 4, max: 12 })
    .matches(/^\d+$/)
    .withMessage('Current PIN invalid'),
  body('newPin')
    .isLength({ min: 4, max: 12 })
    .withMessage('New PIN must be 4–12 digits')
    .matches(/^\d+$/)
    .withMessage('New PIN must be numeric')
    .custom((value, { req }) => value !== req.body.currentPin)
    .withMessage('New PIN must be different from current PIN'),
]

router.get('/summary', ctrl.summary)
router.get('/balance', ctrl.balance)
router.post('/change-pin', changePinRules, ctrl.changePin)

export default router
