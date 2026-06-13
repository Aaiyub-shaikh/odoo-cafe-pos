import { create } from 'zustand'
import type { Floor, Table, TableStatus } from '@/types'
import { floorsApi } from '@/services/api'

interface TableState {
  floors: Floor[]
  activeFloorId: string
  isLoading: boolean
  fetchFloors: () => Promise<void>
  setActiveFloor: (id: string) => void
  addFloor: (name: string) => Promise<void>
  updateTable: (tableId: string, data: Partial<Table>) => Promise<void>
  updateTableStatus: (tableId: string, status: TableStatus) => Promise<void>
  addTable: (floorId: string, table: Omit<Table, 'id' | 'floorId'>) => Promise<void>
  deleteTable: (tableId: string) => Promise<void>
}

function findFloorForTable(floors: Floor[], tableId: string) {
  return floors.find((f) => f.tables.some((t) => t.id === tableId))
}

export const useTableStore = create<TableState>((set, get) => ({
  floors: [],
  activeFloorId: '',
  isLoading: false,
  fetchFloors: async () => {
    set({ isLoading: true })
    try {
      const data = (await floorsApi.getAll()) as unknown as Floor[]
      set({
        floors: data,
        activeFloorId: data[0]?.id ?? '',
        isLoading: false,
      })
    } catch {
      set({ isLoading: false })
    }
  },
  setActiveFloor: (id) => set({ activeFloorId: id }),
  addFloor: async (name) => {
    const created = (await floorsApi.create(name)) as unknown as Floor
    set((s) => ({ floors: [...s.floors, created] }))
  },
  updateTable: async (tableId, data) => {
    const floor = findFloorForTable(get().floors, tableId)
    if (!floor) return
    const updated = (await floorsApi.updateTable(floor.id, tableId, data)) as unknown as Floor
    set((s) => ({ floors: s.floors.map((f) => (f.id === floor.id ? updated : f)) }))
  },
  updateTableStatus: async (tableId, status) => {
    await get().updateTable(tableId, { status })
  },
  addTable: async (_floorId, _table) => {
    await get().fetchFloors()
  },
  deleteTable: async (_tableId) => {
    await get().fetchFloors()
  },
}))
