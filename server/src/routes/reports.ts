import { Router, Request, Response } from 'express'
import { Order } from '../models/Order.js'
import { Product } from '../models/Product.js'
import { Category } from '../models/Category.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

function parseDateRange(req: Request) {
  const dateFrom = req.query.dateFrom as string | undefined
  const dateTo = req.query.dateTo as string | undefined
  const filter: Record<string, unknown> = { status: { $in: ['paid', 'completed'] } }

  if (dateFrom || dateTo) {
    filter.createdAt = {}
    if (dateFrom) {
      (filter.createdAt as Record<string, Date>).$gte = new Date(`${dateFrom}T00:00:00.000Z`)
    }
    if (dateTo) {
      (filter.createdAt as Record<string, Date>).$lte = new Date(`${dateTo}T23:59:59.999Z`)
    }
  }

  return filter
}

router.get('/dashboard', authMiddleware, async (req: Request, res: Response) => {
  try {
    const paidOrders = await Order.find(parseDateRange(req))
    const revenue = paidOrders.reduce((s, o) => s + o.total, 0)
    const totalOrders = paidOrders.length
    const avgOrderValue = totalOrders ? revenue / totalOrders : 0
    const productsSold = paidOrders.reduce(
      (s, o) => s + o.items.reduce((si, i) => si + i.quantity, 0),
      0
    )

    res.json({
      revenue,
      totalOrders,
      avgOrderValue,
      activeTables: 0,
      customers: new Set(paidOrders.map((o) => String(o.customerId)).filter(Boolean)).size,
      productsSold,
    })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.get('/sales-trend', authMiddleware, async (req: Request, res: Response) => {
  try {
    const orders = await Order.find(parseDateRange(req)).sort({ createdAt: 1 })
    const map = new Map<string, { sales: number; revenue: number; orders: number }>()

    for (const order of orders) {
      const date = (order.createdAt as Date).toISOString().split('T')[0]
      const existing = map.get(date) || { sales: 0, revenue: 0, orders: 0 }
      existing.sales += order.items.reduce((s, i) => s + i.quantity, 0)
      existing.revenue += order.total
      existing.orders += 1
      map.set(date, existing)
    }

    const data = Array.from(map.entries()).map(([date, stats]) => ({
      date,
      ...stats,
    }))

    res.json(data)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.get('/top-products', authMiddleware, async (req: Request, res: Response) => {
  try {
    const orders = await Order.find(parseDateRange(req))
    const map = new Map<string, { name: string; quantity: number; revenue: number }>()

    for (const order of orders) {
      for (const item of order.items) {
        const existing = map.get(item.productId) || { name: item.productName, quantity: 0, revenue: 0 }
        existing.quantity += item.quantity
        existing.revenue += item.lineTotal
        map.set(item.productId, existing)
      }
    }

    const result = Array.from(map.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    res.json(result)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.get('/top-categories', authMiddleware, async (req: Request, res: Response) => {
  try {
    const products = await Product.find()
    const categories = await Category.find()
    const orders = await Order.find(parseDateRange(req))
    const map = new Map<string, { name: string; color: string; quantity: number; revenue: number }>()

    for (const order of orders) {
      for (const item of order.items) {
        const product = products.find((p) => p._id.toString() === item.productId)
        if (!product) continue
        const catId = product.categoryId.toString()
        const cat = categories.find((c) => c._id.toString() === catId)
        if (!cat) continue
        const existing = map.get(catId) || { name: cat.name, color: cat.color, quantity: 0, revenue: 0 }
        existing.quantity += item.quantity
        existing.revenue += item.lineTotal
        map.set(catId, existing)
      }
    }

    res.json(Array.from(map.entries()).map(([id, data]) => ({ id, ...data })))
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

export default router
