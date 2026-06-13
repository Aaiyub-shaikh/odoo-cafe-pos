import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { PageHeader } from '@/components/shared'

interface GeneralSettings {
  restaurantName: string
  address: string
  phone: string
  email: string
  currency: string
  taxRate: string
  serviceCharge: string
  autoPrintReceipt: boolean
  enableBookings: boolean
}

const defaultSettings: GeneralSettings = {
  restaurantName: 'RestMana',
  address: '123 Food Street, Mumbai, Maharashtra 400001',
  phone: '+91 98765 43210',
  email: 'info@restmana.com',
  currency: 'INR',
  taxRate: '5',
  serviceCharge: '10',
  autoPrintReceipt: true,
  enableBookings: true,
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<GeneralSettings>(defaultSettings)

  const update = <K extends keyof GeneralSettings>(key: K, value: GeneralSettings[K]) => {
    setSettings((s) => ({ ...s, [key]: value }))
  }

  const handleSave = () => {
    toast.success('Settings saved successfully')
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Settings" description="Configure general restaurant preferences">
        <Button onClick={handleSave}>Save Changes</Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Restaurant Info</CardTitle>
            <CardDescription>Basic details shown on receipts and invoices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="restaurantName">Restaurant Name</Label>
              <Input
                id="restaurantName"
                value={settings.restaurantName}
                onChange={(e) => update('restaurantName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={settings.address}
                onChange={(e) => update('address', e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={settings.phone} onChange={(e) => update('phone', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={settings.email} onChange={(e) => update('email', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Billing & Tax</CardTitle>
            <CardDescription>Default rates applied to orders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" value={settings.currency} onChange={(e) => update('currency', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input id="taxRate" type="number" value={settings.taxRate} onChange={(e) => update('taxRate', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serviceCharge">Service Charge (%)</Label>
                <Input id="serviceCharge" type="number" value={settings.serviceCharge} onChange={(e) => update('serviceCharge', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">POS Preferences</CardTitle>
            <CardDescription>Operational toggles for your point of sale</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="font-medium">Auto-print receipt</p>
                <p className="text-sm text-muted-foreground">Print receipt automatically after payment</p>
              </div>
              <Switch
                checked={settings.autoPrintReceipt}
                onCheckedChange={(v) => update('autoPrintReceipt', v)}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="font-medium">Enable bookings</p>
                <p className="text-sm text-muted-foreground">Allow customers to reserve tables online</p>
              </div>
              <Switch
                checked={settings.enableBookings}
                onCheckedChange={(v) => update('enableBookings', v)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
