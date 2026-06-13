import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'
import { serialize } from '../utils/serialize.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'

const router = Router()

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    )

    const data = serialize<Record<string, unknown>>(user)
    data.createdAt = (user as { createdAt?: Date }).createdAt?.toISOString()
    res.json({ token, user: data })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body
    const exists = await User.findOne({ email: email.toLowerCase() })
    if (exists) return res.status(400).json({ error: 'Email already registered' })

    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email: email.toLowerCase(), password: hashed, role: 'admin' })

    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    )

    res.status(201).json({ token, user: serialize(user) })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(serialize(user))
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.patch('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, avatar } = req.body
    const user = await User.findByIdAndUpdate(req.userId, { name, email, avatar }, { new: true })
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(serialize(user))
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

export default router
