import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { fakePayment, paymentFail } from '../controllers/payment.controller.js'

const router = Router()

router.post('/fake', authMiddleware, fakePayment)
router.post('/fail', authMiddleware, paymentFail)

export default router
