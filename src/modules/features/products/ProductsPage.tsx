import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Eye, MoreHorizontal, Package, Pencil, Plus, Trash2 } from 'lucide-react'
import { PageHeader, DataTable, SearchInput, ConfirmDialog } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useProductStore, useCategoryStore } from '@/store'
import { formatCurrency } from '@/utils'
import type { Product } from '@/types'

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  categoryId: z.string().min(1, 'Category is required'),
  price: z.coerce.number().min(0, 'Price must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  tax: z.coerce.number().min(0).max(100),
  description: z.string().optional(),
  image: z.string().optional(),
})

type ProductFormValues = z.infer<typeof productSchema>

const defaultValues: ProductFormValues = {
  name: '',
  categoryId: '',
  price: 0,
  unit: 'plate',
  tax: 5,
  description: '',
  image: '',
}

export default function ProductsPage() {
  const { products, fetchProducts, addProduct, updateProduct, deleteProduct } = useProductStore()
  const { categories, fetchCategories, addCategory } = useCategoryStore()

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [fetchProducts, fetchCategories])

  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [viewProduct, setViewProduct] = useState<Product | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues,
  })

  const categoryId = watch('categoryId')

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase()
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        categories.find((c) => c.id === p.categoryId)?.name.toLowerCase().includes(q)
    )
  }, [products, categories, search])

  const getCategory = (id: string) => categories.find((c) => c.id === id)

  const openCreate = () => {
    setEditingProduct(null)
    reset(defaultValues)
    setShowNewCategory(false)
    setNewCategoryName('')
    setFormOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditingProduct(product)
    reset({
      name: product.name,
      categoryId: product.categoryId,
      price: product.price,
      unit: product.unit,
      tax: product.tax,
      description: product.description ?? '',
      image: product.image ?? '',
    })
    setShowNewCategory(false)
    setFormOpen(true)
  }

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim()
    if (!name) return
    const colors = ['#da291c', '#ffc72c', '#2e7d32', '#1565c0', '#6a1b9a', '#c62828']
    const color = colors[categories.length % colors.length]
    const created = await addCategory({ name, color })
    setValue('categoryId', created.id)
    setNewCategoryName('')
    setShowNewCategory(false)
  }

  const onSubmit = async (values: ProductFormValues) => {
    const payload = {
      ...values,
      description: values.description || undefined,
      image: values.image || undefined,
      active: true,
    }

    if (editingProduct) {
      await updateProduct(editingProduct.id, payload)
    } else {
      await addProduct(payload)
    }

    setFormOpen(false)
    setEditingProduct(null)
    reset(defaultValues)
  }

  const columns = [
    {
      key: 'image',
      header: 'Image',
      className: 'w-16',
      cell: (product: Product) => (
        <div className="h-10 w-10 overflow-hidden rounded-md border border-border bg-secondary">
          {product.image ? (
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      cell: (product: Product) => <span className="font-medium">{product.name}</span>,
    },
    {
      key: 'category',
      header: 'Category',
      cell: (product: Product) => {
        const cat = getCategory(product.categoryId)
        return cat ? (
          <Badge
            variant="outline"
            className="border-transparent"
            style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
          >
            {cat.name}
          </Badge>
        ) : (
          '—'
        )
      },
    },
    {
      key: 'price',
      header: 'Price',
      cell: (product: Product) => formatCurrency(product.price),
    },
    {
      key: 'unit',
      header: 'Unit',
      cell: (product: Product) => <span className="capitalize text-muted-foreground">{product.unit}</span>,
    },
    {
      key: 'tax',
      header: 'Tax',
      cell: (product: Product) => `${product.tax}%`,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12',
      cell: (product: Product) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setViewProduct(product)}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openEdit(product)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteTarget(product)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <PageHeader title="Products" description="Manage your menu items and pricing">
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </PageHeader>

      <SearchInput value={search} onChange={setSearch} placeholder="Search products..." className="max-w-sm" />

      <DataTable columns={columns} data={filteredProducts} emptyMessage="No products found" />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update product details below.' : 'Fill in the details to add a new product.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register('name')} className="bg-secondary/50" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Category</Label>
                <Button type="button" variant="ghost" size="sm" className="h-7 text-xs text-primary" onClick={() => setShowNewCategory(!showNewCategory)}>
                  + Create new
                </Button>
              </div>
              <Select value={categoryId} onValueChange={(v) => setValue('categoryId', v)}>
                <SelectTrigger className="bg-secondary/50">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                        {cat.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}

              {showNewCategory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex gap-2 pt-1"
                >
                  <Input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="New category name"
                    className="bg-secondary/50"
                  />
                  <Button type="button" size="sm" onClick={handleCreateCategory}>
                    Add
                  </Button>
                </motion.div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input id="price" type="number" step="0.01" {...register('price')} className="bg-secondary/50" />
                {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input id="unit" {...register('unit')} className="bg-secondary/50" />
                {errors.unit && <p className="text-xs text-destructive">{errors.unit.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax">Tax (%)</Label>
                <Input id="tax" type="number" {...register('tax')} className="bg-secondary/50" />
                {errors.tax && <p className="text-xs text-destructive">{errors.tax.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register('description')} className="bg-secondary/50" rows={3} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input id="image" {...register('image')} placeholder="https://..." className="bg-secondary/50" />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingProduct ? 'Save Changes' : 'Create Product'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewProduct} onOpenChange={() => setViewProduct(null)}>
        <DialogContent className="sm:max-w-md">
          {viewProduct && (
            <>
              <DialogHeader>
                <DialogTitle>{viewProduct.name}</DialogTitle>
                <DialogDescription>Product details</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {viewProduct.image && (
                  <img src={viewProduct.image} alt={viewProduct.name} className="h-40 w-full rounded-lg object-cover" />
                )}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Category</p>
                    <p className="font-medium">{getCategory(viewProduct.categoryId)?.name ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Price</p>
                    <p className="font-medium">{formatCurrency(viewProduct.price)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Unit</p>
                    <p className="font-medium capitalize">{viewProduct.unit}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tax</p>
                    <p className="font-medium">{viewProduct.tax}%</p>
                  </div>
                </div>
                {viewProduct.description && (
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="text-sm">{viewProduct.description}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete Product"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => deleteTarget && deleteProduct(deleteTarget.id)}
      />
    </motion.div>
  )
}
