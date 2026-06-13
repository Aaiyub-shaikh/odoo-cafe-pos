import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Package,
  Tags,
  Grid3x3,
  CreditCard,
  Ticket,
  UserCog,
  BarChart3,
  Settings,
  CalendarDays,
  type LucideIcon,
} from 'lucide-react'
import type { UserRole } from '@/types'
import { isAdmin } from '@/utils/permissions'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

/** Admin backend navigation — no POS Terminal */
export const adminNavItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/orders', label: 'Orders', icon: ClipboardList },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/categories', label: 'Categories', icon: Tags },
  { to: '/tables', label: 'Tables', icon: Grid3x3 },
  { to: '/payment-methods', label: 'Payment Methods', icon: CreditCard },
  { to: '/promotions', label: 'Coupons & Promotions', icon: Ticket },
  { to: '/employees', label: 'Employees', icon: UserCog },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/bookings', label: 'Bookings', icon: CalendarDays },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function getNavItemsForRole(role: UserRole): NavItem[] {
  if (isAdmin(role)) return adminNavItems
  return []
}
