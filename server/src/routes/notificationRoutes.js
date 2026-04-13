import { Router } from 'express'
import { param, query } from 'express-validator'
import * as ctrl from '../controllers/notificationController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

router.get('/', [query('limit').optional().isInt({ min: 1, max: 100 }).toInt()], ctrl.list)
router.patch('/read-all', ctrl.markAllRead)
router.patch('/:id/read', [param('id').isInt({ min: 1 }).toInt()], ctrl.markRead)

export default router
