import { create } from 'zustand'
import type { Employee } from '@/types'
import { mockEmployees } from '@/mock/employees'

interface EmployeeState {
  employees: Employee[]
  isLoading: boolean
  fetchEmployees: () => Promise<void>
  addEmployee: (employee: Omit<Employee, 'id' | 'createdAt' | 'status'>) => void
  updateEmployee: (id: string, data: Partial<Employee>) => void
  archiveEmployee: (id: string) => void
  deleteEmployee: (id: string) => void
}

export const useEmployeeStore = create<EmployeeState>((set) => ({
  employees: [...mockEmployees],
  isLoading: false,
  fetchEmployees: async () => {
    set({ isLoading: true })
    await new Promise((r) => setTimeout(r, 400))
    set({ employees: [...mockEmployees], isLoading: false })
  },
  addEmployee: (employee) => {
    const newEmployee: Employee = {
      ...employee,
      id: crypto.randomUUID(),
      status: 'active',
      createdAt: new Date().toISOString(),
    }
    set((s) => ({ employees: [...s.employees, newEmployee] }))
  },
  updateEmployee: (id, data) => {
    set((s) => ({
      employees: s.employees.map((e) => (e.id === id ? { ...e, ...data } : e)),
    }))
  },
  archiveEmployee: (id) => {
    set((s) => ({
      employees: s.employees.map((e) => (e.id === id ? { ...e, status: 'archived' } : e)),
    }))
  },
  deleteEmployee: (id) => {
    set((s) => ({ employees: s.employees.filter((e) => e.id !== id) }))
  },
}))
