import { create } from 'zustand'
import type { Floor, Table, TableStatus } from '@/types'
import { mockFloors } from '@/mock/tables'

interface TableState {
  floors: Floor[]
  activeFloorId: string
  isLoading: boolean
  fetchFloors: () => Promise<void>
  setActiveFloor: (id: string) => void
  addFloor: (name: string) => void
  updateTable: (tableId: string, data: Partial<Table>) => void
  updateTableStatus: (tableId: string, status: TableStatus) => void
  addTable: (floorId: string, table: Omit<Table, 'id' | 'floorId'>) => void
  deleteTable: (tableId: string) => void
}

export const useTableStore = create<TableState>((set, get) => ({
  floors: [...mockFloors],
  activeFloorId: 'floor-1',
  isLoading: false,
  fetchFloors: async () => {
    set({ isLoading: true })
    await new Promise((r) => setTimeout(r, 400))
    set({ floors: [...mockFloors], isLoading: false })
  },
  setActiveFloor: (id) => set({ activeFloorId: id }),
  addFloor: (name) => {
    const newFloor: Floor = { id: crypto.randomUUID(), name, tables: [] }
    set((s) => ({ floors: [...s.floors, newFloor] }))
  },
  updateTable: (tableId, data) => {
    set((s) => ({
      floors: s.floors.map((f) => ({
        ...f,
        tables: f.tables.map((t) => (t.id === tableId ? { ...t, ...data } : t)),
      })),
    }))
  },
  updateTableStatus: (tableId, status) => {
    get().updateTable(tableId, { status })
  },
  addTable: (floorId, table) => {
    const newTable: Table = { ...table, id: crypto.randomUUID(), floorId }
    set((s) => ({
      floors: s.floors.map((f) =>
        f.id === floorId ? { ...f, tables: [...f.tables, newTable] } : f
      ),
    }))
  },
  deleteTable: (tableId) => {
    set((s) => ({
      floors: s.floors.map((f) => ({
        ...f,
        tables: f.tables.filter((t) => t.id !== tableId),
      })),
    }))
  },
}))
