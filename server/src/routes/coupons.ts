import { Router, Request, Response } from 'express'
import { Coupon } from '../models/Coupon.js'
import { CouponUsage } from '../models/CouponUsage.js'
import { Customer } from '../models/Customer.js'
import { Order } from '../models/Order.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

function formatCoupon(coupon: InstanceType<typeof Coupon>) {
  return {
    id: coupon._id.toString(),
    code: coupon.code,
    percentage: coupon.percentage,
    fixedAmount: coupon.fixedAmount,
    active: coupon.active,
    usageCount: coupon.usageCount,
    firstTimeUserOnly: coupon.firstTimeUserOnly ?? false,
    maxUsesPerUser: coupon.maxUsesPerUser ?? null,
    createdAt: coupon.createdAt.toISOString(),
  }
}

async function validateCouponForCustomer(
  code: string,
  customerId?: string
): Promise<{ valid: true; coupon: ReturnType<typeof formatCoupon> } | { valid: false; error: string }> {
  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    active: true,
  })

  if (!coupon) {
    return { valid: false, error: 'Invalid or expired coupon code' }
  }

  if (coupon.firstTimeUserOnly) {
    if (!customerId) {
      return { valid: false, error: 'Select a customer — this coupon is for first-time customers only' }
    }
    const paidOrders = await Order.countDocuments({ customerId, status: { $in: ['paid', 'CONFIRMED'] } })
    const customer = await Customer.findById(customerId)
    if (paidOrders > 0 || (customer && customer.totalOrders > 0)) {
      return { valid: false, error: 'This coupon is for first-time customers only' }
    }
  }

  if (coupon.maxUsesPerUser != null && coupon.maxUsesPerUser > 0) {
    if (!customerId) {
      return {
        valid: false,
        error: `Select a customer — this coupon allows ${coupon.maxUsesPerUser} use(s) per customer`,
      }
    }
    const usage = await CouponUsage.countDocuments({ couponId: coupon._id, customerId })
    if (usage >= coupon.maxUsesPerUser) {
      return {
        valid: false,
        error: `This customer has already used this coupon ${coupon.maxUsesPerUser} time(s)`,
      }
    }
  }

  return { valid: true, coupon: formatCoupon(coupon) }
}

router.get('/validate/:code', authMiddleware, async (req: Request, res: Response) => {
  try {
    const customerId = req.query.customerId as string | undefined
    const result = await validateCouponForCustomer(req.params.code, customerId)
    if (!result.valid) return res.json({ valid: false, error: result.error })
    res.json({ valid: true, coupon: result.coupon })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.post('/validate', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { code, customerId } = req.body as { code?: string; customerId?: string }
    if (!code?.trim()) {
      return res.status(400).json({ valid: false, error: 'Coupon code is required' })
    }
    const result = await validateCouponForCustomer(code, customerId)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

export async function recordCouponUsage(
  couponCode: string,
  orderId: string,
  customerId?: string
): Promise<void> {
  const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true })
  if (!coupon) return

  await CouponUsage.create({
    couponId: coupon._id,
    customerId: customerId || undefined,
    orderId,
  })
  await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usageCount: 1 } })
}

export default router
