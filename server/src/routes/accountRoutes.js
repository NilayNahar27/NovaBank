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

const changePasswordRules = [
  body('currentPassword').isLength({ min: 1, max: 128 }).withMessage('Current password required'),
  body('newPassword')
    .isLength({ min: 8, max: 128 })
    .matches(/^(?=.*[A-Za-z])(?=.*\d).+$/)
    .withMessage('New password must be at least 8 characters and include letters and numbers'),
]

const profilePatchRules = [
  body('fullName').optional().trim().isLength({ min: 2, max: 120 }),
  body('phone').optional().trim().isLength({ min: 8, max: 20 }),
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

router.get('/summary', ctrl.summary)
router.get('/balance', ctrl.balance)
router.get('/details', ctrl.details)
router.get('/profile', ctrl.profileGet)
router.patch('/profile', profilePatchRules, ctrl.profilePatch)
router.post('/change-pin', changePinRules, ctrl.changePin)
router.post('/change-password', changePasswordRules, ctrl.changePassword)

export default router
