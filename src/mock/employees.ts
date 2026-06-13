import type { Employee, User } from '@/types'

export const mockUsers: User[] = [
  { id: 'emp-1', name: 'Admin User', email: 'admin@restmana.com', role: 'admin', avatar: '' },
  { id: 'emp-2', name: 'Sarah Johnson', email: 'sarah@restmana.com', role: 'cashier', avatar: '' },
]

export const mockEmployees: Employee[] = [
  { id: 'emp-1', name: 'Admin User', email: 'admin@restmana.com', role: 'admin', status: 'active', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'emp-2', name: 'Sarah Johnson', email: 'sarah@restmana.com', role: 'cashier', status: 'active', createdAt: '2024-03-15T00:00:00Z' },
  { id: 'emp-3', name: 'Mike Chen', email: 'mike@restmana.com', role: 'cashier', status: 'active', createdAt: '2024-06-01T00:00:00Z' },
  { id: 'emp-4', name: 'Lisa Wong', email: 'lisa@restmana.com', role: 'cashier', status: 'archived', createdAt: '2024-02-10T00:00:00Z' },
]

export const ADMIN_DEMO_CREDENTIALS = {
  email: 'admin@restmana.com',
  password: 'admin123',
}

export const CASHIER_DEMO_CREDENTIALS = {
  email: 'sarah@restmana.com',
  password: 'cashier123',
}

/** @deprecated Use ADMIN_DEMO_CREDENTIALS */
export const DEMO_CREDENTIALS = ADMIN_DEMO_CREDENTIALS
