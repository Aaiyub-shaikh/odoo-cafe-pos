export type UserRole = 'admin' | 'cashier'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

export interface Employee extends User {
  status: 'active' | 'archived'
  createdAt: string
}

export interface Category {
  id: string
  name: string
  color: string
  productCount?: number
}

export interface Product {
  id: string
  name: string
  categoryId: string
  price: number
  unit: string
  tax: number
  description?: string
  image?: string
  active: boolean
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  totalOrders: number
  totalSpent: number
  createdAt: string
}

export type TableStatus = 'available' | 'occupied' | 'reserved'

export interface Table {
  id: string
  number: number
  seats: number
  floorId: string
  status: TableStatus
  x: number
  y: number
}

export interface Floor {
  id: string
  name: string
  tables: Table[]
}

export type OrderStatus = 'draft' | 'paid' | 'cancelled'
export type KitchenStatus = 'to_cook' | 'preparing' | 'completed'

export interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  lineTotal: number
  kitchenStatus: KitchenStatus
}

export interface Order {
  id: string
  orderNumber: string
  customerId?: string
  customerName?: string
  tableId?: string
  items: OrderItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  status: OrderStatus
  paymentMethod?: 'cash' | 'card' | 'upi'
  couponCode?: string
  employeeId: string
  employeeName: string
  sessionId: string
  createdAt: string
  updatedAt: string
}

export interface PaymentMethod {
  id: string
  type: 'cash' | 'card' | 'upi'
  name: string
  enabled: boolean
  upiId?: string
}

export interface Coupon {
  id: string
  code: string
  percentage?: number
  fixedAmount?: number
  active: boolean
  usageCount: number
  createdAt: string
}

export type PromotionType = 'product' | 'order'

export interface Promotion {
  id: string
  name: string
  type: PromotionType
  minQuantity?: number
  minOrderAmount?: number
  discount: number
  discountType: 'percentage' | 'fixed'
  active: boolean
  productIds?: string[]
  createdAt: string
}

export interface Booking {
  id: string
  customerName: string
  customerPhone: string
  tableId: string
  tableNumber: number
  date: string
  time: string
  guests: number
  status: 'confirmed' | 'cancelled' | 'completed'
}

export interface CartItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  tax: number
  image?: string
}

export interface PosSession {
  id: string
  employeeId: string
  employeeName: string
  openedAt: string
  status: 'open' | 'closed'
  openingCash: number
  totalSales: number
  orderCount: number
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
}

export interface DashboardStats {
  revenue: number
  totalOrders: number
  avgOrderValue: number
  activeTables: number
  customers: number
  productsSold: number
}

export interface SalesDataPoint {
  date: string
  sales: number
  revenue: number
  orders: number
}

export interface TopProduct {
  id: string
  name: string
  quantity: number
  revenue: number
}

export interface TopCategory {
  id: string
  name: string
  color: string
  quantity: number
  revenue: number
}

export type DateFilter = 'today' | 'week' | 'month' | 'custom'

export interface ReportFilters {
  dateFrom: string
  dateTo: string
  employeeId?: string
  productId?: string
  sessionId?: string
}
