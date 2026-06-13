import { Router, Request, Response } from 'express'
import { Category } from '../models/Category.js'
import { Product } from '../models/Product.js'
import { serialize } from '../utils/serialize.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.get('/', authMiddleware, async (_req: Request, res: Response) => {
  try {
    const categories = await Category.find().sort({ name: 1 })
    const products = await Product.find()
    const result = categories.map((cat) => {
      const obj = serialize<Record<string, unknown>>(cat)
      obj.productCount = products.filter((p) => p.categoryId.toString() === cat._id.toString()).length
      return obj
    })
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const doc = await Category.create(req.body)
    res.status(201).json(serialize(doc))
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.patch('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const doc = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!doc) return res.status(404).json({ error: 'Not found' })
    res.json(serialize(doc))
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    await Category.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

export default router
