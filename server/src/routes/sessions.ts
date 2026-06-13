import { Router, Request, Response } from 'express'
import { PosSession } from '../models/PosSession.js'
import { serialize } from '../utils/serialize.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'

const router = Router()

router.get('/active', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const session = await PosSession.findOne({ employeeId: req.userId, status: 'open' })
    if (!session) return res.json(null)
    const obj = serialize<Record<string, unknown>>(session)
    obj.openedAt = session.openedAt.toISOString()
    res.json(obj)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.post('/open', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await PosSession.updateMany({ employeeId: req.userId, status: 'open' }, { status: 'closed', closedAt: new Date() })
    const session = await PosSession.create({
      employeeId: req.userId,
      employeeName: req.body.employeeName,
      openingCash: req.body.openingCash ?? 5000,
      status: 'open',
    })
    const obj = serialize<Record<string, unknown>>(session)
    obj.openedAt = session.openedAt.toISOString()
    res.status(201).json(obj)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.patch('/:id/close', authMiddleware, async (req: Request, res: Response) => {
  try {
    const session = await PosSession.findByIdAndUpdate(
      req.params.id,
      { status: 'closed', closedAt: new Date() },
      { new: true }
    )
    if (!session) return res.status(404).json({ error: 'Not found' })
    res.json(serialize(session))
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.patch('/:id/stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { sales } = req.body
    const session = await PosSession.findByIdAndUpdate(
      req.params.id,
      { $inc: { totalSales: sales, orderCount: 1 } },
      { new: true }
    )
    if (!session) return res.status(404).json({ error: 'Not found' })
    const obj = serialize<Record<string, unknown>>(session)
    obj.openedAt = session.openedAt.toISOString()
    res.json(obj)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

export default router
