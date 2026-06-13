import { useEffect, useMemo, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
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
import { ConfirmDialog, DataTable, PageHeader, SearchInput } from '@/components/shared'
import { useCustomerStore } from '@/store'
import type { Customer } from '@/types'
import { formatCurrency } from '@/utils'

type CustomerForm = { name: string; email: string; phone: string }

const emptyForm: CustomerForm = { name: '', email: '', phone: '' }

export default function CustomersPage() {
  const { customers, isLoading, fetchCustomers, addCustomer, updateCustomer, deleteCustomer } = useCustomerStore()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<CustomerForm>(emptyForm)

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return customers
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q)
    )
  }, [customers, search])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (customer: Customer) => {
    setEditing(customer)
    setForm({ name: customer.name, email: customer.email, phone: customer.phone })
    setModalOpen(true)
  }

  const handleSubmit = () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and email are required')
      return
    }
    if (editing) {
      updateCustomer(editing.id, form)
      toast.success('Customer updated')
    } else {
      addCustomer(form)
      toast.success('Customer created')
    }
    setModalOpen(false)
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Customers" description="Manage customer records and contact details">
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </PageHeader>

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search by name, email, or phone..."
        className="max-w-sm"
      />

      <DataTable
        data={filtered}
        isLoading={isLoading}
        columns={[
          { key: 'name', header: 'Name', cell: (c) => <span className="font-medium">{c.name}</span> },
          { key: 'email', header: 'Email', cell: (c) => c.email },
          { key: 'phone', header: 'Phone', cell: (c) => c.phone },
          {
            key: 'orders',
            header: 'Orders',
            cell: (c) => c.totalOrders,
          },
          {
            key: 'spent',
            header: 'Total Spent',
            cell: (c) => formatCurrency(c.totalSpent),
          },
          {
            key: 'actions',
            header: 'Actions',
            className: 'text-right',
            cell: (c) => (
              <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteId(c.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ),
          },
        ]}
      />

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Customer' : 'Create Customer'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editing ? 'Save Changes' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete customer"
        description="Are you sure you want to delete this customer?"
        onConfirm={() => {
          if (deleteId) deleteCustomer(deleteId)
          toast.success('Customer deleted')
        }}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  )
}
