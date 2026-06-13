import { create } from 'zustand'
import type { Customer } from '@/types'
import { customersApi } from '@/services/api'

interface CustomerState {
  customers: Customer[]
  isLoading: boolean
  fetchCustomers: () => Promise<void>
  addCustomer: (customer: Omit<Customer, 'id' | 'totalOrders' | 'totalSpent' | 'createdAt'>) => Promise<Customer>
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<void>
  deleteCustomer: (id: string) => Promise<void>
  searchCustomers: (query: string) => Customer[]
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [],
  isLoading: false,
  fetchCustomers: async () => {
    set({ isLoading: true })
    try {
      const data = await customersApi.getAll()
      set({ customers: data as unknown as Customer[], isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },
  addCustomer: async (customer) => {
    const created = (await customersApi.create(customer)) as unknown as Customer
    set((s) => ({ customers: [...s.customers, created] }))
    return created
  },
  updateCustomer: async (id, data) => {
    const updated = (await customersApi.update(id, data)) as unknown as Customer
    set((s) => ({
      customers: s.customers.map((c) => (c.id === id ? updated : c)),
    }))
  },
  deleteCustomer: async (id) => {
    await customersApi.delete(id)
    set((s) => ({ customers: s.customers.filter((c) => c.id !== id) }))
  },
  searchCustomers: (query) => {
    const q = query.toLowerCase()
    return get().customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q)
    )
  },
}))
