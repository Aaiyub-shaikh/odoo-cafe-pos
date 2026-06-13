import mongoose, { Schema } from 'mongoose'

const couponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    percentage: { type: Number },
    fixedAmount: { type: Number },
    active: { type: Boolean, default: true },
    usageCount: { type: Number, default: 0 },
    firstTimeUserOnly: { type: Boolean, default: false },
    maxUsesPerUser: { type: Number, default: null },
  },
  { timestamps: true }
)

export const Coupon = mongoose.model('Coupon', couponSchema)
