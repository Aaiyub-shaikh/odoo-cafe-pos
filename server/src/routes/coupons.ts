import { Router, Request, Response } from 'express'
import { Coupon } from '../models/Coupon.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.get('/validate/:code', authMiddleware, async (req: Request, res: Response) => {
  try {
    const coupon = await Coupon.findOne({
      code: req.params.code.toUpperCase(),
      active: true,
    })
    if (!coupon) return res.json(null)
    res.json({
      id: coupon._id.toString(),
      code: coupon.code,
      percentage: coupon.percentage,
      fixedAmount: coupon.fixedAmount,
      active: coupon.active,
      usageCount: coupon.usageCount,
      createdAt: coupon.createdAt.toISOString(),
    })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

export default router
