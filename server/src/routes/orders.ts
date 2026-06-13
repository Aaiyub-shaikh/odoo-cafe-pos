import { Router, Request, Response } from 'express'
import { Order } from '../models/Order.js'
import { formatOrder } from '../utils/orderFormat.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

async function nextOrderNumber() {
  const count = await Order.countDocuments()
  return `ORD-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`
}

router.get('/', authMiddleware, async (_req: Request, res: Response) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 })
    res.json(orders.map((o) => formatOrder(o.toObject())))
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.get('/kitchen', async (_req: Request, res: Response) => {
  try {
    const orders = await Order.find({
      $or: [
        { status: 'CONFIRMED', paymentStatus: 'SUCCESS' },
        { status: 'draft' },
        { status: 'paid' },
      ],
    }).sort({ createdAt: -1 })
    const kitchen = orders.filter((o) => o.items.some((i) => i.kitchenStatus !== 'completed'))
    res.json(kitchen.map((o) => formatOrder(o.toObject())))
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ error: 'Not found' })
    res.json(formatOrder(order.toObject()))
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const orderNumber = await nextOrderNumber()
    const { status: _status, paymentStatus: _paymentStatus, ...orderData } = req.body

    const order = await Order.create({
      ...orderData,
      orderNumber,
      status: 'PENDING_PAYMENT',
      paymentStatus: 'PENDING',
    })

    console.log('[Orders] Created order (pending payment, not sent to kitchen):', order.orderNumber)

    res.status(201).json(formatOrder(order.toObject()))
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.patch('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!order) return res.status(404).json({ error: 'Not found' })
    res.json(formatOrder(order.toObject()))
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.patch('/:id/items/:itemId/kitchen', async (req: Request, res: Response) => {
  try {
    const { kitchenStatus } = req.body
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ error: 'Not found' })

    const item = order.items.id(req.params.itemId)
    if (!item) return res.status(404).json({ error: 'Item not found' })

    item.kitchenStatus = kitchenStatus
    await order.save()
    res.json(formatOrder(order.toObject()))
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    await Order.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

export default router
