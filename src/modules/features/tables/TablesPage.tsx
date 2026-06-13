import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Building2, Pencil, Plus, Trash2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader, DataTable, ConfirmDialog } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTableStore } from '@/store'
import { ApiError } from '@/services/api'
import type { Floor, Table } from '@/types'

type TableForm = { number: string; seats: string; active: boolean }

const emptyTableForm: TableForm = { number: '', seats: '', active: true }

export default function TablesPage() {
  const {
    floors,
    activeFloorId,
    isLoading,
    fetchFloors,
    setActiveFloor,
    addFloor,
    updateFloor,
    deleteFloor,
    addTable,
    updateTable,
    deleteTable,
  } = useTableStore()

  const [floorDialogOpen, setFloorDialogOpen] = useState(false)
  const [editingFloor, setEditingFloor] = useState<Floor | null>(null)
  const [floorName, setFloorName] = useState('')
  const [deleteFloorTarget, setDeleteFloorTarget] = useState<Floor | null>(null)

  const [tableDialogOpen, setTableDialogOpen] = useState(false)
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [tableForm, setTableForm] = useState<TableForm>(emptyTableForm)
  const [deleteTableTarget, setDeleteTableTarget] = useState<{ floorId: string; table: Table } | null>(null)

  useEffect(() => {
    fetchFloors()
  }, [fetchFloors])

  const activeFloor = useMemo(
    () => floors.find((f) => f.id === activeFloorId) ?? floors[0],
    [floors, activeFloorId]
  )

  const openCreateFloor = () => {
    setEditingFloor(null)
    setFloorName('')
    setFloorDialogOpen(true)
  }

  const openEditFloor = (floor: Floor) => {
    setEditingFloor(floor)
    setFloorName(floor.name)
    setFloorDialogOpen(true)
  }

  const saveFloor = async () => {
    const name = floorName.trim()
    if (!name) {
      toast.error('Floor name is required')
      return
    }
    try {
      if (editingFloor) {
        await updateFloor(editingFloor.id, name)
        toast.success('Floor updated')
      } else {
        await addFloor(name)
        toast.success('Floor created')
      }
      setFloorDialogOpen(false)
    } catch {
      toast.error('Failed to save floor')
    }
  }

  const openCreateTable = () => {
    if (!activeFloor) {
      toast.error('Create a floor first')
      return
    }
    setEditingTable(null)
    setTableForm(emptyTableForm)
    setTableDialogOpen(true)
  }

  const openEditTable = (table: Table) => {
    setEditingTable(table)
    setTableForm({
      number: String(table.number),
      seats: String(table.seats),
      active: table.active !== false,
    })
    setTableDialogOpen(true)
  }

  const saveTable = async () => {
    if (!activeFloor) return

    const number = Number(tableForm.number)
    const seats = Number(tableForm.seats)
    if (!number || number < 1) {
      toast.error('Enter a valid table number')
      return
    }
    if (!seats || seats < 1) {
      toast.error('Seats must be at least 1')
      return
    }

    const payload = { number, seats, active: tableForm.active }

    try {
      if (editingTable) {
        await updateTable(editingTable.id, payload)
        toast.success('Table updated')
      } else {
        await addTable(activeFloor.id, payload)
        toast.success('Table added')
      }
      setTableDialogOpen(false)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to save table')
    }
  }

  const toggleTableActive = async (table: Table) => {
    try {
      await updateTable(table.id, { active: !table.active })
      toast.success(table.active ? 'Table deactivated' : 'Table activated')
    } catch {
      toast.error('Failed to update table status')
    }
  }

  const tableColumns = [
    {
      key: 'number',
      header: 'Table #',
      cell: (table: Table) => <span className="font-semibold">T{table.number}</span>,
    },
    {
      key: 'seats',
      header: 'Seats',
      cell: (table: Table) => (
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          {table.seats}
        </span>
      ),
    },
    {
      key: 'active',
      header: 'Active',
      cell: (table: Table) => (
        <div className="flex items-center gap-2">
          <Switch checked={table.active !== false} onCheckedChange={() => toggleTableActive(table)} />
          <Badge variant={table.active !== false ? 'default' : 'secondary'}>
            {table.active !== false ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      ),
    },
    {
      key: 'pos',
      header: 'POS',
      cell: (table: Table) =>
        table.active !== false ? (
          <span className="text-xs text-emerald-600">Visible in POS</span>
        ) : (
          <span className="text-xs text-muted-foreground">Hidden from POS</span>
        ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      cell: (table: Table) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditTable(table)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => activeFloor && setDeleteTableTarget({ floorId: activeFloor.id, table })}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <PageHeader
        title="Plan & Table Management"
        description="Create floors and manage tables. Active tables appear in the POS floor popup."
      >
        <Button onClick={openCreateFloor}>
          <Plus className="mr-2 h-4 w-4" />
          Add Floor
        </Button>
      </PageHeader>

      {floors.length === 0 && !isLoading ? (
        <Card className="border-dashed border-border bg-card shadow-sm">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Building2 className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="font-medium">No floors yet</p>
              <p className="text-sm text-muted-foreground">Create your first floor, then add tables under it.</p>
            </div>
            <Button onClick={openCreateFloor}>
              <Plus className="mr-2 h-4 w-4" />
              Add Floor
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeFloorId} onValueChange={setActiveFloor}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <TabsList className="h-auto w-full flex-wrap justify-start gap-1 sm:w-auto">
              {floors.map((floor) => (
                <TabsTrigger key={floor.id} value={floor.id} className="gap-2">
                  {floor.name}
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                    {floor.tables.filter((t) => t.active !== false).length}/{floor.tables.length}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            {activeFloor && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEditFloor(activeFloor)}>
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  Edit Floor
                </Button>
                <Button variant="outline" size="sm" onClick={() => setDeleteFloorTarget(activeFloor)}>
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Delete Floor
                </Button>
                <Button size="sm" onClick={openCreateTable}>
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Add Table
                </Button>
              </div>
            )}
          </div>

          {floors.map((floor) => (
            <TabsContent key={floor.id} value={floor.id} className="mt-4 space-y-4">
              <Card className="border-border bg-card shadow-sm">
                <CardContent className="p-0">
                  <DataTable
                    isLoading={isLoading}
                    columns={tableColumns}
                    data={floor.tables.sort((a, b) => a.number - b.number)}
                    emptyMessage="No tables on this floor. Click Add Table to create one."
                  />
                </CardContent>
              </Card>

              <p className="text-xs text-muted-foreground">
                {floor.tables.filter((t) => t.active !== false).length} active table(s) will show in the POS floor
                popup for &quot;{floor.name}&quot;.
              </p>
            </TabsContent>
          ))}
        </Tabs>
      )}

      <Dialog open={floorDialogOpen} onOpenChange={setFloorDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingFloor ? 'Edit Floor' : 'Add Floor'}</DialogTitle>
            <DialogDescription>
              {editingFloor ? 'Rename this floor plan.' : 'Create a new floor for your restaurant layout.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="floor-name">Floor Name</Label>
            <Input
              id="floor-name"
              value={floorName}
              onChange={(e) => setFloorName(e.target.value)}
              placeholder="e.g. Ground Floor, Terrace"
              className="bg-secondary/50"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFloorDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveFloor}>{editingFloor ? 'Save' : 'Create Floor'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={tableDialogOpen} onOpenChange={setTableDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTable ? 'Edit Table' : 'Add Table'}</DialogTitle>
            <DialogDescription>
              {activeFloor
                ? `Configure table on ${activeFloor.name}. Active tables appear in POS.`
                : 'Configure table details.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="table-number">Table Number</Label>
              <Input
                id="table-number"
                type="number"
                min={1}
                value={tableForm.number}
                onChange={(e) => setTableForm((f) => ({ ...f, number: e.target.value }))}
                placeholder="1"
                className="bg-secondary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="table-seats">Number of Seats</Label>
              <Input
                id="table-seats"
                type="number"
                min={1}
                value={tableForm.seats}
                onChange={(e) => setTableForm((f) => ({ ...f, seats: e.target.value }))}
                placeholder="4"
                className="bg-secondary/50"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-4 py-3">
              <div>
                <Label htmlFor="table-active">Active Status</Label>
                <p className="text-xs text-muted-foreground">Inactive tables are hidden from the POS floor popup</p>
              </div>
              <Switch
                id="table-active"
                checked={tableForm.active}
                onCheckedChange={(checked) => setTableForm((f) => ({ ...f, active: checked }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTableDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveTable}>{editingTable ? 'Save Changes' : 'Add Table'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteFloorTarget}
        onOpenChange={() => setDeleteFloorTarget(null)}
        title="Delete Floor"
        description={`Delete "${deleteFloorTarget?.name}" and all ${deleteFloorTarget?.tables.length ?? 0} table(s) on it?`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={async () => {
          if (deleteFloorTarget) {
            await deleteFloor(deleteFloorTarget.id)
            toast.success('Floor deleted')
          }
        }}
      />

      <ConfirmDialog
        open={!!deleteTableTarget}
        onOpenChange={() => setDeleteTableTarget(null)}
        title="Delete Table"
        description={`Delete table T${deleteTableTarget?.table.number}?`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={async () => {
          if (deleteTableTarget) {
            await deleteTable(deleteTableTarget.floorId, deleteTableTarget.table.id)
            toast.success('Table deleted')
          }
        }}
      />
    </motion.div>
  )
}
