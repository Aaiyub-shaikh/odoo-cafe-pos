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
  ChefHat,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'
import type { UserRole } from '@/types'
import { isAdmin } from '@/utils/permissions'
import { KDS_URL } from '@/config/kds'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  external?: boolean
}

/** Admin backend navigation */
export const adminNavItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/pos', label: 'POS Terminal', icon: UtensilsCrossed },
  { to: '/orders', label: 'Orders', icon: ClipboardList },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/categories', label: 'Categories', icon: Tags },
  { to: '/tables', label: 'Plan & Tables', icon: Grid3x3 },
  { to: '/payment-methods', label: 'Payment Methods', icon: CreditCard },
  { to: '/promotions', label: 'Coupons & Promotions', icon: Ticket },
  { to: '/employees', label: 'Users', icon: UserCog },
  { to: KDS_URL, label: 'Kitchen Display', icon: ChefHat, external: true },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/bookings', label: 'Bookings', icon: CalendarDays },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function getNavItemsForRole(role: UserRole): NavItem[] {
  if (isAdmin(role)) return adminNavItems
  return []
}
