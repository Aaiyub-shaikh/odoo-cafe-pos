import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { serialize, serializeMany } from '../utils/serialize.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.get('/', authMiddleware, async (_req: Request, res: Response) => {
  try {
    const users = await User.find().sort({ createdAt: -1 })
    res.json(
      serializeMany(users).map((u) => ({
        ...u,
        createdAt: (u.createdAt as Date)?.toISOString?.() ?? u.createdAt,
      }))
    )
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const hashed = await bcrypt.hash(req.body.password || 'password123', 10)
    const user = await User.create({ ...req.body, password: hashed })
    const obj = serialize<Record<string, unknown>>(user)
    obj.createdAt = user.createdAt.toISOString()
    res.status(201).json(obj)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.patch('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const update = { ...req.body }
    if (update.password) {
      update.password = await bcrypt.hash(update.password, 10)
    } else {
      delete update.password
    }
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true })
    if (!user) return res.status(404).json({ error: 'Not found' })
    const obj = serialize<Record<string, unknown>>(user)
    obj.createdAt = user.createdAt.toISOString()
    res.json(obj)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.patch('/:id/archive', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'archived' }, { new: true })
    if (!user) return res.status(404).json({ error: 'Not found' })
    res.json(serialize(user))
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

export default router
