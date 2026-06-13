import { useNavigate } from 'react-router-dom'
import { LogOut, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAuthStore, useSessionStore, usePosStore } from '@/store'
import { formatCurrency } from '@/utils'

interface CloseSessionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CloseSessionDialog({ open, onOpenChange }: CloseSessionDialogProps) {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const { session, closeSession } = useSessionStore()
  const clearCart = usePosStore((s) => s.clearCart)

  const handleClose = () => {
    closeSession()
    clearCart()
    logout()
    toast.success('Session closed. Shift ended successfully.')
    onOpenChange(false)
    navigate('/login')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Close POS Session
          </DialogTitle>
          <DialogDescription>
            End your shift and close the current session. You will be logged out.
          </DialogDescription>
        </DialogHeader>

        {session && (
          <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Employee</span>
              <span className="font-medium">{session.employeeName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Orders</span>
              <span>{session.orderCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Sales</span>
              <span className="font-bold text-primary">{formatCurrency(session.totalSales)}</span>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleClose}>
            <LogOut className="h-4 w-4" />
            Close Session & Logout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
