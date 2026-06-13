import { useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users } from 'lucide-react'
import { PageHeader } from '@/components/shared'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useTableStore } from '@/store'
import { cn, TABLE_STATUS_COLORS } from '@/utils'
import { FLOOR_GRID_STYLE } from '@/utils/chartTheme'
import type { Table, TableStatus } from '@/types'

const STATUS_CYCLE: TableStatus[] = ['available', 'occupied', 'reserved']

const STATUS_LABELS: Record<TableStatus, string> = {
  available: 'Available',
  occupied: 'Occupied',
  reserved: 'Reserved',
}

const STATUS_DOT_COLORS: Record<TableStatus, string> = {
  available: 'bg-emerald-500',
  occupied: 'bg-orange-500',
  reserved: 'bg-blue-500',
}

function getNextStatus(current: TableStatus): TableStatus {
  const idx = STATUS_CYCLE.indexOf(current)
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
}

function TableCard({ table, onStatusChange }: { table: Table; onStatusChange: (status: TableStatus) => void }) {
  const size = Math.max(80, table.seats * 18)

  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onStatusChange(getNextStatus(table.status))}
      className={cn(
        'absolute flex flex-col items-center justify-center rounded-xl border-2 transition-colors cursor-pointer',
        TABLE_STATUS_COLORS[table.status]
      )}
      style={{
        left: table.x,
        top: table.y,
        width: size,
        height: size,
      }}
    >
      <span className="text-lg font-bold">{table.number}</span>
      <div className="mt-1 flex items-center gap-1 text-xs opacity-80">
        <Users className="h-3 w-3" />
        {table.seats}
      </div>
      <span className="mt-1 text-[10px] uppercase tracking-wider opacity-70">{STATUS_LABELS[table.status]}</span>
    </motion.button>
  )
}

export default function TablesPage() {
  const { floors, activeFloorId, setActiveFloor, fetchFloors, updateTableStatus } = useTableStore()

  useEffect(() => {
    fetchFloors()
  }, [fetchFloors])

  const activeFloor = useMemo(
    () => floors.find((f) => f.id === activeFloorId) ?? floors[0],
    [floors, activeFloorId]
  )

  const statusCounts = useMemo(() => {
    const counts = { available: 0, occupied: 0, reserved: 0 }
    activeFloor?.tables.forEach((t) => counts[t.status]++)
    return counts
  }, [activeFloor])

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <PageHeader title="Tables" description="Visual floor plan — click a table to change its status">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {(Object.keys(STATUS_LABELS) as TableStatus[]).map((status) => (
            <div key={status} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={cn('h-2.5 w-2.5 rounded-full', STATUS_DOT_COLORS[status])} />
              <span className="hidden sm:inline">{STATUS_LABELS[status]}</span>
              <span className="sm:hidden">{STATUS_LABELS[status].slice(0, 3)}</span>
              <Badge variant="secondary" className="ml-0.5 h-5 px-1.5 text-[10px]">
                {statusCounts[status]}
              </Badge>
            </div>
          ))}
        </div>
      </PageHeader>

      <Tabs value={activeFloorId} onValueChange={setActiveFloor}>
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1">
          {floors.map((floor) => (
            <TabsTrigger key={floor.id} value={floor.id}>
              {floor.name}
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">
                {floor.tables.length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {floors.map((floor) => (
          <TabsContent key={floor.id} value={floor.id}>
            <Card className="overflow-hidden border-border bg-card shadow-sm">
              <CardContent className="p-0">
                <div className="relative h-[320px] w-full overflow-auto sm:h-[400px] md:h-[480px]" style={FLOOR_GRID_STYLE}>
                  <div className="relative min-h-full min-w-[600px]">
                    <AnimatePresence mode="popLayout">
                      {floor.tables.map((table) => (
                        <TableCard
                          key={table.id}
                          table={table}
                          onStatusChange={(status) => updateTableStatus(table.id, status)}
                        />
                      ))}
                    </AnimatePresence>

                    {floor.tables.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        No tables on this floor
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </motion.div>
  )
}
