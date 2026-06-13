import mongoose, { Schema } from 'mongoose'

const promotionSchema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['product', 'order'], required: true },
    minQuantity: { type: Number },
    minOrderAmount: { type: Number },
    discount: { type: Number, required: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    active: { type: Boolean, default: true },
    productIds: [{ type: String }],
  },
  { timestamps: true }
)

export const Promotion = mongoose.model('Promotion', promotionSchema)
