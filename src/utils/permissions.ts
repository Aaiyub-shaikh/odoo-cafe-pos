import type { UserRole } from '@/types'
import { isKdsStandalonePort } from '@/config/kds'

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  cashier: 'Employee',
}

export function isAdmin(role: UserRole) {
  return role === 'admin'
}

export function isCashier(role: UserRole) {
  return role === 'cashier'
}

export function getDefaultRoute(role: UserRole) {
  if (isKdsStandalonePort()) return '/kds'
  return role === 'admin' ? '/dashboard' : '/pos'
}

/** Routes only accessible by admin (backend management) */
export const ADMIN_ROUTES = [
  '/dashboard',
  '/orders',
  '/customers',
  '/products',
  '/categories',
  '/tables',
  '/payment-methods',
  '/promotions',
  '/employees',
  '/reports',
  '/bookings',
  '/settings',
  '/profile',
] as const

/** Routes only accessible by cashier (employee POS) */
export const CASHIER_ROUTES = ['/pos'] as const

export function canAccessRoute(role: UserRole, pathname: string) {
  if (pathname === '/kds') return true
  if (isAdmin(role)) {
    return !CASHIER_ROUTES.includes(pathname as (typeof CASHIER_ROUTES)[number])
  }
  if (isCashier(role)) {
    return CASHIER_ROUTES.includes(pathname as (typeof CASHIER_ROUTES)[number]) || pathname === '/kds'
  }
  return false
}
