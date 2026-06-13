import { create } from 'zustand'
import type { Employee } from '@/types'
import { employeesApi } from '@/services/api'

interface EmployeeState {
  employees: Employee[]
  isLoading: boolean
  fetchEmployees: () => Promise<void>
  addEmployee: (employee: { name: string; email: string; password: string; role?: 'admin' | 'cashier' }) => Promise<void>
  updateEmployee: (id: string, data: Partial<Employee> & { password?: string }) => Promise<void>
  archiveEmployee: (id: string) => Promise<void>
  deleteEmployee: (id: string) => Promise<void>
}

export const useEmployeeStore = create<EmployeeState>((set) => ({
  employees: [],
  isLoading: false,
  fetchEmployees: async () => {
    set({ isLoading: true })
    try {
      const data = await employeesApi.getAll()
      set({ employees: data as unknown as Employee[], isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },
  addEmployee: async (employee) => {
    const created = (await employeesApi.create(employee)) as unknown as Employee
    set((s) => ({ employees: [...s.employees, created] }))
  },
  updateEmployee: async (id, data) => {
    const updated = (await employeesApi.update(id, data)) as unknown as Employee
    set((s) => ({
      employees: s.employees.map((e) => (e.id === id ? updated : e)),
    }))
  },
  archiveEmployee: async (id) => {
    const updated = (await employeesApi.archive(id)) as unknown as Employee
    set((s) => ({
      employees: s.employees.map((e) => (e.id === id ? updated : e)),
    }))
  },
  deleteEmployee: async (id) => {
    await employeesApi.delete(id)
    set((s) => ({ employees: s.employees.filter((e) => e.id !== id) }))
  },
}))
