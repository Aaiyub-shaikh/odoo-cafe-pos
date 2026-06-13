import { create } from 'zustand'
import type { Floor, Table, TableStatus } from '@/types'
import { floorsApi } from '@/services/api'

interface TableState {
  floors: Floor[]
  activeFloorId: string
  isLoading: boolean
  fetchFloors: () => Promise<void>
  setActiveFloor: (id: string) => void
  addFloor: (name: string) => Promise<Floor>
  updateFloor: (floorId: string, name: string) => Promise<void>
  deleteFloor: (floorId: string) => Promise<void>
  addTable: (floorId: string, table: Pick<Table, 'number' | 'seats' | 'active'>) => Promise<void>
  updateTable: (tableId: string, data: Partial<Table>) => Promise<void>
  updateTableStatus: (tableId: string, status: TableStatus) => Promise<void>
  deleteTable: (floorId: string, tableId: string) => Promise<void>
}

function findFloorForTable(floors: Floor[], tableId: string) {
  return floors.find((f) => f.tables.some((t) => t.id === tableId))
}

function replaceFloor(floors: Floor[], updated: Floor) {
  return floors.map((f) => (f.id === updated.id ? updated : f))
}

export const useTableStore = create<TableState>((set, get) => ({
  floors: [],
  activeFloorId: '',
  isLoading: false,

  fetchFloors: async () => {
    set({ isLoading: true })
    try {
      const data = (await floorsApi.getAll()) as unknown as Floor[]
      set((s) => ({
        floors: data,
        activeFloorId: data.some((f) => f.id === s.activeFloorId) ? s.activeFloorId : data[0]?.id ?? '',
        isLoading: false,
      }))
    } catch {
      set({ isLoading: false })
    }
  },

  setActiveFloor: (id) => set({ activeFloorId: id }),

  addFloor: async (name) => {
    const created = (await floorsApi.create(name)) as unknown as Floor
    set((s) => ({
      floors: [...s.floors, created],
      activeFloorId: created.id,
    }))
    return created
  },

  updateFloor: async (floorId, name) => {
    const updated = (await floorsApi.update(floorId, name)) as unknown as Floor
    set((s) => ({ floors: replaceFloor(s.floors, updated) }))
  },

  deleteFloor: async (floorId) => {
    await floorsApi.delete(floorId)
    set((s) => {
      const floors = s.floors.filter((f) => f.id !== floorId)
      return {
        floors,
        activeFloorId: s.activeFloorId === floorId ? floors[0]?.id ?? '' : s.activeFloorId,
      }
    })
  },

  addTable: async (floorId, table) => {
    const updated = (await floorsApi.addTable(floorId, table)) as unknown as Floor
    set((s) => ({ floors: replaceFloor(s.floors, updated) }))
  },

  updateTable: async (tableId, data) => {
    const floor = findFloorForTable(get().floors, tableId)
    if (!floor) return
    const updated = (await floorsApi.updateTable(floor.id, tableId, data)) as unknown as Floor
    set((s) => ({ floors: replaceFloor(s.floors, updated) }))
  },

  updateTableStatus: async (tableId, status) => {
    await get().updateTable(tableId, { status })
  },

  deleteTable: async (floorId, tableId) => {
    const updated = (await floorsApi.deleteTable(floorId, tableId)) as unknown as Floor
    set((s) => ({ floors: replaceFloor(s.floors, updated) }))
  },
}))
