import { Router, Request, Response } from 'express'
import { Order } from '../models/Order.js'
import { Product } from '../models/Product.js'
import { Category } from '../models/Category.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.get('/dashboard', authMiddleware, async (_req: Request, res: Response) => {
  try {
    const paidOrders = await Order.find({ status: 'paid' })
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
      customers: await Order.distinct('customerId').then((ids) => ids.filter(Boolean).length),
      productsSold,
    })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.get('/sales-trend', authMiddleware, async (_req: Request, res: Response) => {
  try {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const orders = await Order.find({ status: 'paid' })
    const data = days.map((date, i) => {
      const dayOrders = orders.filter((_, idx) => idx % 7 === i)
      return {
        date,
        sales: dayOrders.reduce((s, o) => s + o.items.length, 0),
        revenue: dayOrders.reduce((s, o) => s + o.total, 0),
        orders: dayOrders.length,
      }
    })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.get('/top-products', authMiddleware, async (_req: Request, res: Response) => {
  try {
    const orders = await Order.find({ status: 'paid' })
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

router.get('/top-categories', authMiddleware, async (_req: Request, res: Response) => {
  try {
    const products = await Product.find()
    const categories = await Category.find()
    const orders = await Order.find({ status: 'paid' })
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
