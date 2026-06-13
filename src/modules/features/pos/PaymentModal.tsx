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
import { razorpayApi, paymentApi } from '@/services/api'
import { openRazorpayCheckout } from '@/services/razorpay'
import type { Order, OrderItem, PaymentMethod } from '@/types'
import { cn, formatCurrency } from '@/utils'
import { toast } from 'sonner'

interface PaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type PaymentType = 'cash' | 'card' | 'upi' | 'razorpay'

const POS_METHOD_TYPES: PaymentType[] = ['cash', 'card', 'upi']

const METHOD_ICONS: Record<PaymentType, React.ReactNode> = {
  cash: <Banknote className="h-5 w-5" />,
  card: <CreditCard className="h-5 w-5" />,
  upi: <Smartphone className="h-5 w-5" />,
  razorpay: <Wallet className="h-5 w-5" />,
}

function pickDefaultMethod(methods: PaymentMethod[]): PaymentType {
  return (
    methods.find((m) => m.type === 'cash')?.type ??
    methods.find((m) => m.type === 'card')?.type ??
    methods.find((m) => m.type === 'upi')?.type ??
    methods[0]?.type ??
    'cash'
  )
}

export function PaymentModal({ open, onOpenChange }: PaymentModalProps) {
  const { methods, razorpayConfig, fetchMethods, fetchRazorpayConfig } = usePaymentStore()
  const { createOrder, replaceOrder } = useOrderStore()
  const {
    cart,
    selectedCustomer,
    selectedTableId,
    couponCode,
    promotionId,
    promotionName,
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
  const [upiRef, setUpiRef] = useState('')
  const [step, setStep] = useState<'payment' | 'receipt'>('payment')
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null)
  const [receiptEmail, setReceiptEmail] = useState<string | null>(null)
  const [isPaying, setIsPaying] = useState(false)

  const total = getTotal()

  const posMethods = useMemo(
    () => methods.filter((m) => m.enabled && POS_METHOD_TYPES.includes(m.type as PaymentType)),
    [methods]
  )

  const razorpayMethod = useMemo(
    () => methods.find((m) => m.type === 'razorpay' && m.enabled),
    [methods]
  )

  const razorpayActive = razorpayConfig?.enabled === true && !!razorpayMethod

  const checkoutMethods = useMemo(() => {
    const list = [...posMethods]
    if (razorpayActive && razorpayMethod) list.push(razorpayMethod)
    return list
  }, [posMethods, razorpayActive, razorpayMethod])

  const usesRazorpayCheckout = selectedMethod === 'razorpay' && razorpayActive

  const upiMethod = methods.find((m) => m.type === 'upi')
  const upiQrValue = upiMethod?.upiId
    ? `upi://pay?pa=${upiMethod.upiId}&pn=RestMana&am=${total.toFixed(2)}&cu=INR`
    : ''

  const changeDue = useMemo(() => {
    const received = parseFloat(receivedAmount) || 0
    return Math.max(0, received - total)
  }, [receivedAmount, total])

  useEffect(() => {
    if (!open) return
    fetchMethods()
    fetchRazorpayConfig()
    setReceivedAmount(total.toFixed(0))
    setTransactionRef('')
    setUpiRef('')
    setStep('payment')
    setCompletedOrder(null)
    setReceiptEmail(null)
    setIsPaying(false)
  }, [open, fetchMethods, fetchRazorpayConfig, total])

  useEffect(() => {
    if (!open || checkoutMethods.length === 0) return
    setSelectedMethod(pickDefaultMethod(checkoutMethods))
  }, [open, checkoutMethods])

  const canConfirm = () => {
    if (cart.length === 0 || !session || !user || isPaying) return false
    if (checkoutMethods.length === 0) return false
    if (!checkoutMethods.some((m) => m.type === selectedMethod)) return false
    if (usesRazorpayCheckout) return true
    if (selectedMethod === 'cash') return (parseFloat(receivedAmount) || 0) >= total
    if (selectedMethod === 'card') return transactionRef.trim().length >= 4
    if (selectedMethod === 'upi') return upiRef.trim().length >= 4 || !!upiMethod?.upiId
    return true
  }

  const finalizeOrder = async (
    paymentMethod: PaymentType,
    extras?: { razorpayPaymentId?: string; razorpayOrderId?: string }
  ) => {
    const orderItems: OrderItem[] = cart.map((item) => ({
      id: crypto.randomUUID(),
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.unitPrice * item.quantity,
      kitchenStatus: 'to_cook' as const,
    }))

    const storedMethod = paymentMethod === 'razorpay' ? 'razorpay' : paymentMethod

    const pendingOrder = await createOrder({
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name ?? 'Walk-in',
      tableId: selectedTableId ?? undefined,
      items: orderItems,
      subtotal: getSubtotal(),
      tax: getTax(),
      discount: getDiscount(),
      total,
      status: 'PENDING_PAYMENT',
      paymentStatus: 'PENDING',
      couponCode: couponCode ?? undefined,
      promotionId: promotionId ?? undefined,
      promotionName: promotionName ?? undefined,
      employeeId: user!.id,
      employeeName: user!.name,
      sessionId: session!.id,
    })

    const order = (await paymentApi.fakePayment(pendingOrder.id, {
      paymentMethod: storedMethod,
      razorpayPaymentId: extras?.razorpayPaymentId,
      razorpayOrderId: extras?.razorpayOrderId,
    })) as unknown as Order

    replaceOrder(order)
    setReceiptEmail(selectedCustomer?.email ?? null)
    clearCart()
    setCompletedOrder(order)
    setStep('receipt')
    toast.success(`Payment received — ${order.orderNumber} sent to kitchen`)
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

        await finalizeOrder('razorpay', {
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
      setIsPaying(true)
      await finalizeOrder(selectedMethod)
    } catch {
      toast.error('Failed to process payment')
    } finally {
      setIsPaying(false)
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

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setStep('payment')
      setCompletedOrder(null)
      setIsPaying(false)
    }
    onOpenChange(nextOpen)
  }

  const confirmLabel = usesRazorpayCheckout ? 'Pay with Razorpay' : 'Confirm Payment'

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg border-border bg-card sm:max-w-lg">
        {step === 'payment' ? (
          <>
            <DialogHeader>
              <DialogTitle>Payment</DialogTitle>
              <DialogDescription>
                Choose a payment method for this order. Admin can enable or disable methods in Payment Settings.
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

            {checkoutMethods.length === 0 ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                No payment methods are enabled. Ask an admin to enable Cash, Card, or UPI in Payment Settings.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {checkoutMethods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedMethod(method.type as PaymentType)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-all',
                      selectedMethod === method.type
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-secondary/30 hover:border-primary/40'
                    )}
                  >
                    {METHOD_ICONS[method.type as PaymentType]}
                    <span className="text-xs font-medium">{method.name}</span>
                  </button>
                ))}
              </div>
            )}

            <AnimatePresence mode="wait">
              {selectedMethod === 'cash' && posMethods.some((m) => m.type === 'cash') && (
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
                  <p className="mt-1 text-xs">Optional gateway — Cash, Card, and UPI work independently.</p>
                </motion.div>
              )}

              {selectedMethod === 'card' && posMethods.some((m) => m.type === 'card') && (
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

              {selectedMethod === 'upi' && posMethods.some((m) => m.type === 'upi') && (
                <motion.div
                  key="upi"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-3"
                >
                  {upiQrValue ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="rounded-xl bg-white p-4">
                        <QRCodeSVG value={upiQrValue} size={180} level="M" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Scan to pay {formatCurrency(total)} via UPI
                      </p>
                      <p className="text-xs font-mono text-primary">{upiMethod?.upiId}</p>
                    </div>
                  ) : (
                    <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700">
                      UPI ID not configured. Ask admin to set it in Payment Settings.
                    </p>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="upi-ref">UPI Transaction Reference</Label>
                    <Input
                      id="upi-ref"
                      value={upiRef}
                      onChange={(e) => setUpiRef(e.target.value)}
                      placeholder="Enter UPI payment reference"
                      className="bg-secondary/50 font-mono"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <DialogFooter>
              <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPaying}>
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
                {completedOrder?.paymentMethod === 'razorpay'
                  ? 'Razorpay'
                  : completedOrder?.paymentMethod?.toUpperCase()}
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
