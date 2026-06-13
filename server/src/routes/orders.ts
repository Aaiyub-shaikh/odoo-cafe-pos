import { Router, Request, Response } from 'express'
import { Order } from '../models/Order.js'
import { Customer } from '../models/Customer.js'
import { PosSession } from '../models/PosSession.js'
import { serialize, serializeMany } from '../utils/serialize.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

async function nextOrderNumber() {
  const count = await Order.countDocuments()
  return `ORD-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`
}

function formatOrder(doc: Record<string, unknown>) {
  const obj = serialize<Record<string, unknown>>(doc)
  obj.customerId = obj.customerId ? String(obj.customerId) : undefined
  obj.employeeId = String(obj.employeeId)
  obj.sessionId = obj.sessionId ? String(obj.sessionId) : undefined
  obj.createdAt = (doc.createdAt as Date)?.toISOString?.() ?? obj.createdAt
  obj.updatedAt = (doc.updatedAt as Date)?.toISOString?.() ?? obj.updatedAt
  if (Array.isArray(obj.items)) {
    obj.items = (obj.items as Record<string, unknown>[]).map((item) => ({
      ...item,
      id: item.id || item._id,
    }))
  }
  return obj
}

router.get('/', authMiddleware, async (_req: Request, res: Response) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 })
    res.json(orders.map((o) => formatOrder(o.toObject())))
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.get('/kitchen', authMiddleware, async (_req: Request, res: Response) => {
  try {
    const orders = await Order.find({ status: 'draft' }).sort({ createdAt: -1 })
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
    const order = await Order.create({ ...req.body, orderNumber })

    if (order.status === 'paid' && order.customerId) {
      await Customer.findByIdAndUpdate(order.customerId, {
        $inc: { totalOrders: 1, totalSpent: order.total },
      })
    }

    if (order.status === 'paid' && order.sessionId) {
      await PosSession.findByIdAndUpdate(order.sessionId, {
        $inc: { totalSales: order.total, orderCount: 1 },
      })
    }

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

router.patch('/:id/items/:itemId/kitchen', authMiddleware, async (req: Request, res: Response) => {
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
