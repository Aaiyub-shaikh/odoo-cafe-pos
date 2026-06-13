import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageHeader } from '@/components/shared'
import { useAuthStore } from '@/store'

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore()
  const [form, setForm] = useState({ name: '', email: '' })

  useEffect(() => {
    if (user) {
      setForm({ name: user.name, email: user.email })
    }
  }, [user])

  if (!user) {
    return (
      <div className="p-6">
        <PageHeader title="Profile" description="Sign in to view your profile" />
      </div>
    )
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and email are required')
      return
    }
    updateProfile({ name: form.name, email: form.email })
    toast.success('Profile updated')
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Profile" description="Manage your account information">
        <Button onClick={handleSave}>Save Changes</Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="flex flex-col items-center gap-4 p-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary/20 text-primary text-xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Badge className="mt-2 capitalize">{user.role}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Edit Profile</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input value={user.role} disabled className="capitalize opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
