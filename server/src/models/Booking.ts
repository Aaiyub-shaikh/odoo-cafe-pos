import mongoose, { Schema } from 'mongoose'

const bookingSchema = new Schema(
  {
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    tableId: { type: String, required: true },
    tableNumber: { type: Number, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    guests: { type: Number, required: true },
    status: { type: String, enum: ['confirmed', 'cancelled', 'completed'], default: 'confirmed' },
  },
  { timestamps: true }
)

export const Booking = mongoose.model('Booking', bookingSchema)
