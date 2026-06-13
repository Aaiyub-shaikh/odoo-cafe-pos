import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Grid3x3 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useTableStore, usePosStore } from '@/store'
import { cn, TABLE_STATUS_COLORS } from '@/utils'
import { FLOOR_GRID_STYLE } from '@/utils/chartTheme'
import type { Table, TableStatus } from '@/types'

const STATUS_LABELS: Record<TableStatus, string> = {
  available: 'Available',
  occupied: 'Occupied',
  reserved: 'Reserved',
}

interface FloorSelectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function TablePicker({
  table,
  onSelect,
}: {
  table: Table
  onSelect: (tableId: string) => void
}) {
  const size = Math.max(72, table.seats * 16)

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onSelect(table.id)}
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border-2 transition-colors',
        TABLE_STATUS_COLORS[table.status],
        table.status === 'available' ? 'cursor-pointer hover:border-primary' : 'cursor-pointer opacity-80'
      )}
      style={{ width: size, height: size }}
    >
      <span className="text-lg font-bold">{table.number}</span>
      <div className="mt-1 flex items-center gap-1 text-xs opacity-80">
        <Users className="h-3 w-3" />
        {table.seats}
      </div>
      <span className="mt-0.5 text-[10px] uppercase">{STATUS_LABELS[table.status]}</span>
    </motion.button>
  )
}

export function FloorSelectDialog({ open, onOpenChange }: FloorSelectDialogProps) {
  const { floors, activeFloorId, setActiveFloor, fetchFloors } = useTableStore()
  const { setTable, selectedTableId } = usePosStore()

  useEffect(() => {
    if (open) fetchFloors()
  }, [open, fetchFloors])

  const handleSelectTable = (tableId: string) => {
    setTable(tableId)
    onOpenChange(false)
  }

  const handleWalkIn = () => {
    setTable(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-border bg-card" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Grid3x3 className="h-5 w-5 text-primary" />
            Select Table
          </DialogTitle>
          <DialogDescription>
            Choose a table to start the order. Walk-in orders can skip table selection.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeFloorId} onValueChange={setActiveFloor}>
          <TabsList className="h-auto w-full flex-wrap justify-start">
            {floors.map((floor) => (
              <TabsTrigger key={floor.id} value={floor.id}>
                {floor.name}
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">
                  {floor.tables.filter((t) => t.active !== false).length}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {floors.map((floor) => {
            const activeTables = floor.tables.filter((t) => t.active !== false)
            return (
            <TabsContent key={floor.id} value={floor.id}>
              <div
                className="relative min-h-[280px] overflow-auto rounded-lg border border-border p-4 sm:min-h-[320px]"
                style={FLOOR_GRID_STYLE}
              >
                <div className="flex flex-wrap gap-4">
                  {activeTables.map((table) => (
                    <TablePicker key={table.id} table={table} onSelect={handleSelectTable} />
                  ))}
                </div>
                {activeTables.length === 0 && (
                  <p className="py-12 text-center text-muted-foreground">
                    {floor.tables.length === 0
                      ? 'No tables on this floor'
                      : 'No active tables on this floor'}
                  </p>
                )}
              </div>
            </TabsContent>
          )})}
        </Tabs>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={handleWalkIn}
            className="text-sm text-primary hover:underline"
          >
            Continue as Walk-in (no table)
          </button>
          {selectedTableId && (
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Use current table selection
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
