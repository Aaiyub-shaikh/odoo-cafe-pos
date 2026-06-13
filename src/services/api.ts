import { resolveAuthToken, setAuthToken } from './authToken'

export { setAuthToken }

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const PUBLIC_PATHS = ['/auth/login', '/auth/signup', '/auth/signup/employee']

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const isPublic = PUBLIC_PATHS.some((p) => path.startsWith(p))
  const token = isPublic ? null : resolveAuthToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  } catch {
    throw new ApiError(0, 'Unable to connect to the server. Please try again in a moment.')
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new ApiError(res.status, err.error || 'Request failed')
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

export const authApi = {
  login: (email: string, password: string) =>
    api<{ token: string; user: Record<string, unknown> }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  signup: (name: string, email: string, password: string) =>
    api<{ token: string; user: Record<string, unknown> }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),
  signupEmployee: (name: string, email: string, password: string) =>
    api<{ token: string; user: Record<string, unknown> }>('/auth/signup/employee', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),
  me: () => api<Record<string, unknown>>('/auth/me'),
  updateProfile: (data: Record<string, unknown>) =>
    api<Record<string, unknown>>('/auth/profile', { method: 'PATCH', body: JSON.stringify(data) }),
}

export const productsApi = {
  getAll: () => api<Record<string, unknown>[]>('/products'),
  create: (data: Record<string, unknown>) => api<Record<string, unknown>>('/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => api<Record<string, unknown>>(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => api<{ success: boolean }>(`/products/${id}`, { method: 'DELETE' }),
}

export const categoriesApi = {
  getAll: () => api<Record<string, unknown>[]>('/categories'),
  create: (data: Record<string, unknown>) => api<Record<string, unknown>>('/categories', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => api<Record<string, unknown>>(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => api<{ success: boolean }>(`/categories/${id}`, { method: 'DELETE' }),
}

export const customersApi = {
  getAll: (search?: string) => api<Record<string, unknown>[]>(`/customers${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  create: (data: Record<string, unknown>) => api<Record<string, unknown>>('/customers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => api<Record<string, unknown>>(`/customers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => api<{ success: boolean }>(`/customers/${id}`, { method: 'DELETE' }),
}

export const ordersApi = {
  getAll: () => api<Record<string, unknown>[]>('/orders'),
  getKitchen: () => api<Record<string, unknown>[]>('/orders/kitchen'),
  create: (data: Record<string, unknown>) => api<Record<string, unknown>>('/orders', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => api<Record<string, unknown>>(`/orders/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  updateKitchenItem: (orderId: string, itemId: string, kitchenStatus: string) =>
    api<Record<string, unknown>>(`/orders/${orderId}/items/${itemId}/kitchen`, {
      method: 'PATCH',
      body: JSON.stringify({ kitchenStatus }),
    }),
  delete: (id: string) => api<{ success: boolean }>(`/orders/${id}`, { method: 'DELETE' }),
}

export const floorsApi = {
  getAll: () => api<Record<string, unknown>[]>('/floors'),
  create: (name: string) => api<Record<string, unknown>>('/floors', { method: 'POST', body: JSON.stringify({ name }) }),
  update: (floorId: string, name: string) =>
    api<Record<string, unknown>>(`/floors/${floorId}`, { method: 'PATCH', body: JSON.stringify({ name }) }),
  delete: (floorId: string) => api<{ success: boolean }>(`/floors/${floorId}`, { method: 'DELETE' }),
  addTable: (floorId: string, data: Record<string, unknown>) =>
    api<Record<string, unknown>>(`/floors/${floorId}/tables`, { method: 'POST', body: JSON.stringify(data) }),
  updateTable: (floorId: string, tableId: string, data: Record<string, unknown>) =>
    api<Record<string, unknown>>(`/floors/${floorId}/tables/${tableId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTable: (floorId: string, tableId: string) =>
    api<Record<string, unknown>>(`/floors/${floorId}/tables/${tableId}`, { method: 'DELETE' }),
}

export const employeesApi = {
  getAll: () => api<Record<string, unknown>[]>('/employees'),
  create: (data: Record<string, unknown>) => api<Record<string, unknown>>('/employees', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => api<Record<string, unknown>>(`/employees/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  archive: (id: string) => api<Record<string, unknown>>(`/employees/${id}/archive`, { method: 'PATCH' }),
  delete: (id: string) => api<{ success: boolean }>(`/employees/${id}`, { method: 'DELETE' }),
}

export const paymentsApi = {
  getAll: () => api<Record<string, unknown>[]>('/payment-methods'),
  update: (id: string, data: Record<string, unknown>) =>
    api<Record<string, unknown>>(`/payment-methods/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
}

export const razorpayApi = {
  getSettings: () => api<Record<string, unknown>>('/payments/razorpay/settings'),
  updateSettings: (data: Record<string, unknown>) =>
    api<Record<string, unknown>>('/payments/razorpay/settings', { method: 'PUT', body: JSON.stringify(data) }),
  getConfig: () => api<Record<string, unknown>>('/payments/razorpay/config'),
  createOrder: (amount: number, receipt?: string) =>
    api<{ orderId: string; amount: number; currency: string; keyId: string }>('/payments/razorpay/create-order', {
      method: 'POST',
      body: JSON.stringify({ amount, receipt }),
    }),
  verify: (data: Record<string, string>) =>
    api<{ verified: boolean; paymentId: string; orderId: string }>('/payments/razorpay/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

export const couponsApi = {
  getAll: () => api<Record<string, unknown>[]>('/coupon-items'),
  create: (data: Record<string, unknown>) => api<Record<string, unknown>>('/coupon-items', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => api<Record<string, unknown>>(`/coupon-items/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => api<{ success: boolean }>(`/coupon-items/${id}`, { method: 'DELETE' }),
  validate: (code: string) => api<Record<string, unknown> | null>(`/coupons/validate/${encodeURIComponent(code)}`),
}

export const promotionsApi = {
  getAll: () => api<Record<string, unknown>[]>('/promotions-list'),
  create: (data: Record<string, unknown>) => api<Record<string, unknown>>('/promotions-list', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => api<Record<string, unknown>>(`/promotions-list/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => api<{ success: boolean }>(`/promotions-list/${id}`, { method: 'DELETE' }),
}

export const bookingsApi = {
  getAll: () => api<Record<string, unknown>[]>('/bookings'),
  create: (data: Record<string, unknown>) => api<Record<string, unknown>>('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => api<Record<string, unknown>>(`/bookings/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => api<{ success: boolean }>(`/bookings/${id}`, { method: 'DELETE' }),
}

export const sessionsApi = {
  getActive: () => api<Record<string, unknown> | null>('/sessions/active'),
  open: (data: Record<string, unknown>) => api<Record<string, unknown>>('/sessions/open', { method: 'POST', body: JSON.stringify(data) }),
  close: (id: string) => api<Record<string, unknown>>(`/sessions/${id}/close`, { method: 'PATCH' }),
  updateStats: (id: string, sales: number) =>
    api<Record<string, unknown>>(`/sessions/${id}/stats`, { method: 'PATCH', body: JSON.stringify({ sales }) }),
}

export const reportsApi = {
  dashboard: () => api<Record<string, unknown>>('/reports/dashboard'),
  salesTrend: () => api<Record<string, unknown>[]>('/reports/sales-trend'),
  topProducts: () => api<Record<string, unknown>[]>('/reports/top-products'),
  topCategories: () => api<Record<string, unknown>[]>('/reports/top-categories'),
}
