import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserPlus, User, Mail, Phone } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SearchInput } from '@/components/shared/SearchInput'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useCustomerStore } from '@/store'
import { usePosStore } from '@/store'
import type { Customer } from '@/types'
import { cn, formatCurrency } from '@/utils'

interface CustomerSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CustomerSelector({ open, onOpenChange }: CustomerSelectorProps) {
  const { customers, searchCustomers, addCustomer, fetchCustomers } = useCustomerStore()
  const { selectedCustomer, setCustomer } = usePosStore()
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<'search' | 'create'>('search')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    if (open) fetchCustomers()
  }, [open, fetchCustomers])

  const filtered = query ? searchCustomers(query) : customers

  const handleSelect = (customer: Customer) => {
    setCustomer(customer)
    onOpenChange(false)
    resetForm()
  }

  const handleClear = () => {
    setCustomer(null)
    onOpenChange(false)
    resetForm()
  }

  const handleCreate = async () => {
    if (!name.trim() || !phone.trim()) return
    try {
      const customer = await addCustomer({
        name: name.trim(),
        email: email.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '.')}@walkin.local`,
        phone: phone.trim(),
      })
      setCustomer(customer)
      onOpenChange(false)
      resetForm()
    } catch {
      /* ignore */
    }
  }

  const resetForm = () => {
    setQuery('')
    setMode('search')
    setName('')
    setEmail('')
    setPhone('')
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetForm() }}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Select Customer</DialogTitle>
          <DialogDescription>Search existing customers or create a new one</DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-2">
          <Button
            variant={mode === 'search' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('search')}
            className="flex-1"
          >
            Search
          </Button>
          <Button
            variant={mode === 'create' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('create')}
            className="flex-1"
          >
            <UserPlus className="h-4 w-4" />
            New Customer
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'search' ? (
            <motion.div
              key="search"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-3"
            >
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="Search by name, email, or phone..."
              />

              {selectedCustomer && (
                <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/10 px-3 py-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-primary" />
                    <span className="font-medium">{selectedCustomer.name}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleClear}>
                    Clear
                  </Button>
                </div>
              )}

              <ScrollArea className="h-64">
                <div className="space-y-1 pr-3">
                  {filtered.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">No customers found</p>
                  ) : (
                    filtered.map((customer) => (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => handleSelect(customer)}
                        className={cn(
                          'w-full rounded-lg border border-border bg-secondary/30 px-3 py-2.5 text-left transition-colors hover:border-primary/50 hover:bg-secondary/60',
                          selectedCustomer?.id === customer.id && 'border-primary bg-primary/10'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{customer.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {customer.totalOrders} orders
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {customer.email}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-primary">{formatCurrency(customer.totalSpent)} spent</p>
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </motion.div>
          ) : (
            <motion.div
              key="create"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="cust-name">Name *</Label>
                <Input
                  id="cust-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Customer name"
                  className="bg-secondary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cust-phone">Phone *</Label>
                <Input
                  id="cust-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="bg-secondary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cust-email">Email</Label>
                <Input
                  id="cust-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="bg-secondary/50"
                />
              </div>
              <Button
                className="w-full"
                onClick={handleCreate}
                disabled={!name.trim() || !phone.trim()}
              >
                <UserPlus className="h-4 w-4" />
                Create & Select
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
