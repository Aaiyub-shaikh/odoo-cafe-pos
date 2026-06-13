import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { Banknote, CreditCard, Smartphone, Check, X, Printer, Mail } from 'lucide-react'
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
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  usePaymentStore,
  useOrderStore,
  usePosStore,
  useSessionStore,
  useAuthStore,
} from '@/store'
import type { Order, OrderItem } from '@/types'
import { cn, formatCurrency } from '@/utils'
import { toast } from 'sonner'

interface PaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type PaymentType = 'cash' | 'card' | 'upi'

const METHOD_ICONS: Record<PaymentType, React.ReactNode> = {
  cash: <Banknote className="h-5 w-5" />,
  card: <CreditCard className="h-5 w-5" />,
  upi: <Smartphone className="h-5 w-5" />,
}

export function PaymentModal({ open, onOpenChange }: PaymentModalProps) {
  const { methods, fetchMethods } = usePaymentStore()
  const { createOrder } = useOrderStore()
  const {
    cart,
    selectedCustomer,
    selectedTableId,
    couponCode,
    getSubtotal,
    getTax,
    getDiscount,
    getTotal,
    clearCart,
  } = usePosStore()
  const { session } = useSessionStore()
  const { user } = useAuthStore()

  const [selectedMethod, setSelectedMethod] = useState<PaymentType>('cash')
  const [receivedAmount, setReceivedAmount] = useState('')
  const [transactionRef, setTransactionRef] = useState('')
  const [step, setStep] = useState<'payment' | 'receipt'>('payment')
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null)
  const [receiptEmail, setReceiptEmail] = useState<string | null>(null)

  const enabledMethods = methods.filter((m) => m.enabled)
  const total = getTotal()
  const changeDue = useMemo(() => {
    const received = parseFloat(receivedAmount) || 0
    return Math.max(0, received - total)
  }, [receivedAmount, total])

  const upiMethod = methods.find((m) => m.type === 'upi')
  const upiQrValue = upiMethod?.upiId
    ? `upi://pay?pa=${upiMethod.upiId}&pn=RestMana&am=${total.toFixed(2)}&cu=INR`
    : ''

  useEffect(() => {
    if (open) {
      fetchMethods()
      setReceivedAmount(total.toFixed(0))
      setTransactionRef('')
      setStep('payment')
      setCompletedOrder(null)
      const first = methods.find((m) => m.enabled)
      if (first) setSelectedMethod(first.type)
    }
  }, [open, fetchMethods, total, methods])

  const canConfirm = () => {
    if (cart.length === 0) return false
    if (!session || !user) return false
    if (selectedMethod === 'cash') return (parseFloat(receivedAmount) || 0) >= total
    if (selectedMethod === 'card') return transactionRef.trim().length >= 4
    return true
  }

  const handleConfirm = () => {
    if (!canConfirm() || !session || !user) return

    const orderItems: OrderItem[] = cart.map((item) => ({
      id: crypto.randomUUID(),
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.unitPrice * item.quantity,
      kitchenStatus: 'to_cook' as const,
    }))

    const order = createOrder({
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name ?? 'Walk-in',
      tableId: selectedTableId ?? undefined,
      items: orderItems,
      subtotal: getSubtotal(),
      tax: getTax(),
      discount: getDiscount(),
      total,
      status: 'paid',
      paymentMethod: selectedMethod,
      couponCode: couponCode ?? undefined,
      employeeId: user.id,
      employeeName: user.name,
      sessionId: session.id,
    })

    setReceiptEmail(selectedCustomer?.email ?? null)
    clearCart()
    setCompletedOrder(order)
    setStep('receipt')
    toast.success(`Payment received for ${order.orderNumber}`)
  }

  const handlePrintReceipt = () => {
    window.print()
    toast.success('Receipt sent to printer (mock)')
  }

  const handleEmailReceipt = () => {
    if (!receiptEmail) {
      toast.error('No customer email on file')
      return
    }
    toast.success(`Receipt emailed to ${receiptEmail} (mock)`)
  }

  const handleDone = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-border bg-card sm:max-w-lg">
        {step === 'payment' ? (
          <>
        <DialogHeader>
          <DialogTitle>Payment</DialogTitle>
          <DialogDescription>Cash, Card/Digital, or UPI QR</DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-border bg-secondary/30 p-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Amount Due</span>
            <span className="text-2xl font-bold text-primary">{formatCurrency(total)}</span>
          </div>
          <Separator className="my-3" />
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(getSubtotal())}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>{formatCurrency(getTax())}</span>
            </div>
            {getDiscount() > 0 && (
              <div className="flex justify-between text-success">
                <span>Discount</span>
                <span>-{formatCurrency(getDiscount())}</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {enabledMethods.map((method) => (
            <button
              key={method.id}
              type="button"
              onClick={() => setSelectedMethod(method.type)}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-all',
                selectedMethod === method.type
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-secondary/30 hover:border-primary/40'
              )}
            >
              {METHOD_ICONS[method.type]}
              <span className="text-xs font-medium">{method.name}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {selectedMethod === 'cash' && (
            <motion.div
              key="cash"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-3"
            >
              <div className="space-y-2">
                <Label htmlFor="received">Amount Received</Label>
                <Input
                  id="received"
                  type="number"
                  value={receivedAmount}
                  onChange={(e) => setReceivedAmount(e.target.value)}
                  className="bg-secondary/50 text-lg"
                  min={0}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
                <span className="text-muted-foreground">Change Due</span>
                <span className={cn('text-xl font-bold', changeDue > 0 ? 'text-success' : 'text-foreground')}>
                  {formatCurrency(changeDue)}
                </span>
              </div>
            </motion.div>
          )}

          {selectedMethod === 'card' && (
            <motion.div
              key="card"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-2"
            >
              <Label htmlFor="txn-ref">Transaction Reference</Label>
              <Input
                id="txn-ref"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="Enter card transaction ID"
                className="bg-secondary/50 font-mono"
              />
            </motion.div>
          )}

          {selectedMethod === 'upi' && (
            <motion.div
              key="upi"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="rounded-xl bg-white p-4">
                <QRCodeSVG value={upiQrValue} size={180} level="M" />
              </div>
              <p className="text-sm text-muted-foreground">
                Scan to pay {formatCurrency(total)} via UPI
              </p>
              {upiMethod?.upiId && (
                <p className="text-xs font-mono text-primary">{upiMethod.upiId}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!canConfirm()}>
            <Check className="h-4 w-4" />
            Confirm Payment
          </Button>
        </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-success">Payment Successful</DialogTitle>
              <DialogDescription>
                Order {completedOrder?.orderNumber} — {formatCurrency(completedOrder?.total ?? 0)}
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-lg border border-border bg-secondary/30 p-4 text-sm space-y-1">
              <p><span className="text-muted-foreground">Customer:</span> {completedOrder?.customerName}</p>
              <p><span className="text-muted-foreground">Method:</span> {completedOrder?.paymentMethod?.toUpperCase()}</p>
              <p><span className="text-muted-foreground">Items:</span> {completedOrder?.items.length}</p>
            </div>

            <p className="text-sm text-muted-foreground">Send receipt to customer:</p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={handlePrintReceipt}>
                <Printer className="h-4 w-4" />
                Print Receipt
              </Button>
              <Button variant="outline" onClick={handleEmailReceipt}>
                <Mail className="h-4 w-4" />
                Email Receipt
              </Button>
            </div>

            <DialogFooter>
              <Button className="w-full" onClick={handleDone}>
                <Check className="h-4 w-4" />
                Done
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
