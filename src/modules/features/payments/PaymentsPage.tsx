import { useEffect, useState } from 'react'
import { Banknote, CreditCard, Smartphone } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { PageHeader } from '@/components/shared'
import { usePaymentStore } from '@/store'
import type { PaymentMethod } from '@/types'

const methodIcons = {
  cash: Banknote,
  card: CreditCard,
  upi: Smartphone,
} as const

export default function PaymentsPage() {
  const { methods, fetchMethods, toggleMethod, updateMethod } = usePaymentStore()
  const [upiId, setUpiId] = useState('')

  useEffect(() => {
    fetchMethods()
  }, [fetchMethods])

  const upiMethod = methods.find((m) => m.type === 'upi')

  useEffect(() => {
    if (upiMethod?.upiId) setUpiId(upiMethod.upiId)
  }, [upiMethod?.upiId])

  const handleUpiSave = () => {
    if (!upiMethod) return
    updateMethod(upiMethod.id, { upiId })
    toast.success('UPI ID updated')
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
                  {method.enabled ? 'Enabled at checkout' : 'Disabled at checkout'}
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
        {method.type === 'upi' && method.enabled && (
          <CardContent className="space-y-4 border-t border-border pt-4">
            <div className="space-y-2">
              <Label htmlFor="upiId">UPI ID</Label>
              <div className="flex gap-2">
                <Input
                  id="upiId"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                />
                <Button onClick={handleUpiSave}>Save</Button>
              </div>
            </div>
            {upiId && (
              <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-background p-6">
                <p className="text-sm text-muted-foreground">Scan to pay via UPI</p>
                <div className="rounded-lg bg-white p-3">
                  <QRCodeSVG value={`upi://pay?pa=${upiId}&pn=RestMana`} size={160} />
                </div>
                <p className="text-sm font-medium">{upiId}</p>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Payment Methods"
        description="Configure accepted payment methods for your POS"
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {methods.map(renderMethod)}
      </div>
    </div>
  )
}
