import { useEffect, useState } from 'react'
import { Archive, KeyRound, Plus, Trash2 } from 'lucide-react'
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
import { useEmployeeStore } from '@/store'
import { ApiError } from '@/services/api'
import type { Employee } from '@/types'

type AddEmployeeForm = {
  name: string
  email: string
  password: string
  role: 'cashier' | 'admin'
}

const emptyForm: AddEmployeeForm = { name: '', email: '', password: '', role: 'cashier' }

export default function EmployeesPage() {
  const { employees, isLoading, fetchEmployees, addEmployee, updateEmployee, archiveEmployee, deleteEmployee } =
    useEmployeeStore()
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState<AddEmployeeForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [passwordEmployee, setPasswordEmployee] = useState<Employee | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [archiveId, setArchiveId] = useState<string | null>(null)
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' })

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  const handleAddEmployee = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      toast.error('Name, email, and password are required')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setSaving(true)
    try {
      await addEmployee({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      })
      toast.success('User added successfully')
      setAddOpen(false)
      setForm(emptyForm)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to add user')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!passwordEmployee) return
    if (passwords.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    try {
      await updateEmployee(passwordEmployee.id, { password: passwords.newPassword })
      toast.success(`Password updated for ${passwordEmployee.name}`)
      setPasswordEmployee(null)
      setPasswords({ newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update password')
    }
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Users" description="Add and manage admin and employee accounts">
        <Button onClick={() => { setForm(emptyForm); setAddOpen(true) }}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </PageHeader>

      <DataTable
        data={employees}
        isLoading={isLoading}
        columns={[
          { key: 'name', header: 'Name', cell: (e) => <span className="font-medium">{e.name}</span> },
          { key: 'email', header: 'Email', cell: (e) => e.email },
          {
            key: 'role',
            header: 'Role',
            cell: (e) => (
              <Badge variant={e.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                {e.role === 'cashier' ? 'Employee' : e.role}
              </Badge>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            cell: (e) => (
              <Badge variant={e.status === 'active' ? 'success' : 'warning'} className="capitalize">
                {e.status}
              </Badge>
            ),
          },
          {
            key: 'actions',
            header: 'Actions',
            className: 'text-right',
            cell: (e) => (
              <div className="flex justify-end gap-1" onClick={(ev) => ev.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Change password"
                  onClick={() => {
                    setPasswordEmployee(e)
                    setPasswords({ newPassword: '', confirmPassword: '' })
                  }}
                >
                  <KeyRound className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Archive"
                  disabled={e.status === 'archived'}
                  onClick={() => setArchiveId(e.id)}
                >
                  <Archive className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" title="Delete" onClick={() => setDeleteId(e.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ),
          },
        ]}
      />

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">Full Name</Label>
              <Input
                id="add-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Employee name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-email">Email</Label>
              <Input
                id="add-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="employee@restaurant.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-password">Password</Label>
              <Input
                id="add-password"
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Min. 6 characters"
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v as 'cashier' | 'admin' }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cashier">Employee (POS access)</SelectItem>
                  <SelectItem value="admin">Admin (full access)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddEmployee} disabled={saving}>
              {saving ? 'Adding...' : 'Add User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!passwordEmployee} onOpenChange={(open) => !open && setPasswordEmployee(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Update password for {passwordEmployee?.name}
          </p>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordEmployee(null)}>Cancel</Button>
            <Button onClick={handlePasswordChange}>Update Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!archiveId}
        onOpenChange={(open) => !open && setArchiveId(null)}
        title="Archive user"
        description="This user will no longer be able to access the system."
        onConfirm={async () => {
          if (archiveId) {
            await archiveEmployee(archiveId)
            toast.success('User archived')
          }
        }}
        confirmLabel="Archive"
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete user"
        description="This action cannot be undone."
        onConfirm={async () => {
          if (deleteId) {
            try {
              await deleteEmployee(deleteId)
              toast.success('User deleted')
            } catch (err) {
              toast.error(err instanceof ApiError ? err.message : 'Failed to delete user')
            }
          }
        }}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  )
}
