import mongoose, { Schema } from 'mongoose'

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'cashier'], default: 'cashier' },
    status: { type: String, enum: ['active', 'archived'], default: 'active' },
    avatar: { type: String, default: '' },
  },
  { timestamps: true }
)

export const User = mongoose.model('User', userSchema)
