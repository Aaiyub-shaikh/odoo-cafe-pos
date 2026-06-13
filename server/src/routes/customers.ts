import { Router, Request, Response } from 'express'
import { Customer } from '../models/Customer.js'
import { serialize, serializeMany } from '../utils/serialize.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { search } = req.query
    let query = Customer.find()
    if (search && typeof search === 'string') {
      const regex = new RegExp(search, 'i')
      query = Customer.find({ $or: [{ name: regex }, { email: regex }, { phone: regex }] })
    }
    const customers = await query.sort({ createdAt: -1 })
    res.json(
      serializeMany(customers).map((c) => ({
        ...c,
        createdAt: (c.createdAt as Date)?.toISOString?.() ?? c.createdAt,
      }))
    )
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const doc = await Customer.create(req.body)
    const obj = serialize<Record<string, unknown>>(doc)
    obj.createdAt = doc.createdAt.toISOString()
    res.status(201).json(obj)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.patch('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const doc = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!doc) return res.status(404).json({ error: 'Not found' })
    const obj = serialize<Record<string, unknown>>(doc)
    obj.createdAt = doc.createdAt.toISOString()
    res.json(obj)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    await Customer.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

export default router
