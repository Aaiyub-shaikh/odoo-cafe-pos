import { useEffect, useState } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { usePosStore, usePromotionStore } from '@/store'
import { formatCurrency } from '@/utils'

interface CouponDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CouponDialog({ open, onOpenChange }: CouponDialogProps) {
  const { couponCode, couponDiscount, selectedCustomer, applyCoupon, removeCoupon } = usePosStore()
  const { coupons, fetchActiveCoupons } = usePromotionStore()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) fetchActiveCoupons()
  }, [open, fetchActiveCoupons])

  const handleApply = async (couponToApply?: string) => {
    const trimmed = (couponToApply ?? code).trim().toUpperCase()
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

  const couponLabel = (c: (typeof coupons)[0]) => {
    if (c.percentage) return `${c.percentage}% off`
    if (c.fixedAmount) return `${formatCurrency(c.fixedAmount)} off`
    return 'Discount'
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            Apply Coupon
          </DialogTitle>
          <DialogDescription>Choose an active coupon or enter a code</DialogDescription>
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
            {coupons.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Available coupons
                </p>
                <ScrollArea className="max-h-36">
                  <div className="space-y-2 pr-2">
                    {coupons.map((coupon) => (
                      <button
                        key={coupon.id}
                        type="button"
                        onClick={() => handleApply(coupon.code)}
                        className="flex w-full items-center justify-between rounded-lg border border-border bg-secondary/30 px-3 py-2 text-left transition-colors hover:border-primary/40 hover:bg-secondary/60"
                      >
                        <div>
                          <p className="font-mono font-semibold text-primary">{coupon.code}</p>
                          <p className="text-xs text-muted-foreground">{couponLabel(coupon)}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {coupon.firstTimeUserOnly && (
                            <Badge variant="outline" className="text-[10px]">First-time</Badge>
                          )}
                          {coupon.maxUsesPerUser != null && coupon.maxUsesPerUser > 0 && (
                            <Badge variant="outline" className="text-[10px]">
                              {coupon.maxUsesPerUser}× / customer
                            </Badge>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            <Input
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase())
                setError('')
              }}
              placeholder="Or enter code manually"
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
            <Button onClick={() => handleApply()}>Apply</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
