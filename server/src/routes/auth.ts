import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'
import { serialize } from '../utils/serialize.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'

const router = Router()

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function formatUser(user: InstanceType<typeof User>) {
  const data = serialize<Record<string, unknown>>(user)
  data.createdAt = user.createdAt.toISOString()
  data.updatedAt = user.updatedAt.toISOString()
  return data
}

function signToken(user: InstanceType<typeof User>) {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  )
}

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email?.trim() || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }
    if (!EMAIL_RE.test(email.trim())) {
      return res.status(400).json({ error: 'Invalid email address' })
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() })
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }
    if (user.status === 'archived') {
      return res.status(403).json({ error: 'This account has been deactivated' })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    res.json({ token: signToken(user), user: formatUser(user) })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body

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

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: 'admin',
      status: 'active',
    })

    res.status(201).json({ token: signToken(user), user: formatUser(user) })
  } catch (err: unknown) {
    const mongoErr = err as { code?: number }
    if (mongoErr.code === 11000) {
      return res.status(409).json({ error: 'Email already registered' })
    }
    console.error('Signup error:', err)
    res.status(500).json({ error: 'Registration failed. Please try again.' })
  }
})

router.post('/signup/employee', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body

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

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: 'cashier',
      status: 'active',
    })

    res.status(201).json({ token: signToken(user), user: formatUser(user) })
  } catch (err: unknown) {
    const mongoErr = err as { code?: number }
    if (mongoErr.code === 11000) {
      return res.status(409).json({ error: 'Email already registered' })
    }
    console.error('Employee signup error:', err)
    res.status(500).json({ error: 'Registration failed. Please try again.' })
  }
})

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })
    if (user.status === 'archived') {
      return res.status(403).json({ error: 'This account has been deactivated' })
    }
    res.json(formatUser(user))
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.patch('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, avatar } = req.body
    const update: Record<string, unknown> = {}
    if (name?.trim()) update.name = name.trim()
    if (email?.trim()) {
      if (!EMAIL_RE.test(email.trim())) {
        return res.status(400).json({ error: 'Invalid email address' })
      }
      update.email = email.trim().toLowerCase()
    }
    if (avatar !== undefined) update.avatar = avatar

    const user = await User.findByIdAndUpdate(req.userId, update, { new: true, runValidators: true })
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(formatUser(user))
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

export default router
