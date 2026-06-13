import mongoose, { Schema } from 'mongoose'

const customerSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export const Customer = mongoose.model('Customer', customerSchema)
