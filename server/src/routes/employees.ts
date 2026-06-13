import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { serialize, serializeMany } from '../utils/serialize.js'
import { authMiddleware, adminMiddleware, AuthRequest } from '../middleware/auth.js'

const router = Router()
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function formatEmployee(user: InstanceType<typeof User>) {
  const obj = serialize<Record<string, unknown>>(user)
  obj.createdAt = user.createdAt.toISOString()
  return obj
}

router.get('/', authMiddleware, adminMiddleware, async (_req: Request, res: Response) => {
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

router.post('/', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role } = req.body

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' })
    }
    if (!EMAIL_RE.test(email.trim())) {
      return res.status(400).json({ error: 'Invalid email address' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const exists = await User.findOne({ email: normalizedEmail })
    if (exists) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    const userRole = role === 'admin' ? 'admin' : 'cashier'
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: userRole,
      status: 'active',
    })

    res.status(201).json(formatEmployee(user))
  } catch (err: unknown) {
    const mongoErr = err as { code?: number }
    if (mongoErr.code === 11000) {
      return res.status(409).json({ error: 'Email already registered' })
    }
    res.status(500).json({ error: String(err) })
  }
})

router.patch('/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const update = { ...req.body }
    if (update.password) {
      if (String(update.password).length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' })
      }
      update.password = await bcrypt.hash(String(update.password), 10)
    } else {
      delete update.password
    }
    if (update.email) update.email = String(update.email).trim().toLowerCase()
    if (update.name) update.name = String(update.name).trim()

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true })
    if (!user) return res.status(404).json({ error: 'Not found' })
    res.json(formatEmployee(user))
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.patch('/:id/archive', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'archived' }, { new: true })
    if (!user) return res.status(404).json({ error: 'Not found' })
    res.json(serialize(user))
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.delete('/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.userId === req.params.id) {
      return res.status(400).json({ error: 'You cannot delete your own account' })
    }
    await User.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

export default router
