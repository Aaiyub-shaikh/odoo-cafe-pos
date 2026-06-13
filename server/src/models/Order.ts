import mongoose, { Schema } from 'mongoose'

const orderItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    lineTotal: { type: Number, required: true },
    kitchenStatus: { type: String, enum: ['to_cook', 'preparing', 'completed'], default: 'to_cook' },
  },
  { _id: true }
)

const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    customerName: { type: String },
    tableId: { type: String },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: { type: String, enum: ['draft', 'paid', 'cancelled'], default: 'draft' },
    paymentMethod: { type: String, enum: ['cash', 'card', 'upi', 'razorpay'] },
    razorpayPaymentId: { type: String },
    razorpayOrderId: { type: String },
    couponCode: { type: String },
    couponId: { type: Schema.Types.ObjectId, ref: 'Coupon' },
    promotionId: { type: Schema.Types.ObjectId, ref: 'Promotion' },
    promotionName: { type: String },
    employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    employeeName: { type: String, required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: 'PosSession' },
  },
  { timestamps: true }
)

export const Order = mongoose.model('Order', orderSchema)
