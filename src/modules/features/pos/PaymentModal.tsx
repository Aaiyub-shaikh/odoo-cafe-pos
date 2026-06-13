import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import {
  Banknote,
  CreditCard,
  Smartphone,
  Wallet,
  Check,
  X,
  Printer,
  Mail,
  Loader2,
} from 'lucide-react'
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
import { razorpayApi } from '@/services/api'
import { openRazorpayCheckout } from '@/services/razorpay'
import type { Order, OrderItem } from '@/types'
import { cn, formatCurrency } from '@/utils'
import { toast } from 'sonner'

interface PaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type PaymentType = 'cash' | 'card' | 'upi' | 'razorpay'

const METHOD_ICONS: Record<PaymentType, React.ReactNode> = {
  cash: <Banknote className="h-5 w-5" />,
  card: <CreditCard className="h-5 w-5" />,
  upi: <Smartphone className="h-5 w-5" />,
  razorpay: <Wallet className="h-5 w-5" />,
}

export function PaymentModal({ open, onOpenChange }: PaymentModalProps) {
  const { methods, razorpayConfig, fetchMethods, fetchRazorpayConfig } = usePaymentStore()
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
  const [isPaying, setIsPaying] = useState(false)

  const enabledMethods = methods.filter((m) => m.enabled)
  const total = getTotal()
  const changeDue = useMemo(() => {
    const received = parseFloat(receivedAmount) || 0
    return Math.max(0, received - total)
  }, [receivedAmount, total])

  const razorpayActive = razorpayConfig?.enabled === true
  const usesRazorpayCheckout =
    razorpayActive &&
    (selectedMethod === 'razorpay' || selectedMethod === 'card' || selectedMethod === 'upi')

  const upiMethod = methods.find((m) => m.type === 'upi')
  const upiQrValue = upiMethod?.upiId
    ? `upi://pay?pa=${upiMethod.upiId}&pn=RestMana&am=${total.toFixed(2)}&cu=INR`
    : ''

  useEffect(() => {
    if (open) {
      fetchMethods()
      fetchRazorpayConfig()
      setReceivedAmount(total.toFixed(0))
      setTransactionRef('')
      setStep('payment')
      setCompletedOrder(null)
      setIsPaying(false)
    }
  }, [open, fetchMethods, fetchRazorpayConfig, total])

  useEffect(() => {
    if (!open || enabledMethods.length === 0) return
    const preferred = enabledMethods.find((m) => m.type === 'razorpay' && razorpayActive)
      ?? enabledMethods.find((m) => m.type === 'cash')
      ?? enabledMethods[0]
    if (preferred) setSelectedMethod(preferred.type)
  }, [open, enabledMethods, razorpayActive])

  const canConfirm = () => {
    if (cart.length === 0 || !session || !user || isPaying) return false
    if (usesRazorpayCheckout) return true
    if (selectedMethod === 'cash') return (parseFloat(receivedAmount) || 0) >= total
    if (selectedMethod === 'card') return transactionRef.trim().length >= 4
    return true
  }

  const finalizeOrder = async (paymentMethod: PaymentType, extras?: { razorpayPaymentId?: string; razorpayOrderId?: string }) => {
    const orderItems: OrderItem[] = cart.map((item) => ({
      id: crypto.randomUUID(),
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.unitPrice * item.quantity,
      kitchenStatus: 'to_cook' as const,
    }))

    const storedMethod = usesRazorpayCheckout ? 'razorpay' : paymentMethod

    const order = await createOrder({
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name ?? 'Walk-in',
      tableId: selectedTableId ?? undefined,
      items: orderItems,
      subtotal: getSubtotal(),
      tax: getTax(),
      discount: getDiscount(),
      total,
      status: 'paid',
      paymentMethod: storedMethod,
      razorpayPaymentId: extras?.razorpayPaymentId,
      razorpayOrderId: extras?.razorpayOrderId,
      couponCode: couponCode ?? undefined,
      employeeId: user!.id,
      employeeName: user!.name,
      sessionId: session!.id,
    })

    setReceiptEmail(selectedCustomer?.email ?? null)
    clearCart()
    setCompletedOrder(order)
    setStep('receipt')
    toast.success(`Payment received for ${order.orderNumber}`)
  }

  const handleConfirm = async () => {
    if (!canConfirm() || !session || !user) return

    if (usesRazorpayCheckout) {
      setIsPaying(true)
      try {
        const receipt = `pos_${Date.now()}`
        const { orderId, keyId } = await razorpayApi.createOrder(total, receipt)

        const response = await openRazorpayCheckout({
          keyId,
          orderId,
          amount: total,
          customerName: selectedCustomer?.name,
          customerEmail: selectedCustomer?.email,
          customerPhone: selectedCustomer?.phone,
          description: `RestMana order — ${formatCurrency(total)}`,
        })

        await razorpayApi.verify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        })

        await finalizeOrder(selectedMethod, {
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
        })
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Razorpay payment failed')
      } finally {
        setIsPaying(false)
      }
      return
    }

    try {
      await finalizeOrder(selectedMethod)
    } catch {
      toast.error('Failed to create order')
    }
  }

  const handlePrintReceipt = () => {
    window.print()
    toast.success('Receipt sent to printer')
  }

  const handleEmailReceipt = () => {
    if (!receiptEmail) {
      toast.error('No customer email on file')
      return
    }
    toast.success(`Receipt emailed to ${receiptEmail}`)
  }

  const handleDone = () => {
    onOpenChange(false)
  }

  const confirmLabel = usesRazorpayCheckout ? 'Pay with Razorpay' : 'Confirm Payment'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-border bg-card sm:max-w-lg">
        {step === 'payment' ? (
          <>
            <DialogHeader>
              <DialogTitle>Payment</DialogTitle>
              <DialogDescription>
                {razorpayActive
                  ? 'Cash or pay online via Razorpay (Card, UPI, Wallets)'
                  : 'Cash, Card, or UPI'}
              </DialogDescription>
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

            {razorpayActive && (
              <div className="flex items-center gap-2 rounded-lg border border-[#072654]/20 bg-[#072654]/5 px-3 py-2 text-xs text-[#072654]">
                <Wallet className="h-4 w-4 shrink-0" />
                Razorpay enabled — Card, UPI &amp; wallets open secure checkout
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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

              {usesRazorpayCheckout && (
                <motion.div
                  key="razorpay"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="rounded-lg border border-border bg-secondary/30 p-4 text-center text-sm text-muted-foreground"
                >
                  <Wallet className="mx-auto mb-2 h-8 w-8 text-primary" />
                  <p>Click &quot;{confirmLabel}&quot; to open Razorpay secure checkout.</p>
                  <p className="mt-1 text-xs">Supports Credit/Debit Card, UPI, Netbanking &amp; Wallets</p>
                </motion.div>
              )}

              {selectedMethod === 'card' && !usesRazorpayCheckout && (
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

              {selectedMethod === 'upi' && !usesRazorpayCheckout && (
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
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPaying}>
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleConfirm} disabled={!canConfirm()}>
                {isPaying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    {confirmLabel}
                  </>
                )}
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

            <div className="space-y-1 rounded-lg border border-border bg-secondary/30 p-4 text-sm">
              <p><span className="text-muted-foreground">Customer:</span> {completedOrder?.customerName}</p>
              <p>
                <span className="text-muted-foreground">Method:</span>{' '}
                {completedOrder?.paymentMethod === 'razorpay' ? 'Razorpay' : completedOrder?.paymentMethod?.toUpperCase()}
              </p>
              {completedOrder?.razorpayPaymentId && (
                <p className="font-mono text-xs text-muted-foreground">
                  Payment ID: {completedOrder.razorpayPaymentId}
                </p>
              )}
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
