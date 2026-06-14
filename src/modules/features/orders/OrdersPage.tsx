import { useEffect, useMemo, useState } from 'react'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { ConfirmDialog, DataTable, PageHeader } from '@/components/shared'
import { useOrderStore } from '@/store'
import type { Order, OrderStatus } from '@/types'
import { cn, formatCurrency, formatDateTime, ORDER_STATUS_COLORS } from '@/utils'

export default function OrdersPage() {
  const { orders, isLoading, fetchOrders, updateOrder, deleteOrder } = useOrderStore()
  const [viewOrder, setViewOrder] = useState<Order | null>(null)
  const [editOrder, setEditOrder] = useState<Order | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ customerName: '', status: 'draft' as OrderStatus })

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [orders]
  )

  const openEdit = (order: Order) => {
    if (order.status === 'paid') return
    setEditOrder(order)
    setEditForm({ customerName: order.customerName ?? '', status: order.status })
  }

  const handleSaveEdit = () => {
    if (!editOrder) return
    updateOrder(editOrder.id, {
      customerName: editForm.customerName,
      status: editForm.status,
    })
    toast.success('Order updated')
    setEditOrder(null)
  }

  const handleDelete = () => {
    if (!deleteId) return
    deleteOrder(deleteId)
    toast.success('Order deleted')
    setDeleteId(null)
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Orders" description="Manage restaurant orders and track payment status" />

      <DataTable
        data={sortedOrders}
        isLoading={isLoading}
        emptyMessage="No orders found"
        columns={[
          {
            key: 'orderNumber',
            header: 'Order Number',
            cell: (order) => <span className="font-medium text-primary">{order.orderNumber}</span>,
          },
          {
            key: 'customer',
            header: 'Customer',
            cell: (order) => order.customerName ?? 'Walk-in',
          },
          {
            key: 'amount',
            header: 'Amount',
            cell: (order) => formatCurrency(order.total),
          },
          {
            key: 'status',
            header: 'Status',
            cell: (order) => (
              <Badge className={cn('capitalize border', ORDER_STATUS_COLORS[order.status])}>
                {order.status}
              </Badge>
            ),
          },
          {
            key: 'date',
            header: 'Date',
            cell: (order) => formatDateTime(order.createdAt),
          },
          {
            key: 'actions',
            header: 'Actions',
            className: 'text-right',
            cell: (order) => {
              const isReadOnly = order.status === 'paid'
              return (
                <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" onClick={() => setViewOrder(order)} title="View">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={isReadOnly}
                    onClick={() => openEdit(order)}
                    title={isReadOnly ? 'Paid orders are read-only' : 'Edit'}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={isReadOnly}
                    onClick={() => setDeleteId(order.id)}
                    title={isReadOnly ? 'Paid orders are read-only' : 'Delete'}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              )
            },
          },
        ]}
      />

      <Dialog open={!!viewOrder} onOpenChange={(open) => !open && setViewOrder(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Order {viewOrder?.orderNumber}</DialogTitle>
          </DialogHeader>
          {viewOrder && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-medium">{viewOrder.customerName ?? 'Walk-in'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge className={cn('capitalize border mt-1', ORDER_STATUS_COLORS[viewOrder.status])}>
                    {viewOrder.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Total</p>
                  <p className="font-medium">{formatCurrency(viewOrder.total)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">{formatDateTime(viewOrder.createdAt)}</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground mb-2">Items</p>
                <div className="rounded-lg border border-border divide-y divide-border">
                  {viewOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between px-3 py-2">
                      <span>{item.productName} × {item.quantity}</span>
                      <span>{formatCurrency(item.lineTotal)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editOrder} onOpenChange={(open) => !open && setEditOrder(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Order {editOrder?.orderNumber}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer</Label>
              <Input
                id="customerName"
                value={editForm.customerName}
                onChange={(e) => setEditForm((f) => ({ ...f, customerName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(v) => setEditForm((f) => ({ ...f, status: v as OrderStatus }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOrder(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete order"
        description="This action cannot be undone. Are you sure you want to delete this order?"
        onConfirm={handleDelete}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  )
}
