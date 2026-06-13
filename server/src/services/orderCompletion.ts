import { Customer } from '../models/Customer.js'
import { PosSession } from '../models/PosSession.js'
import { recordCouponUsage } from '../routes/coupons.js'

type OrderForSideEffects = {
  _id: { toString(): string }
  customerId?: { toString(): string } | null
  sessionId?: { toString(): string } | null
  total: number
  couponCode?: string
}

export async function applyOrderPaymentSideEffects(order: OrderForSideEffects) {
  if (order.customerId) {
    await Customer.findByIdAndUpdate(order.customerId, {
      $inc: { totalOrders: 1, totalSpent: order.total },
    })
  }

  if (order.sessionId) {
    await PosSession.findByIdAndUpdate(order.sessionId, {
      $inc: { totalSales: order.total, orderCount: 1 },
    })
  }

  if (order.couponCode) {
    await recordCouponUsage(
      order.couponCode,
      order._id.toString(),
      order.customerId?.toString()
    )
  }
}
