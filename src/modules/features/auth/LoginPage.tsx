import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2, Lock, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore, useSessionStore } from '@/store'
import { ADMIN_DEMO_CREDENTIALS, CASHIER_DEMO_CREDENTIALS } from '@/mock/employees'
import { getDefaultRoute } from '@/utils/permissions'

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const openSession = useSessionStore((s) => s.openSession)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const success = await login(email, password, rememberMe)
    setLoading(false)

    if (!success) {
      setError('Invalid email or password. See demo credentials below.')
      return
    }

    const loggedInUser = useAuthStore.getState().user
    if (!loggedInUser) return

    if (loggedInUser.role === 'cashier') {
      openSession()
      navigate('/pos')
      return
    }

    navigate(getDefaultRoute(loggedInUser.role))
  }

  return (
    <Card className="border-border bg-card shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <CardDescription>Sign in as Admin or Employee</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="admin@restmana.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <Label htmlFor="remember" className="cursor-pointer text-sm font-normal text-muted-foreground">
                Remember me
              </Label>
            </div>
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
              Forgot password?
            </Link>
          </div>

          <div className="space-y-2 rounded-md bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">
            <p><strong className="text-foreground">Admin:</strong> {ADMIN_DEMO_CREDENTIALS.email} / {ADMIN_DEMO_CREDENTIALS.password}</p>
            <p><strong className="text-foreground">Employee:</strong> {CASHIER_DEMO_CREDENTIALS.email} / {CASHIER_DEMO_CREDENTIALS.password}</p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-medium text-primary hover:underline">
              Register as Admin
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
