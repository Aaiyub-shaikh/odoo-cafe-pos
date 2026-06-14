import { Router, Request, Response } from 'express'
import { Order } from '../models/Order.js'
import { Customer } from '../models/Customer.js'
import { PosSession } from '../models/PosSession.js'
import { Floor } from '../models/Floor.js'
import { Counter } from '../models/Counter.js'
import { serialize } from '../utils/serialize.js'
import { authMiddleware } from '../middleware/auth.js'
import { recordCouponUsage, validateCouponForCustomer } from './coupons.js'

const router = Router()

async function nextOrderNumber() {
  const year = new Date().getFullYear()
  const counterId = `order-${year}`
  const counter = await Counter.findByIdAndUpdate(
    counterId,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  )
  return `ORD-${year}-${String(counter.seq).padStart(3, '0')}`
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

async function applyPaidOrderSideEffects(order: InstanceType<typeof Order>) {
  if (order.customerId) {
    await Customer.findByIdAndUpdate(order.customerId, {
      $inc: { totalOrders: 1, totalSpent: order.total },
    })
  }
  if (order.sessionId) {
    await PosSession.findByIdAndUpdate(order.sessionId, {
      $inc: { totalSales: order.total, orderCount: 1 },
    })
  }
  if (order.couponCode) {
    await recordCouponUsage(
      order.couponCode,
      order._id.toString(),
      order.customerId?.toString()
    )
  }
}

async function setTableStatus(tableId: string | undefined, status: 'available' | 'occupied' | 'reserved') {
  if (!tableId) return
  const floors = await Floor.find()
  for (const floor of floors) {
    const table = floor.tables.id(tableId)
    if (table) {
      table.status = status
      await floor.save()
      return
    }
  }
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
      status: { $in: ['draft', 'paid'] },
      kitchenDismissed: { $ne: true },
    }).sort({ createdAt: -1 })
    res.json(orders.map((o) => formatOrder(o.toObject())))
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
    const body = { ...req.body }

    if (Array.isArray(body.items)) {
      body.items = body.items.map((item: Record<string, unknown>) => {
        const { id: _id, ...rest } = item
        return rest
      })
    }

    if (body.promotionId && !/^[a-f\d]{24}$/i.test(String(body.promotionId))) {
      delete body.promotionId
    }

    if (body.status === 'paid' && body.couponCode) {
      const validation = await validateCouponForCustomer(
        body.couponCode,
        body.customerId?.toString()
      )
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error })
      }
      body.couponId = validation.coupon.id
    }

    const orderNumber = await nextOrderNumber()
    const order = await Order.create({ ...body, orderNumber })

    if (order.status === 'paid') {
      await applyPaidOrderSideEffects(order)
    }

    if (order.tableId) {
      await setTableStatus(order.tableId, 'occupied')
    }

    res.status(201).json(formatOrder(order.toObject()))
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.patch('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const existing = await Order.findById(req.params.id)
    if (!existing) return res.status(404).json({ error: 'Not found' })

    const wasPaid = existing.status === 'paid'
    const body = { ...req.body }

    if (body.status === 'paid' && !wasPaid && body.couponCode) {
      const validation = await validateCouponForCustomer(
        body.couponCode,
        (body.customerId ?? existing.customerId)?.toString()
      )
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error })
      }
      body.couponId = validation.coupon.id
    }

    const order = await Order.findByIdAndUpdate(req.params.id, body, { new: true })
    if (!order) return res.status(404).json({ error: 'Not found' })

    if (order.status === 'paid' && !wasPaid) {
      await applyPaidOrderSideEffects(order)
    }

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

    const item = order.items.id(req.params.itemId as string)
    if (!item) return res.status(404).json({ error: 'Item not found' })

    item.kitchenStatus = kitchenStatus

    const allCompleted = order.items.every((i) => i.kitchenStatus === 'completed')
    if (allCompleted) {
      order.status = 'completed'
    } else if (order.status === 'completed') {
      order.status = 'draft'
    }

    await order.save()
    res.json(formatOrder(order.toObject()))
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.patch('/:id/kitchen/bulk', async (req: Request, res: Response) => {
  try {
    const { kitchenStatus, fromStatus } = req.body as {
      kitchenStatus: 'to_cook' | 'preparing' | 'completed'
      fromStatus?: 'to_cook' | 'preparing' | 'completed'
    }
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ error: 'Not found' })

    for (const item of order.items) {
      if (fromStatus) {
        if (item.kitchenStatus === fromStatus) {
          item.kitchenStatus = kitchenStatus
        }
      } else {
        item.kitchenStatus = kitchenStatus
      }
    }

    const allCompleted = order.items.every((i) => i.kitchenStatus === 'completed')
    if (allCompleted) {
      order.status = 'completed'
    } else if (order.status === 'completed') {
      order.status = 'draft'
    }

    await order.save()
    res.json(formatOrder(order.toObject()))
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.patch('/:id/kitchen/dismiss', async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ error: 'Not found' })

    order.kitchenDismissed = true

    const allCompleted = order.items.every((i) => i.kitchenStatus === 'completed')
    if (allCompleted) {
      order.status = 'completed'
      if (order.tableId) {
        await setTableStatus(order.tableId, 'available')
      }
    }

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
