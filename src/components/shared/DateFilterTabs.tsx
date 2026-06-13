import { type DateFilter } from '@/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils'

const filters: { value: DateFilter; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'custom', label: 'Custom' },
]

interface DateFilterTabsProps {
  value: DateFilter
  onChange: (filter: DateFilter) => void
  className?: string
}

export function DateFilterTabs({ value, onChange, className }: DateFilterTabsProps) {
  return (
    <div className={cn('inline-flex rounded-lg bg-muted p-1', className)}>
      {filters.map((f) => (
        <Button
          key={f.value}
          variant="ghost"
          size="sm"
          className={cn('h-7 px-3 text-xs', value === f.value && 'bg-background shadow-sm')}
          onClick={() => onChange(f.value)}
        >
          {f.label}
        </Button>
      ))}
    </div>
  )
}
