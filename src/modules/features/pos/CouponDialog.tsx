import { useState } from 'react'
import { motion } from 'framer-motion'
import { Tag, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePosStore } from '@/store'
import { formatCurrency } from '@/utils'

interface CouponDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CouponDialog({ open, onOpenChange }: CouponDialogProps) {
  const { couponCode, couponDiscount, selectedCustomer, applyCoupon, removeCoupon } = usePosStore()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const handleApply = async () => {
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) {
      setError('Enter a coupon code')
      return
    }
    const result = await applyCoupon(trimmed)
    if (result.success) {
      setError('')
      setCode('')
      onOpenChange(false)
    } else {
      setError(result.error ?? 'Invalid or expired coupon code')
    }
  }

  const handleRemove = () => {
    removeCoupon()
    setCode('')
    setError('')
    onOpenChange(false)
  }

  const handleOpenChange = (value: boolean) => {
    onOpenChange(value)
    if (!value) {
      setCode('')
      setError('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            Apply Coupon
          </DialogTitle>
          <DialogDescription>Enter a valid coupon code to get a discount</DialogDescription>
        </DialogHeader>

        {couponCode ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-lg border border-primary/30 bg-primary/10 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active coupon</p>
                <p className="text-lg font-semibold text-primary">{couponCode}</p>
              </div>
              <p className="text-lg font-bold text-success">-{formatCurrency(couponDiscount)}</p>
            </div>
            <Button variant="outline" size="sm" className="mt-3 w-full" onClick={handleRemove}>
              <X className="h-4 w-4" />
              Remove Coupon
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <Input
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase())
                setError('')
              }}
              placeholder="e.g. SAVE10"
              className="bg-secondary/50 text-center text-lg font-mono tracking-widest uppercase"
              onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            />
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-destructive text-center"
              >
                {error}
              </motion.p>
            )}
            <p className="text-xs text-muted-foreground text-center">
              {selectedCustomer
                ? `Applying for ${selectedCustomer.name}`
                : 'Some coupons require a customer to be selected first'}
            </p>
          </div>
        )}

        {!couponCode && (
          <DialogFooter>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply}>Apply</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
