import mongoose, { Schema } from 'mongoose'

const paymentMethodSchema = new Schema(
  {
    type: { type: String, enum: ['cash', 'card', 'upi'], required: true },
    name: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    upiId: { type: String },
  },
  { timestamps: true }
)

export const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema)
