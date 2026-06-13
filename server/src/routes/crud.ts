import { Router, Request, Response } from 'express'
import { Model } from 'mongoose'
import { serialize, serializeMany } from '../utils/serialize.js'
import { authMiddleware } from '../middleware/auth.js'

export function createCrudRouter<T>(model: Model<T>, options?: { populate?: string }) {
  const router = Router()

  router.get('/', authMiddleware, async (_req: Request, res: Response) => {
    try {
      let query = model.find().sort({ createdAt: -1 })
      if (options?.populate) query = query.populate(options.populate)
      const docs = await query.exec()
      res.json(serializeMany(docs))
    } catch (err) {
      res.status(500).json({ error: String(err) })
    }
  })

  router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
      let query = model.findById(req.params.id)
      if (options?.populate) query = query.populate(options.populate)
      const doc = await query.exec()
      if (!doc) return res.status(404).json({ error: 'Not found' })
      res.json(serialize(doc))
    } catch (err) {
      res.status(500).json({ error: String(err) })
    }
  })

  router.post('/', authMiddleware, async (req: Request, res: Response) => {
    try {
      const doc = await model.create(req.body)
      res.status(201).json(serialize(doc))
    } catch (err) {
      res.status(500).json({ error: String(err) })
    }
  })

  router.patch('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
      const doc = await model.findByIdAndUpdate(req.params.id, req.body, { new: true })
      if (!doc) return res.status(404).json({ error: 'Not found' })
      res.json(serialize(doc))
    } catch (err) {
      res.status(500).json({ error: String(err) })
    }
  })

  router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
      const doc = await model.findByIdAndDelete(req.params.id)
      if (!doc) return res.status(404).json({ error: 'Not found' })
      res.json({ success: true })
    } catch (err) {
      res.status(500).json({ error: String(err) })
    }
  })

  return router
}
