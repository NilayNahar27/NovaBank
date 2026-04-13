import { Router } from 'express'
import { body } from 'express-validator'
import * as auth from '../controllers/authController.js'
import { requireAuth } from '../middleware/auth.js'
import { loginLimiter } from '../middleware/rateLimiter.js'

const router = Router()

const step1Rules = [
  body('fullName').trim().isLength({ min: 2, max: 120 }).withMessage('Full name is required'),
  body('email').isEmail().normalizeEmail().isLength({ max: 255 }),
  body('phone').trim().isLength({ min: 8, max: 20 }).withMessage('Valid phone required'),
]

const step2Rules = [
  body('signupToken').isUUID().withMessage('Invalid signup session'),
  body('dob').optional({ checkFalsy: true }).isISO8601(),
  body('gender').optional().trim().isLength({ max: 30 }),
  body('address').optional().trim().isLength({ max: 500 }),
  body('city').optional().trim().isLength({ max: 100 }),
  body('state').optional().trim().isLength({ max: 100 }),
  body('pincode').optional().trim().isLength({ max: 20 }),
  body('occupation').optional().trim().isLength({ max: 100 }),
  body('income').optional().trim().isLength({ max: 50 }),
  body('education').optional().trim().isLength({ max: 100 }),
  body('maritalStatus').optional().trim().isLength({ max: 50 }),
]

const step3Rules = [
  body('signupToken').isUUID().withMessage('Invalid signup session'),
  body('pin')
    .isLength({ min: 4, max: 12 })
    .matches(/^\d+$/)
    .withMessage('PIN must be 4–12 digits'),
  body('accountType').optional().isIn(['Savings', 'Current']),
]

const loginRules = [
  body('cardNumber')
    .trim()
    .isLength({ min: 14, max: 19 })
    .withMessage('Card number required'),
  body('pin')
    .isLength({ min: 4, max: 12 })
    .matches(/^\d+$/)
    .withMessage('PIN must be numeric'),
]

router.post('/signup/step1', step1Rules, auth.signupStep1)
router.post('/signup/step2', step2Rules, auth.signupStep2)
router.post('/signup/step3', step3Rules, auth.signupStep3)
router.post('/login', loginLimiter, loginRules, auth.login)
router.get('/me', requireAuth, auth.me)

export default router
