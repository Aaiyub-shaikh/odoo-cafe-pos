import { useEffect, useState } from 'react'
import { Banknote, CreditCard, Smartphone, Wallet, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/shared'
import { usePaymentStore } from '@/store'
import type { PaymentMethod } from '@/types'

const methodIcons = {
  cash: Banknote,
  card: CreditCard,
  upi: Smartphone,
  razorpay: Wallet,
} as const

export default function PaymentsPage() {
  const {
    methods,
    razorpaySettings,
    fetchMethods,
    fetchRazorpaySettings,
    updateRazorpaySettings,
    toggleMethod,
    updateMethod,
  } = usePaymentStore()

  const [upiId, setUpiId] = useState('')
  const [keyId, setKeyId] = useState('')
  const [keySecret, setKeySecret] = useState('')
  const [razorpayEnabled, setRazorpayEnabled] = useState(false)
  const [savingRazorpay, setSavingRazorpay] = useState(false)

  useEffect(() => {
    fetchMethods()
    fetchRazorpaySettings()
  }, [fetchMethods, fetchRazorpaySettings])

  const upiMethod = methods.find((m) => m.type === 'upi')

  useEffect(() => {
    if (upiMethod?.upiId) setUpiId(upiMethod.upiId)
  }, [upiMethod?.upiId])

  useEffect(() => {
    if (razorpaySettings) {
      setKeyId(razorpaySettings.razorpayKeyId || '')
      setRazorpayEnabled(razorpaySettings.razorpayEnabled)
    }
  }, [razorpaySettings])

  const handleUpiSave = () => {
    if (!upiMethod) return
    updateMethod(upiMethod.id, { upiId })
    toast.success('UPI ID updated')
  }

  const handleRazorpaySave = async () => {
    setSavingRazorpay(true)
    try {
      await updateRazorpaySettings({
        razorpayEnabled,
        razorpayKeyId: keyId.trim(),
        ...(keySecret.trim() ? { razorpayKeySecret: keySecret.trim() } : {}),
      })
      setKeySecret('')
      toast.success('Razorpay settings saved')
    } catch {
      toast.error('Failed to save Razorpay settings')
    } finally {
      setSavingRazorpay(false)
    }
  }

  const renderMethod = (method: PaymentMethod) => {
    const Icon = methodIcons[method.type]
    return (
      <Card key={method.id} className="border-border bg-card shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">{method.name}</CardTitle>
                <CardDescription>
                  {method.enabled ? 'Enabled at POS checkout' : 'Disabled at POS checkout'}
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={method.enabled}
              onCheckedChange={() => {
                toggleMethod(method.id)
                toast.success(`${method.name} ${method.enabled ? 'disabled' : 'enabled'}`)
              }}
            />
          </div>
        </CardHeader>
        {method.type === 'upi' && (
          <CardContent className="space-y-4 border-t border-border pt-4">
            <div className="space-y-2">
              <Label htmlFor="upiId">UPI ID (shown as QR at POS)</Label>
              <div className="flex gap-2">
                <Input
                  id="upiId"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  disabled={!method.enabled}
                />
                <Button onClick={handleUpiSave} disabled={!method.enabled}>
                  Save
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Cashiers see this UPI ID and QR when UPI is enabled at checkout.
              </p>
            </div>
          </CardContent>
        )}
        {method.type === 'razorpay' && (
          <CardContent className="border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">
              {razorpayEnabled
                ? 'Card, UPI, and wallets are processed via Razorpay Checkout in POS.'
                : 'Enable Razorpay below to activate online payments in POS.'}
            </p>
          </CardContent>
        )}
      </Card>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Payment Methods"
        description="Configure cash, Razorpay gateway, and other payment options for POS"
      />

      <Card className="border-primary/20 bg-card shadow-sm">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#072654] text-white">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg">Razorpay Payment Gateway</CardTitle>
                <CardDescription>
                  Accept Card, UPI, Netbanking &amp; Wallets in POS via Razorpay Checkout
                </CardDescription>
              </div>
            </div>
            <Badge variant={razorpayEnabled && keyId ? 'default' : 'secondary'}>
              {razorpayEnabled && keyId ? 'Active' : 'Not configured'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-4 py-3">
            <div>
              <Label htmlFor="razorpay-enabled">Enable Razorpay</Label>
              <p className="text-xs text-muted-foreground">Turn on online payments in POS terminal</p>
            </div>
            <Switch id="razorpay-enabled" checked={razorpayEnabled} onCheckedChange={setRazorpayEnabled} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="razorpay-key-id">Key ID</Label>
              <Input
                id="razorpay-key-id"
                value={keyId}
                onChange={(e) => setKeyId(e.target.value)}
                placeholder="rzp_test_xxxxxxxx"
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="razorpay-key-secret">Key Secret</Label>
              <Input
                id="razorpay-key-secret"
                type="password"
                value={keySecret}
                onChange={(e) => setKeySecret(e.target.value)}
                placeholder={razorpaySettings?.hasSecret ? '••••••••••••••••' : 'Enter key secret'}
                className="font-mono text-sm"
              />
              {razorpaySettings?.hasSecret && !keySecret && (
                <p className="text-xs text-muted-foreground">Secret is saved. Leave blank to keep current.</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handleRazorpaySave} disabled={savingRazorpay}>
              {savingRazorpay ? 'Saving...' : 'Save Razorpay Settings'}
            </Button>
            <a
              href="https://dashboard.razorpay.com/app/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Get API keys from Razorpay
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          POS Payment Methods (Cash, Card, UPI)
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Toggle each method on or off for the POS checkout. Disabled methods are hidden from cashiers.
        </p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {methods.filter((m) => m.type !== 'razorpay').map(renderMethod)}
        </div>
      </div>
    </div>
  )
}
