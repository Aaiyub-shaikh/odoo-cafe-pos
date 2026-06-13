import { Router, Request, Response } from 'express'
import { Promotion } from '../models/Promotion.js'
import { authMiddleware } from '../middleware/auth.js'
import { findBestPromotion, type PromoCartLine } from '../utils/promotionEngine.js'

const router = Router()

router.post('/evaluate', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { cart, subtotal } = req.body as { cart?: PromoCartLine[]; subtotal?: number }
    const lines = cart ?? []
    const total = subtotal ?? lines.reduce((s, i) => s + i.unitPrice * i.quantity, 0)

    const promotions = await Promotion.find({ active: true }).sort({ createdAt: -1 })
    const rules = promotions.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      type: p.type as 'product' | 'order' | 'category',
      minQuantity: p.minQuantity,
      minOrderAmount: p.minOrderAmount,
      discount: p.discount,
      discountType: p.discountType as 'percentage' | 'fixed',
      active: p.active,
      productIds: p.productIds,
      categoryIds: p.categoryIds,
    }))

    const best = findBestPromotion(rules, lines, total)

    res.json({
      discount: best?.discount ?? 0,
      promotion: best
        ? {
            id: best.promotion.id,
            name: best.promotion.name,
            discount: best.discount,
          }
        : null,
    })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

export default router
