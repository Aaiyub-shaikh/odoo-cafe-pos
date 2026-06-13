import { useEffect, useState } from 'react'
import { Archive, KeyRound, Trash2 } from 'lucide-react'
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
import { ConfirmDialog, DataTable, PageHeader } from '@/components/shared'
import { useEmployeeStore } from '@/store'
import type { Employee } from '@/types'

export default function EmployeesPage() {
  const { employees, isLoading, fetchEmployees, archiveEmployee, deleteEmployee } = useEmployeeStore()
  const [passwordEmployee, setPasswordEmployee] = useState<Employee | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [archiveId, setArchiveId] = useState<string | null>(null)
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' })

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  const handlePasswordChange = () => {
    if (passwords.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    toast.success(`Password updated for ${passwordEmployee?.name}`)
    setPasswordEmployee(null)
    setPasswords({ newPassword: '', confirmPassword: '' })
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Employees" description="Manage staff accounts and access roles" />

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
                {e.role}
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
        title="Archive employee"
        description="This employee will no longer be able to access the system."
        onConfirm={() => {
          if (archiveId) archiveEmployee(archiveId)
          toast.success('Employee archived')
        }}
        confirmLabel="Archive"
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete employee"
        description="This action cannot be undone."
        onConfirm={() => {
          if (deleteId) deleteEmployee(deleteId)
          toast.success('Employee deleted')
        }}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  )
}
