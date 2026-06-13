import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const TABLE_STATUS_COLORS = {
  available: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  occupied: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  reserved: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
} as const

export const ORDER_STATUS_COLORS = {
  draft: 'bg-yellow-500/20 text-yellow-400',
  paid: 'bg-emerald-500/20 text-emerald-400',
  cancelled: 'bg-red-500/20 text-red-400',
} as const

export const KITCHEN_STATUS_COLORS = {
  to_cook: 'bg-red-500/20 text-red-400 border-red-500/30',
  preparing: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
} as const
