import { type LucideIcon } from 'lucide-react'
import { cn, formatCurrency } from '@/utils'
import { Card, CardContent } from '@/components/ui/card'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: { value: number; label: string }
  isCurrency?: boolean
  className?: string
}

export function StatCard({ title, value, icon: Icon, trend, isCurrency, className }: StatCardProps) {
  const displayValue = isCurrency && typeof value === 'number' ? formatCurrency(value) : value
  return (
    <Card className={cn('border-border bg-card shadow-sm', className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className="text-xl font-bold sm:text-2xl">{displayValue}</p>
            {trend && (
              <p className={cn('text-xs', trend.value >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
              </p>
            )}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
