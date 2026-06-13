import mongoose, { Schema } from 'mongoose'

const couponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    percentage: { type: Number },
    fixedAmount: { type: Number },
    active: { type: Boolean, default: true },
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export const Coupon = mongoose.model('Coupon', couponSchema)
