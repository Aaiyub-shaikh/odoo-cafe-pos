import { Router, Request, Response } from 'express'
import { Floor } from '../models/Floor.js'
import { serialize } from '../utils/serialize.js'
import { authMiddleware } from '../middleware/auth.js'

function formatFloor(doc: Record<string, unknown>) {
  const obj = serialize<Record<string, unknown>>(doc)
  if (Array.isArray(obj.tables)) {
    obj.tables = (obj.tables as Record<string, unknown>[]).map((t) => ({
      ...serialize(t),
      floorId: obj.id,
      active: t.active !== false,
    }))
  }
  return obj
}

function tableLayoutIndex(index: number) {
  return {
    x: 50 + (index % 5) * 120,
    y: 50 + Math.floor(index / 5) * 120,
  }
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
    const name = req.body.name?.trim()
    if (!name) return res.status(400).json({ error: 'Floor name is required' })

    const floor = await Floor.create({ name, tables: [] })
    res.status(201).json(formatFloor(floor.toObject()))
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.patch('/:floorId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const name = req.body.name?.trim()
    if (!name) return res.status(400).json({ error: 'Floor name is required' })

    const floor = await Floor.findByIdAndUpdate(req.params.floorId, { name }, { new: true })
    if (!floor) return res.status(404).json({ error: 'Floor not found' })
    res.json(formatFloor(floor.toObject()))
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.delete('/:floorId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const floor = await Floor.findByIdAndDelete(req.params.floorId)
    if (!floor) return res.status(404).json({ error: 'Floor not found' })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.post('/:floorId/tables', authMiddleware, async (req: Request, res: Response) => {
  try {
    const floor = await Floor.findById(req.params.floorId)
    if (!floor) return res.status(404).json({ error: 'Floor not found' })

    const number = Number(req.body.number)
    const seats = Number(req.body.seats)
    if (!number || number < 1) return res.status(400).json({ error: 'Valid table number is required' })
    if (!seats || seats < 1) return res.status(400).json({ error: 'Seats must be at least 1' })

    const duplicate = floor.tables.some((t) => t.number === number)
    if (duplicate) return res.status(409).json({ error: `Table ${number} already exists on this floor` })

    const layout = tableLayoutIndex(floor.tables.length)
    floor.tables.push({
      number,
      seats,
      active: req.body.active !== false,
      status: 'available',
      x: layout.x,
      y: layout.y,
    })
    await floor.save()
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

    if (req.body.number !== undefined) {
      const number = Number(req.body.number)
      if (!number || number < 1) return res.status(400).json({ error: 'Valid table number is required' })
      const duplicate = floor.tables.some((t) => t._id.toString() !== req.params.tableId && t.number === number)
      if (duplicate) return res.status(409).json({ error: `Table ${number} already exists on this floor` })
      table.number = number
    }
    if (req.body.seats !== undefined) {
      const seats = Number(req.body.seats)
      if (!seats || seats < 1) return res.status(400).json({ error: 'Seats must be at least 1' })
      table.seats = seats
    }
    if (req.body.active !== undefined) table.active = req.body.active
    if (req.body.status !== undefined) table.status = req.body.status
    if (req.body.x !== undefined) table.x = req.body.x
    if (req.body.y !== undefined) table.y = req.body.y

    await floor.save()
    res.json(formatFloor(floor.toObject()))
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.delete('/:floorId/tables/:tableId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const floor = await Floor.findById(req.params.floorId)
    if (!floor) return res.status(404).json({ error: 'Floor not found' })

    const table = floor.tables.id(req.params.tableId)
    if (!table) return res.status(404).json({ error: 'Table not found' })

    floor.tables.pull(req.params.tableId)
    await floor.save()
    res.json(formatFloor(floor.toObject()))
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

export default router
