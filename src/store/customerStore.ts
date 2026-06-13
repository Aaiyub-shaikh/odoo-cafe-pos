import { create } from 'zustand'
import type { Customer } from '@/types'
import { mockCustomers } from '@/mock/customers'

interface CustomerState {
  customers: Customer[]
  isLoading: boolean
  fetchCustomers: () => Promise<void>
  addCustomer: (customer: Omit<Customer, 'id' | 'totalOrders' | 'totalSpent' | 'createdAt'>) => Customer
  updateCustomer: (id: string, data: Partial<Customer>) => void
  deleteCustomer: (id: string) => void
  searchCustomers: (query: string) => Customer[]
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [...mockCustomers],
  isLoading: false,
  fetchCustomers: async () => {
    set({ isLoading: true })
    await new Promise((r) => setTimeout(r, 400))
    set({ customers: [...mockCustomers], isLoading: false })
  },
  addCustomer: (customer) => {
    const newCustomer: Customer = {
      ...customer,
      id: crypto.randomUUID(),
      totalOrders: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
    }
    set((s) => ({ customers: [...s.customers, newCustomer] }))
    return newCustomer
  },
  updateCustomer: (id, data) => {
    set((s) => ({
      customers: s.customers.map((c) => (c.id === id ? { ...c, ...data } : c)),
    }))
  },
  deleteCustomer: (id) => {
    set((s) => ({ customers: s.customers.filter((c) => c.id !== id) }))
  },
  searchCustomers: (query) => {
    const q = query.toLowerCase()
    return get().customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q)
    )
  },
}))
