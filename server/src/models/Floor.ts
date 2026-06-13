import mongoose, { Schema } from 'mongoose'

const tableSchema = new Schema(
  {
    number: { type: Number, required: true },
    seats: { type: Number, required: true, min: 1 },
    active: { type: Boolean, default: true },
    status: { type: String, enum: ['available', 'occupied', 'reserved'], default: 'available' },
    x: { type: Number, default: 50 },
    y: { type: Number, default: 50 },
  },
  { _id: true }
)

const floorSchema = new Schema(
  {
    name: { type: String, required: true },
    tables: [tableSchema],
  },
  { timestamps: true }
)

export const Floor = mongoose.model('Floor', floorSchema)
