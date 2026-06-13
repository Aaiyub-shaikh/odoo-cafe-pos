import mongoose, { Schema } from 'mongoose'

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    price: { type: Number, required: true },
    unit: { type: String, required: true },
    tax: { type: Number, default: 5 },
    description: { type: String },
    image: { type: String },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export const Product = mongoose.model('Product', productSchema)
