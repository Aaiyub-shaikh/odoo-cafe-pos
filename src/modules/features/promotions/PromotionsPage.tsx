import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfirmDialog, DataTable, PageHeader } from '@/components/shared'
import { usePromotionStore, useCategoryStore } from '@/store'
import type { Coupon, Promotion, PromotionType } from '@/types'
import { formatCurrency } from '@/utils'

type CouponForm = {
  code: string
  percentage: string
  fixedAmount: string
  active: boolean
  firstTimeUserOnly: boolean
  maxUsesPerUser: string
}

type PromoForm = {
  name: string
  type: PromotionType
  minQuantity: string
  minOrderAmount: string
  discount: string
  discountType: 'percentage' | 'fixed'
  active: boolean
  categoryIds: string[]
}

const emptyCoupon: CouponForm = {
  code: '',
  percentage: '',
  fixedAmount: '',
  active: true,
  firstTimeUserOnly: false,
  maxUsesPerUser: '',
}
const emptyPromo: PromoForm = {
  name: '',
  type: 'order',
  minQuantity: '',
  minOrderAmount: '',
  discount: '',
  discountType: 'percentage',
  active: true,
  categoryIds: [],
}

export default function PromotionsPage() {
  const {
    coupons,
    promotions,
    fetchCoupons,
    fetchPromotions,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    addPromotion,
    updatePromotion,
    deletePromotion,
  } = usePromotionStore()
  const { categories, fetchCategories } = useCategoryStore()

  const [couponModal, setCouponModal] = useState(false)
  const [promoModal, setPromoModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null)
  const [deleteCouponId, setDeleteCouponId] = useState<string | null>(null)
  const [deletePromoId, setDeletePromoId] = useState<string | null>(null)
  const [couponForm, setCouponForm] = useState<CouponForm>(emptyCoupon)
  const [promoForm, setPromoForm] = useState<PromoForm>(emptyPromo)

  useEffect(() => {
    fetchCoupons()
    fetchPromotions()
    fetchCategories()
  }, [fetchCoupons, fetchPromotions, fetchCategories])

  const openCouponCreate = () => {
    setEditingCoupon(null)
    setCouponForm(emptyCoupon)
    setCouponModal(true)
  }

  const openCouponEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setCouponForm({
      code: coupon.code,
      percentage: coupon.percentage?.toString() ?? '',
      fixedAmount: coupon.fixedAmount?.toString() ?? '',
      active: coupon.active,
      firstTimeUserOnly: coupon.firstTimeUserOnly ?? false,
      maxUsesPerUser: coupon.maxUsesPerUser?.toString() ?? '',
    })
    setCouponModal(true)
  }

  const saveCoupon = () => {
    if (!couponForm.code.trim()) {
      toast.error('Coupon code is required')
      return
    }
    const data = {
      code: couponForm.code.toUpperCase(),
      percentage: couponForm.percentage ? Number(couponForm.percentage) : undefined,
      fixedAmount: couponForm.fixedAmount ? Number(couponForm.fixedAmount) : undefined,
      active: couponForm.active,
      firstTimeUserOnly: couponForm.firstTimeUserOnly,
      maxUsesPerUser: couponForm.maxUsesPerUser ? Number(couponForm.maxUsesPerUser) : null,
    }
    if (editingCoupon) {
      updateCoupon(editingCoupon.id, data)
      toast.success('Coupon updated')
    } else {
      addCoupon(data)
      toast.success('Coupon created')
    }
    setCouponModal(false)
  }

  const openPromoCreate = () => {
    setEditingPromo(null)
    setPromoForm(emptyPromo)
    setPromoModal(true)
  }

  const openPromoEdit = (promo: Promotion) => {
    setEditingPromo(promo)
    setPromoForm({
      name: promo.name,
      type: promo.type,
      minQuantity: promo.minQuantity?.toString() ?? '',
      minOrderAmount: promo.minOrderAmount?.toString() ?? '',
      discount: promo.discount.toString(),
      discountType: promo.discountType,
      active: promo.active,
      categoryIds: promo.categoryIds ?? [],
    })
    setPromoModal(true)
  }

  const savePromo = () => {
    if (!promoForm.name.trim() || !promoForm.discount) {
      toast.error('Name and discount are required')
      return
    }
    if (promoForm.type === 'category' && promoForm.categoryIds.length === 0) {
      toast.error('Select at least one category')
      return
    }
    const data = {
      name: promoForm.name,
      type: promoForm.type,
      minQuantity: promoForm.minQuantity ? Number(promoForm.minQuantity) : undefined,
      minOrderAmount: promoForm.minOrderAmount ? Number(promoForm.minOrderAmount) : undefined,
      discount: Number(promoForm.discount),
      discountType: promoForm.discountType,
      active: promoForm.active,
      categoryIds: promoForm.type === 'category' ? promoForm.categoryIds : undefined,
    }
    if (editingPromo) {
      updatePromotion(editingPromo.id, data)
      toast.success('Promotion updated')
    } else {
      addPromotion(data)
      toast.success('Promotion created')
    }
    setPromoModal(false)
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Promotions" description="Manage coupons and promotional offers" />

      <Tabs defaultValue="coupons">
        <TabsList>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
          <TabsTrigger value="promotions">Promotions</TabsTrigger>
        </TabsList>

        <TabsContent value="coupons" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openCouponCreate}>
              <Plus className="h-4 w-4" />
              Add Coupon
            </Button>
          </div>
          <DataTable
            data={coupons}
            columns={[
              { key: 'code', header: 'Code', cell: (c) => <span className="font-mono font-medium text-primary">{c.code}</span> },
              {
                key: 'percentage',
                header: 'Percentage',
                cell: (c) => (c.percentage ? `${c.percentage}%` : '—'),
              },
              {
                key: 'fixed',
                header: 'Fixed Amount',
                cell: (c) => (c.fixedAmount ? formatCurrency(c.fixedAmount) : '—'),
              },
              {
                key: 'rules',
                header: 'Rules',
                cell: (c) => (
                  <div className="flex flex-wrap gap-1">
                    {c.firstTimeUserOnly && <Badge variant="outline">First-time only</Badge>}
                    {c.maxUsesPerUser != null && c.maxUsesPerUser > 0 && (
                      <Badge variant="outline">{c.maxUsesPerUser}× per user</Badge>
                    )}
                    {!c.firstTimeUserOnly && !(c.maxUsesPerUser != null && c.maxUsesPerUser > 0) && (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                ),
              },
              {
                key: 'usage',
                header: 'Uses',
                cell: (c) => c.usageCount,
              },
              {
                key: 'active',
                header: 'Active',
                cell: (c) => (
                  <Badge variant={c.active ? 'success' : 'secondary'}>{c.active ? 'Active' : 'Inactive'}</Badge>
                ),
              },
              {
                key: 'actions',
                header: 'Actions',
                className: 'text-right',
                cell: (c) => (
                  <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" onClick={() => openCouponEdit(c)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteCouponId(c.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </TabsContent>

        <TabsContent value="promotions" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openPromoCreate}>
              <Plus className="h-4 w-4" />
              Add Promotion
            </Button>
          </div>
          <DataTable
            data={promotions}
            columns={[
              { key: 'name', header: 'Name', cell: (p) => <span className="font-medium">{p.name}</span> },
              {
                key: 'type',
                header: 'Type',
                cell: (p) => {
                  if (p.type === 'category') {
                    const names = (p.categoryIds ?? [])
                      .map((id) => categories.find((c) => c.id === id)?.name)
                      .filter(Boolean)
                    return (
                      <div>
                        <span className="capitalize">Categories</span>
                        {names.length > 0 && (
                          <p className="text-xs text-muted-foreground">{names.join(', ')}</p>
                        )}
                      </div>
                    )
                  }
                  return <span className="capitalize">{p.type}</span>
                },
              },
              {
                key: 'min',
                header: 'Min Qty / Amount',
                cell: (p) => {
                  if (p.type === 'order') {
                    return p.minOrderAmount ? formatCurrency(p.minOrderAmount) : '—'
                  }
                  return p.minQuantity ?? '—'
                },
              },
              {
                key: 'discount',
                header: 'Discount',
                cell: (p) =>
                  p.discountType === 'percentage' ? `${p.discount}%` : formatCurrency(p.discount),
              },
              {
                key: 'active',
                header: 'Active',
                cell: (p) => (
                  <Badge variant={p.active ? 'success' : 'secondary'}>{p.active ? 'Active' : 'Inactive'}</Badge>
                ),
              },
              {
                key: 'actions',
                header: 'Actions',
                className: 'text-right',
                cell: (p) => (
                  <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" onClick={() => openPromoEdit(p)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeletePromoId(p.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={couponModal} onOpenChange={setCouponModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCoupon ? 'Edit Coupon' : 'Create Coupon'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Code</Label>
              <Input value={couponForm.code} onChange={(e) => setCouponForm((f) => ({ ...f, code: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Percentage (%)</Label>
                <Input type="number" value={couponForm.percentage} onChange={(e) => setCouponForm((f) => ({ ...f, percentage: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Fixed Amount</Label>
                <Input type="number" value={couponForm.fixedAmount} onChange={(e) => setCouponForm((f) => ({ ...f, fixedAmount: e.target.value }))} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="couponActive"
                checked={couponForm.active}
                onCheckedChange={(v) => setCouponForm((f) => ({ ...f, active: !!v }))}
              />
              <Label htmlFor="couponActive">Active</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="firstTimeOnly"
                checked={couponForm.firstTimeUserOnly}
                onCheckedChange={(v) => setCouponForm((f) => ({ ...f, firstTimeUserOnly: !!v }))}
              />
              <Label htmlFor="firstTimeOnly">First-time customers only</Label>
            </div>
            <div className="space-y-2">
              <Label>Max uses per customer (leave empty for unlimited)</Label>
              <Input
                type="number"
                min={1}
                placeholder="e.g. 1"
                value={couponForm.maxUsesPerUser}
                onChange={(e) => setCouponForm((f) => ({ ...f, maxUsesPerUser: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCouponModal(false)}>Cancel</Button>
            <Button onClick={saveCoupon}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={promoModal} onOpenChange={setPromoModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPromo ? 'Edit Promotion' : 'Create Promotion'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={promoForm.name} onChange={(e) => setPromoForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={promoForm.type} onValueChange={(v) => setPromoForm((f) => ({ ...f, type: v as PromotionType, categoryIds: v === 'category' ? f.categoryIds : [] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="order">Order</SelectItem>
                    <SelectItem value="category">Categories (one or more)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Discount Type</Label>
                <Select value={promoForm.discountType} onValueChange={(v) => setPromoForm((f) => ({ ...f, discountType: v as 'percentage' | 'fixed' }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {promoForm.type === 'order' ? (
                <div className="space-y-2">
                  <Label>Min Order Amount</Label>
                  <Input type="number" value={promoForm.minOrderAmount} onChange={(e) => setPromoForm((f) => ({ ...f, minOrderAmount: e.target.value }))} />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Min Quantity</Label>
                  <Input type="number" value={promoForm.minQuantity} onChange={(e) => setPromoForm((f) => ({ ...f, minQuantity: e.target.value }))} />
                </div>
              )}
              <div className="space-y-2">
                <Label>Discount</Label>
                <Input type="number" value={promoForm.discount} onChange={(e) => setPromoForm((f) => ({ ...f, discount: e.target.value }))} />
              </div>
            </div>
            {promoForm.type === 'category' && (
              <div className="space-y-2">
                <Label>Categories (select one or more)</Label>
                <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border border-border p-3">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`cat-${cat.id}`}
                        checked={promoForm.categoryIds.includes(cat.id)}
                        onCheckedChange={(checked) => {
                          setPromoForm((f) => ({
                            ...f,
                            categoryIds: checked
                              ? [...f.categoryIds, cat.id]
                              : f.categoryIds.filter((id) => id !== cat.id),
                          }))
                        }}
                      />
                      <Label htmlFor={`cat-${cat.id}`}>{cat.name}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Checkbox
                id="promoActive"
                checked={promoForm.active}
                onCheckedChange={(v) => setPromoForm((f) => ({ ...f, active: !!v }))}
              />
              <Label htmlFor="promoActive">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPromoModal(false)}>Cancel</Button>
            <Button onClick={savePromo}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteCouponId}
        onOpenChange={(open) => !open && setDeleteCouponId(null)}
        title="Delete coupon"
        description="Are you sure you want to delete this coupon?"
        onConfirm={() => {
          if (deleteCouponId) deleteCoupon(deleteCouponId)
          toast.success('Coupon deleted')
        }}
        confirmLabel="Delete"
        variant="destructive"
      />

      <ConfirmDialog
        open={!!deletePromoId}
        onOpenChange={(open) => !open && setDeletePromoId(null)}
        title="Delete promotion"
        description="Are you sure you want to delete this promotion?"
        onConfirm={() => {
          if (deletePromoId) deletePromotion(deletePromoId)
          toast.success('Promotion deleted')
        }}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  )
}
