import { useState } from 'react'
import { motion } from 'framer-motion'
import { FolderOpen, Pencil, Plus, Trash2 } from 'lucide-react'
import { PageHeader, DataTable, ConfirmDialog } from '@/components/shared'
import { Button } from '@/components/ui/button'
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
import { useCategoryStore } from '@/store'
import { cn } from '@/utils'
import type { Category } from '@/types'

const PRESET_COLORS = [
  '#da291c',
  '#ffc72c',
  '#2e7d32',
  '#1565c0',
  '#6a1b9a',
  '#3e2723',
  '#f9a825',
  '#c62828',
  '#00695c',
  '#5d4037',
]

export default function CategoriesPage() {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategoryStore()

  const [formOpen, setFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0])

  const openCreate = () => {
    setEditingCategory(null)
    setName('')
    setColor(PRESET_COLORS[categories.length % PRESET_COLORS.length])
    setFormOpen(true)
  }

  const openEdit = (category: Category) => {
    setEditingCategory(category)
    setName(category.name)
    setColor(category.color)
    setFormOpen(true)
  }

  const handleSave = () => {
    const trimmed = name.trim()
    if (!trimmed) return

    if (editingCategory) {
      updateCategory(editingCategory.id, { name: trimmed, color })
    } else {
      addCategory({ name: trimmed, color })
    }

    setFormOpen(false)
    setEditingCategory(null)
    setName('')
  }

  const columns = [
    {
      key: 'name',
      header: 'Name',
      cell: (category: Category) => (
        <div className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{category.name}</span>
        </div>
      ),
    },
    {
      key: 'color',
      header: 'Color',
      cell: (category: Category) => (
        <div className="flex items-center gap-2">
          <span
            className="h-6 w-6 rounded-md border border-border shadow-sm"
            style={{ backgroundColor: category.color }}
          />
          <span className="text-xs text-muted-foreground font-mono">{category.color}</span>
        </div>
      ),
    },
    {
      key: 'productCount',
      header: 'Products',
      cell: (category: Category) => (
        <span className="text-muted-foreground">{category.productCount ?? 0}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      cell: (category: Category) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(category)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => setDeleteTarget(category)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <PageHeader title="Categories" description="Organize your menu with color-coded categories">
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </PageHeader>

      <DataTable columns={columns} data={categories} emptyMessage="No categories found" />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Create Category'}</DialogTitle>
            <DialogDescription>
              {editingCategory ? 'Update the category name or color.' : 'Add a new menu category.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Name</Label>
              <Input
                id="cat-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Category name"
                className="bg-secondary/50"
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setColor(preset)}
                    className={cn(
                      'h-8 w-8 rounded-md border-2 transition-transform hover:scale-110',
                      color === preset ? 'border-primary ring-2 ring-primary/30' : 'border-transparent'
                    )}
                    style={{ backgroundColor: preset }}
                    aria-label={`Select color ${preset}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="h-6 w-6 rounded-md border border-border" style={{ backgroundColor: color }} />
                <span className="text-xs text-muted-foreground font-mono">{color}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!name.trim()}>
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete Category"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? Products in this category will need reassignment.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => deleteTarget && deleteCategory(deleteTarget.id)}
      />
    </motion.div>
  )
}
