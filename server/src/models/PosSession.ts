import mongoose, { Schema } from 'mongoose'

const posSessionSchema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    employeeName: { type: String, required: true },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    openingCash: { type: Number, default: 5000 },
    totalSales: { type: Number, default: 0 },
    orderCount: { type: Number, default: 0 },
    openedAt: { type: Date, default: Date.now },
    closedAt: { type: Date },
  },
  { timestamps: true }
)

export const PosSession = mongoose.model('PosSession', posSessionSchema)
