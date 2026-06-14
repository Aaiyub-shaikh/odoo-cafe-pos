import type { PaymentMethod, Coupon, Promotion, Booking, Notification, SalesDataPoint, TopProduct, TopCategory } from '@/types'

export const mockPaymentMethods: PaymentMethod[] = [
  { id: 'pay-1', type: 'cash', name: 'Cash', enabled: true },
  { id: 'pay-2', type: 'card', name: 'Card', enabled: true },
  { id: 'pay-3', type: 'upi', name: 'UPI', enabled: true, upiId: 'cafeluxe@upi' },
  { id: 'pay-4', type: 'razorpay', name: 'Razorpay', enabled: true },
]

export const mockCoupons: Coupon[] = [
  { id: 'coup-1', code: 'SAVE10', percentage: 10, active: true, usageCount: 45, createdAt: '2025-01-01T00:00:00Z' },
  { id: 'coup-2', code: 'FLAT50', fixedAmount: 50, active: true, usageCount: 23, createdAt: '2025-02-15T00:00:00Z' },
  { id: 'coup-3', code: 'WELCOME20', percentage: 20, active: false, usageCount: 12, createdAt: '2025-03-01T00:00:00Z' },
]

export const mockPromotions: Promotion[] = [
  { id: 'promo-1', name: 'Buy 2 Get 1 Free - Starters', type: 'product', minQuantity: 2, discount: 100, discountType: 'percentage', active: true, productIds: ['prod-1', 'prod-2', 'prod-3'], createdAt: '2025-01-01T00:00:00Z' },
  { id: 'promo-2', name: 'Orders above ₹1000', type: 'order', minOrderAmount: 1000, discount: 15, discountType: 'percentage', active: true, createdAt: '2025-02-01T00:00:00Z' },
  { id: 'promo-3', name: 'Weekend Special', type: 'order', minOrderAmount: 500, discount: 100, discountType: 'fixed', active: false, createdAt: '2025-03-01T00:00:00Z' },
]

export const mockBookings: Booking[] = [
  { id: 'book-1', customerName: 'Rajesh Kumar', customerPhone: '+91 98765 43210', tableId: 'tbl-3', tableNumber: 3, date: '2025-06-13', time: '19:00', guests: 4, status: 'confirmed' },
  { id: 'book-2', customerName: 'Priya Sharma', customerPhone: '+91 98765 43211', tableId: 'tbl-8', tableNumber: 8, date: '2025-06-13', time: '20:30', guests: 2, status: 'confirmed' },
  { id: 'book-3', customerName: 'Amit Patel', customerPhone: '+91 98765 43212', tableId: 'tbl-12', tableNumber: 12, date: '2025-06-14', time: '13:00', guests: 8, status: 'confirmed' },
]

export const mockNotifications: Notification[] = [
  { id: 'notif-1', title: 'New Order', message: 'Order ORD-2025-006 received from Table 3', type: 'info', read: false, createdAt: '2025-06-13T12:00:00Z' },
  { id: 'notif-2', title: 'Low Stock', message: 'Paneer Tikka stock is running low', type: 'warning', read: false, createdAt: '2025-06-13T11:30:00Z' },
  { id: 'notif-3', title: 'Payment Received', message: '₹966 received via Card for ORD-2025-001', type: 'success', read: true, createdAt: '2025-06-13T10:45:00Z' },
  { id: 'notif-4', title: 'Booking Reminder', message: 'Table 3 reserved for 7:00 PM tonight', type: 'info', read: true, createdAt: '2025-06-13T09:00:00Z' },
]

export const mockSalesData: SalesDataPoint[] = [
  { date: 'Mon', sales: 45, revenue: 32500, orders: 38 },
  { date: 'Tue', sales: 52, revenue: 38200, orders: 44 },
  { date: 'Wed', sales: 48, revenue: 35100, orders: 41 },
  { date: 'Thu', sales: 61, revenue: 44800, orders: 52 },
  { date: 'Fri', sales: 78, revenue: 58200, orders: 65 },
  { date: 'Sat', sales: 95, revenue: 72500, orders: 82 },
  { date: 'Sun', sales: 88, revenue: 66800, orders: 74 },
]

export const mockTopProducts: TopProduct[] = [
  { id: 'prod-4', name: 'Butter Chicken', quantity: 156, revenue: 59280 },
  { id: 'prod-5', name: 'Biryani', quantity: 142, revenue: 49700 },
  { id: 'prod-1', name: 'Paneer Tikka', quantity: 128, revenue: 35840 },
  { id: 'prod-8', name: 'Fresh Lime Soda', quantity: 210, revenue: 16800 },
  { id: 'prod-12', name: 'Chocolate Brownie', quantity: 98, revenue: 17640 },
]

export const mockTopCategories: TopCategory[] = [
  { id: 'cat-2', name: 'Main Course', color: '#3b82f6', quantity: 420, revenue: 145800 },
  { id: 'cat-1', name: 'Starters', color: '#da291c', quantity: 310, revenue: 68200 },
  { id: 'cat-3', name: 'Beverages', color: '#22c55e', quantity: 580, revenue: 46400 },
  { id: 'cat-4', name: 'Desserts', color: '#a855f7', quantity: 180, revenue: 32400 },
  { id: 'cat-5', name: 'Combos', color: '#eab308', quantity: 45, revenue: 58455 },
]
