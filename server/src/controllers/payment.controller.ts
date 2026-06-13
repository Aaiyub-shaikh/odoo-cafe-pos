import { Request, Response } from 'express'
import { Order } from '../models/Order.js'
import { formatOrder } from '../utils/orderFormat.js'
import { applyOrderPaymentSideEffects } from '../services/orderCompletion.js'
import { emitKitchenNewOrder } from '../socket.js'

const PAYMENT_DELAY_MS = 1500

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fakePayment(req: Request, res: Response) {
  try {
    const { orderId, paymentMethod, razorpayPaymentId, razorpayOrderId } = req.body

    if (!orderId) {
      return res.status(400).json({ error: 'orderId is required' })
    }

    console.log('[Payment] Processing fake payment for order:', orderId)

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    if (order.paymentStatus === 'SUCCESS') {
      return res.status(400).json({ error: 'Order is already paid' })
    }

    await delay(PAYMENT_DELAY_MS)

    order.paymentStatus = 'SUCCESS'
    order.status = 'CONFIRMED'
    if (paymentMethod) order.paymentMethod = paymentMethod
    if (razorpayPaymentId) order.razorpayPaymentId = razorpayPaymentId
    if (razorpayOrderId) order.razorpayOrderId = razorpayOrderId
    await order.save()

    try {
      await applyOrderPaymentSideEffects(order)
    } catch (sideEffectErr) {
      console.error('[Payment] Side effects failed (order still confirmed):', sideEffectErr)
    }

    const updatedOrder = formatOrder(order.toObject())
    emitKitchenNewOrder(updatedOrder)

    console.log('[Payment] Payment SUCCESS — order sent to kitchen:', order.orderNumber)

    res.json(updatedOrder)
  } catch (err) {
    console.error('[Payment] fakePayment error:', err)
    res.status(500).json({ error: String(err) })
  }
}

export async function paymentFail(req: Request, res: Response) {
  try {
    const { orderId } = req.body

    if (!orderId) {
      return res.status(400).json({ error: 'orderId is required' })
    }

    console.log('[Payment] Marking payment as FAILED for order:', orderId)

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    order.paymentStatus = 'FAILED'
    await order.save()

    console.log('[Payment] Payment FAILED for order:', order.orderNumber)

    res.json(formatOrder(order.toObject()))
  } catch (err) {
    console.error('[Payment] paymentFail error:', err)
    res.status(500).json({ error: String(err) })
  }
}
