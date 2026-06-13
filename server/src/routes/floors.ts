import { Router, Request, Response } from 'express'
import { Floor } from '../models/Floor.js'
import { serialize, serializeMany } from '../utils/serialize.js'
import { authMiddleware } from '../middleware/auth.js'

function formatFloor(doc: Record<string, unknown>) {
  const obj = serialize<Record<string, unknown>>(doc)
  if (Array.isArray(obj.tables)) {
    obj.tables = (obj.tables as Record<string, unknown>[]).map((t) => ({
      ...serialize(t),
      floorId: obj.id,
    }))
  }
  return obj
}

const router = Router()

router.get('/', authMiddleware, async (_req: Request, res: Response) => {
  try {
    const floors = await Floor.find().sort({ name: 1 })
    res.json(floors.map((f) => formatFloor(f.toObject())))
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const floor = await Floor.create({ name: req.body.name, tables: [] })
    res.status(201).json(formatFloor(floor.toObject()))
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.patch('/:floorId/tables/:tableId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const floor = await Floor.findById(req.params.floorId)
    if (!floor) return res.status(404).json({ error: 'Floor not found' })

    const table = floor.tables.id(req.params.tableId)
    if (!table) return res.status(404).json({ error: 'Table not found' })

    Object.assign(table, req.body)
    await floor.save()
    res.json(formatFloor(floor.toObject()))
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.post('/:floorId/tables', authMiddleware, async (req: Request, res: Response) => {
  try {
    const floor = await Floor.findById(req.params.floorId)
    if (!floor) return res.status(404).json({ error: 'Floor not found' })

    floor.tables.push(req.body)
    await floor.save()
    res.status(201).json(formatFloor(floor.toObject()))
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.delete('/:floorId/tables/:tableId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const floor = await Floor.findById(req.params.floorId)
    if (!floor) return res.status(404).json({ error: 'Floor not found' })

    floor.tables.pull(req.params.tableId)
    await floor.save()
    res.json(formatFloor(floor.toObject()))
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

export default router
