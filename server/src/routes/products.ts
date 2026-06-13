import { Router, Request, Response } from 'express'
import { Product } from '../models/Product.js'
import { serialize, serializeMany } from '../utils/serialize.js'
import { authMiddleware } from '../middleware/auth.js'
import { createCrudRouter } from './crud.js'

const router = Router()

router.get('/', authMiddleware, async (_req: Request, res: Response) => {
  try {
    const products = await Product.find().sort({ name: 1 })
    const result = serializeMany(products).map((p) => ({
      ...p,
      categoryId: String(p.categoryId),
    }))
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const doc = await Product.create(req.body)
    const obj = serialize<Record<string, unknown>>(doc)
    obj.categoryId = String(doc.categoryId)
    res.status(201).json(obj)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.patch('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const doc = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!doc) return res.status(404).json({ error: 'Not found' })
    const obj = serialize<Record<string, unknown>>(doc)
    obj.categoryId = String(doc.categoryId)
    res.json(obj)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    await Product.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

export default router
