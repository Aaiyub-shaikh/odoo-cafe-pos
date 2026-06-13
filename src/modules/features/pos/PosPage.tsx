import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Minus,
  Plus,
  Trash2,
  User,
  Tag,
  ChefHat,
  CreditCard,
  ShoppingCart,
  UtensilsCrossed,
  LayoutGrid,
  Receipt,
  Circle,
  Grid3x3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { SearchInput } from '@/components/shared/SearchInput'
import { EmptyState } from '@/components/shared/EmptyState'
import { Badge } from '@/components/ui/badge'
import { usePosStore, useProductStore, useCategoryStore, useOrderStore, useAuthStore, useSessionStore, useTableStore } from '@/store'
import type { OrderItem } from '@/types'
import { cn, formatCurrency } from '@/utils'
import { CustomerSelector } from './CustomerSelector'
import { CouponDialog } from './CouponDialog'
import { PaymentModal } from './PaymentModal'
import { FloorSelectDialog } from './FloorSelectDialog'
import { toast } from 'sonner'

const PAGE_SIZE = 12
type PosPanel = 'products' | 'cart' | 'summary'

export function PosPage() {
  const {
    cart,
    selectedCustomer,
    couponCode,
    searchQuery,
    selectedCategoryId,
    selectedTableId,
    addToCart,
    removeFromCart,
    updateQuantity,
    setSearchQuery,
    setSelectedCategory,
    getSubtotal,
    getTax,
    getDiscount,
    getTotal,
    clearCart,
  } = usePosStore()

  const { products, fetchProducts } = useProductStore()
  const { categories, fetchCategories } = useCategoryStore()
  const { createOrder } = useOrderStore()
  const { user } = useAuthStore()
  const { session } = useSessionStore()
  const floors = useTableStore((s) => s.floors)

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [activePanel, setActivePanel] = useState<PosPanel>('products')
  const [floorDialogOpen, setFloorDialogOpen] = useState(true)
  const [customerOpen, setCustomerOpen] = useState(false)
  const [couponOpen, setCouponOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const cartItemCount = cart.reduce((s, i) => s + i.quantity, 0)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [fetchProducts, fetchCategories])

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.active) return false
      if (selectedCategoryId && p.categoryId !== selectedCategoryId) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
      }
      return true
    })
  }, [products, selectedCategoryId, searchQuery])

  const visibleProducts = filteredProducts.slice(0, visibleCount)

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [selectedCategoryId, searchQuery])

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredProducts.length))
  }, [filteredProducts.length])

  useEffect(() => {
    const el = loadMoreRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && visibleCount < filteredProducts.length) {
          handleLoadMore()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [visibleCount, filteredProducts.length, handleLoadMore])

  const handleAddProduct = (product: (typeof products)[0]) => {
    addToCart({
      productId: product.id,
      productName: product.name,
      unitPrice: product.price,
      tax: product.tax,
      image: product.image,
    })
  }

  const handleSendToKitchen = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty')
      return
    }
    if (!user || !session) {
      toast.error('No active session')
      return
    }

    const orderItems: OrderItem[] = cart.map((item) => ({
      id: crypto.randomUUID(),
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.unitPrice * item.quantity,
      kitchenStatus: 'to_cook',
    }))

    const order = await createOrder({
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name ?? 'Walk-in',
      items: orderItems,
      subtotal: getSubtotal(),
      tax: getTax(),
      discount: getDiscount(),
      total: getTotal(),
      status: 'draft',
      couponCode: couponCode ?? undefined,
      employeeId: user.id,
      employeeName: user.name,
      sessionId: session.id,
    })

    clearCart()
    toast.success(`Order ${order.orderNumber} sent to kitchen`)
  }

  const selectedTable = floors.flatMap((f) => f.tables).find((t) => t.id === selectedTableId)

  const handlePay = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty')
      return
    }
    if (!session) {
      toast.error('No active session')
      return
    }
    setPaymentOpen(true)
  }

  const panelClass = (panel: PosPanel) =>
    cn(
      'flex flex-col min-h-0',
      activePanel !== panel && 'hidden lg:flex',
      panel === 'products' && 'flex-1 border-border lg:border-r',
      panel === 'cart' && 'w-full border-border lg:w-72 lg:border-r xl:w-80',
      panel === 'summary' && 'w-full lg:w-64 xl:w-72'
    )

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col bg-background sm:h-[calc(100dvh-3.5rem)]">
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Product Area */}
        <div className={panelClass('products')}>
          <div className="border-b border-border bg-card px-3 py-2 sm:px-4 sm:py-3">
            <div className="mb-2 flex items-center gap-2 sm:mb-3 sm:gap-3">
              <UtensilsCrossed className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
              <h1 className="text-base font-semibold sm:text-lg">Point of Sale</h1>
            </div>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search products..."
              className="mb-2 sm:mb-3"
            />
            <ScrollArea className="w-full">
              <div className="flex gap-2 pb-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className={cn(
                    'shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors sm:px-4 sm:py-1.5 sm:text-sm',
                    !selectedCategoryId
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  )}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      'shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors sm:px-4 sm:py-1.5 sm:text-sm',
                      selectedCategoryId === cat.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground hover:text-foreground'
                    )}
                    style={
                      selectedCategoryId === cat.id
                        ? undefined
                        : { borderLeft: `3px solid ${cat.color}` }
                    }
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          <ScrollArea className="flex-1">
            <div className="grid grid-cols-2 gap-2 p-3 sm:gap-3 sm:p-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {visibleProducts.map((product, i) => (
                <motion.button
                  key={product.id}
                  type="button"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (i % PAGE_SIZE) * 0.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleAddProduct(product)}
                  className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-left transition-colors hover:border-primary/50 hover:bg-secondary/40"
                >
                  <div className="relative aspect-square overflow-hidden bg-secondary/50">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <UtensilsCrossed className="h-8 w-8" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <Plus className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="p-2 sm:p-2.5">
                    <p className="truncate text-xs font-medium sm:text-sm">{product.name}</p>
                    <p className="text-xs font-bold text-primary sm:text-sm">{formatCurrency(product.price)}</p>
                  </div>
                </motion.button>
              ))}
            </div>
            {visibleCount < filteredProducts.length && (
              <div ref={loadMoreRef} className="flex justify-center py-6">
                <span className="text-sm text-muted-foreground">Loading more...</span>
              </div>
            )}
            {filteredProducts.length === 0 && (
              <EmptyState
                icon={<UtensilsCrossed className="h-12 w-12" />}
                title="No products found"
                description="Try a different category or search term"
              />
            )}
          </ScrollArea>
        </div>

        {/* Cart Area */}
        <div className={cn(panelClass('cart'), 'bg-card')}>
          <div className="flex items-center gap-2 border-b border-border px-3 py-2.5 sm:px-4 sm:py-3">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Order</h2>
            <span className="ml-auto rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
              {cartItemCount} items
            </span>
          </div>

          <ScrollArea className="flex-1">
            {cart.length === 0 ? (
              <EmptyState
                icon={<ShoppingCart className="h-10 w-10" />}
                title="Cart is empty"
                description="Tap a product to add it"
              />
            ) : (
              <div className="space-y-1 p-3">
                {cart.map((item) => (
                  <motion.div
                    key={item.productId}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-lg border border-border bg-secondary/30 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(item.unitPrice)} each
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId)}
                        className="shrink-0 rounded p-1 text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="text-sm font-bold text-primary">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Employee Panel: Session, Customer, Coupon, Order */}
        <div className={cn(panelClass('summary'), 'bg-card')}>
          {/* Session */}
          <div className="border-b border-border px-3 py-3 sm:px-4">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">POS Session</h2>
            {session ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="success" className="gap-1">
                    <Circle className="h-2 w-2 fill-emerald-400 text-emerald-400" />
                    Open
                  </Badge>
                  <span className="text-sm font-medium">{session.employeeName}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {session.orderCount} orders · {formatCurrency(session.totalSales)}
                </p>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setFloorDialogOpen(true)}>
                  <Grid3x3 className="h-3 w-3" />
                  {selectedTable ? `Table ${selectedTable.number}` : 'Walk-in · Change table'}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No active session</p>
            )}
          </div>

          {/* Customer */}
          <div className="border-b border-border px-3 py-3 sm:px-4">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer</h2>
            <Button variant="outline" className="w-full justify-start" onClick={() => setCustomerOpen(true)}>
              <User className="h-4 w-4" />
              <span className="truncate">{selectedCustomer ? selectedCustomer.name : 'Select or add customer'}</span>
            </Button>
          </div>

          {/* Coupon */}
          <div className="border-b border-border px-3 py-3 sm:px-4">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Coupon</h2>
            <Button variant="outline" className="w-full justify-start" onClick={() => setCouponOpen(true)}>
              <Tag className="h-4 w-4" />
              <span className="truncate">{couponCode ? couponCode : 'Apply coupon code'}</span>
            </Button>
          </div>

          {/* Order totals & actions */}
          <div className="flex flex-1 flex-col">
            <div className="px-3 py-3 sm:px-4">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(getSubtotal())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatCurrency(getTax())}</span>
                </div>
                {getDiscount() > 0 && (
                  <div className="flex justify-between text-sm text-success">
                    <span>Discount</span>
                    <span>-{formatCurrency(getDiscount())}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-primary sm:text-2xl">{formatCurrency(getTotal())}</span>
                </div>
              </div>
            </div>

            <div className="mt-auto space-y-2 border-t border-border p-3 safe-bottom sm:p-4">
              <Button
                variant="secondary"
                className="w-full"
                onClick={handleSendToKitchen}
                disabled={cart.length === 0}
              >
                <ChefHat className="h-4 w-4" />
                Send To Kitchen
              </Button>
              <Button className="w-full" size="lg" onClick={handlePay} disabled={cart.length === 0}>
                <CreditCard className="h-4 w-4" />
                Pay {formatCurrency(getTotal())}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="flex shrink-0 border-t border-border bg-card lg:hidden safe-bottom">
        {([
          { id: 'products' as const, label: 'Products', icon: LayoutGrid },
          { id: 'cart' as const, label: 'Cart', icon: ShoppingCart, badge: cartItemCount },
          { id: 'summary' as const, label: 'Pay', icon: Receipt },
        ]).map(({ id, label, icon: Icon, badge }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActivePanel(id)}
            className={cn(
              'relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors sm:py-3 sm:text-xs',
              activePanel === id ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
            {badge !== undefined && badge > 0 && (
              <span className="absolute right-1/4 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground sm:right-[30%]">
                {badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <FloorSelectDialog open={floorDialogOpen} onOpenChange={setFloorDialogOpen} />
      <CustomerSelector open={customerOpen} onOpenChange={setCustomerOpen} />
      <CouponDialog open={couponOpen} onOpenChange={setCouponOpen} />
      <PaymentModal open={paymentOpen} onOpenChange={setPaymentOpen} />
    </div>
  )
}
