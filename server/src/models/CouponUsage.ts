import mongoose, { Schema } from 'mongoose'

const couponUsageSchema = new Schema(
  {
    couponId: { type: Schema.Types.ObjectId, ref: 'Coupon', required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    usedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
)

couponUsageSchema.index({ couponId: 1, customerId: 1 })

export const CouponUsage = mongoose.model('CouponUsage', couponUsageSchema)
