import type { Floor, Table } from '@/types'

const groundFloorTables: Table[] = [
  { id: 'tbl-1', number: 1, seats: 2, floorId: 'floor-1', status: 'available', x: 50, y: 50 },
  { id: 'tbl-2', number: 2, seats: 4, floorId: 'floor-1', status: 'occupied', x: 200, y: 50 },
  { id: 'tbl-3', number: 3, seats: 4, floorId: 'floor-1', status: 'reserved', x: 350, y: 50 },
  { id: 'tbl-4', number: 4, seats: 6, floorId: 'floor-1', status: 'available', x: 50, y: 200 },
  { id: 'tbl-5', number: 5, seats: 2, floorId: 'floor-1', status: 'occupied', x: 200, y: 200 },
  { id: 'tbl-6', number: 6, seats: 8, floorId: 'floor-1', status: 'available', x: 350, y: 200 },
  { id: 'tbl-7', number: 7, seats: 4, floorId: 'floor-1', status: 'available', x: 50, y: 350 },
  { id: 'tbl-8', number: 8, seats: 2, floorId: 'floor-1', status: 'reserved', x: 200, y: 350 },
]

const firstFloorTables: Table[] = [
  { id: 'tbl-9', number: 9, seats: 4, floorId: 'floor-2', status: 'available', x: 80, y: 80 },
  { id: 'tbl-10', number: 10, seats: 6, floorId: 'floor-2', status: 'occupied', x: 250, y: 80 },
  { id: 'tbl-11', number: 11, seats: 2, floorId: 'floor-2', status: 'available', x: 420, y: 80 },
  { id: 'tbl-12', number: 12, seats: 8, floorId: 'floor-2', status: 'available', x: 80, y: 250 },
  { id: 'tbl-13', number: 13, seats: 4, floorId: 'floor-2', status: 'reserved', x: 250, y: 250 },
  { id: 'tbl-14', number: 14, seats: 4, floorId: 'floor-2', status: 'available', x: 420, y: 250 },
]

const terraceTables: Table[] = [
  { id: 'tbl-15', number: 15, seats: 4, floorId: 'floor-3', status: 'available', x: 100, y: 100 },
  { id: 'tbl-16', number: 16, seats: 6, floorId: 'floor-3', status: 'occupied', x: 300, y: 100 },
  { id: 'tbl-17', number: 17, seats: 2, floorId: 'floor-3', status: 'available', x: 100, y: 280 },
  { id: 'tbl-18', number: 18, seats: 4, floorId: 'floor-3', status: 'available', x: 300, y: 280 },
]

export const mockFloors: Floor[] = [
  { id: 'floor-1', name: 'Ground Floor', tables: groundFloorTables },
  { id: 'floor-2', name: 'First Floor', tables: firstFloorTables },
  { id: 'floor-3', name: 'Terrace', tables: terraceTables },
]
