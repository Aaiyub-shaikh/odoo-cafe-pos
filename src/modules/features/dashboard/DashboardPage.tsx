import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  UtensilsCrossed,
  Users,
  Package,
} from 'lucide-react'
import { StatCard, PageHeader, DataTable, DateFilterTabs } from '@/components/shared'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { reportsApi } from '@/services/api'
import { useCustomerStore, useOrderStore, useTableStore } from '@/store'
import { cn, formatCurrency, formatDateTime, ORDER_STATUS_COLORS } from '@/utils'
import { CHART_TOOLTIP_STYLE, CHART_GRID_STROKE, CHART_AXIS_STROKE } from '@/utils/chartTheme'
import type { DateFilter, Order, Customer } from '@/types'

interface DashboardStats {
  revenue: number
  totalOrders: number
  avgOrderValue: number
  productsSold: number
}

interface SalesDataPoint {
  date: string
  sales: number
  revenue: number
  orders: number
}

interface TopProduct {
  id: string
  name: string
  quantity: number
  revenue: number
}

interface TopCategory {
  id: string
  name: string
  color: string
  quantity: number
  revenue: number
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

export default function DashboardPage() {
  const [dateFilter, setDateFilter] = useState<DateFilter>('week')
  const [customFrom, setCustomFrom] = useState('2025-06-01')
  const [customTo, setCustomTo] = useState('2025-06-13')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [salesData, setSalesData] = useState<SalesDataPoint[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [topCategories, setTopCategories] = useState<TopCategory[]>([])

  const { orders, fetchOrders } = useOrderStore()
  const { customers, fetchCustomers } = useCustomerStore()
  const { floors, fetchFloors } = useTableStore()

  useEffect(() => {
    async function loadReports() {
      try {
        const [dashboard, trend, products, categories] = await Promise.all([
          reportsApi.dashboard(),
          reportsApi.salesTrend(),
          reportsApi.topProducts(),
          reportsApi.topCategories(),
        ])
        setStats(dashboard as unknown as DashboardStats)
        setSalesData(trend as unknown as SalesDataPoint[])
        setTopProducts(products as unknown as TopProduct[])
        setTopCategories(categories as unknown as TopCategory[])
      } catch {
        /* ignore */
      }
    }
    loadReports()
    fetchOrders()
    fetchCustomers()
    fetchFloors()
  }, [fetchOrders, fetchCustomers, fetchFloors])

  const displayStats = useMemo(() => {
    const activeTables = floors
      .flatMap((f) => f.tables)
      .filter((t) => t.status === 'occupied' || t.status === 'reserved').length

    return {
      revenue: stats?.revenue ?? 0,
      totalOrders: stats?.totalOrders ?? 0,
      avgOrderValue: stats?.avgOrderValue ?? 0,
      activeTables,
      customers: customers.length,
      productsSold: stats?.productsSold ?? 0,
    }
  }, [stats, floors, customers])

  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    [orders]
  )

  const recentCustomers = useMemo(
    () => [...customers].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    [customers]
  )

  const orderColumns = [
    {
      key: 'orderNumber',
      header: 'Order',
      cell: (order: Order) => <span className="font-medium text-primary">{order.orderNumber}</span>,
    },
    {
      key: 'customer',
      header: 'Customer',
      cell: (order: Order) => order.customerName ?? 'Walk-in',
    },
    {
      key: 'total',
      header: 'Total',
      cell: (order: Order) => formatCurrency(order.total),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (order: Order) => (
        <Badge className={cn('capitalize', ORDER_STATUS_COLORS[order.status])}>{order.status}</Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      cell: (order: Order) => <span className="text-muted-foreground">{formatDateTime(order.createdAt)}</span>,
    },
  ]

  const customerColumns = [
    {
      key: 'name',
      header: 'Name',
      cell: (customer: Customer) => <span className="font-medium">{customer.name}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      cell: (customer: Customer) => <span className="text-muted-foreground">{customer.email}</span>,
    },
    {
      key: 'totalOrders',
      header: 'Orders',
      cell: (customer: Customer) => customer.totalOrders,
    },
    {
      key: 'totalSpent',
      header: 'Total Spent',
      cell: (customer: Customer) => formatCurrency(customer.totalSpent),
    },
    {
      key: 'createdAt',
      header: 'Joined',
      cell: (customer: Customer) => <span className="text-muted-foreground">{formatDateTime(customer.createdAt)}</span>,
    },
  ]

  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Dashboard" description="Overview of your restaurant performance">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {dateFilter === 'custom' && (
              <div className="flex items-center gap-2">
                <div className="space-y-1">
                  <Label htmlFor="date-from" className="text-xs text-muted-foreground">
                    From
                  </Label>
                  <Input
                    id="date-from"
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="h-8 w-36 bg-secondary/50 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="date-to" className="text-xs text-muted-foreground">
                    To
                  </Label>
                  <Input
                    id="date-to"
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="h-8 w-36 bg-secondary/50 text-xs"
                  />
                </div>
              </div>
            )}
            <DateFilterTabs value={dateFilter} onChange={setDateFilter} />
          </div>
        </PageHeader>
      </motion.div>

      <motion.div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6" variants={itemVariants}>
        <StatCard title="Revenue" value={displayStats.revenue} icon={DollarSign} isCurrency trend={{ value: 12.5, label: 'vs last period' }} />
        <StatCard title="Total Orders" value={displayStats.totalOrders} icon={ShoppingCart} trend={{ value: 8.2, label: 'vs last period' }} />
        <StatCard title="Avg Order Value" value={displayStats.avgOrderValue} icon={TrendingUp} isCurrency />
        <StatCard title="Active Tables" value={displayStats.activeTables} icon={UtensilsCrossed} />
        <StatCard title="Customers" value={displayStats.customers} icon={Users} />
        <StatCard title="Products Sold" value={displayStats.productsSold} icon={Package} trend={{ value: 5.4, label: 'vs last period' }} />
      </motion.div>

      <motion.div className="grid gap-4 lg:grid-cols-2" variants={itemVariants}>
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] sm:h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                <XAxis dataKey="date" stroke={CHART_AXIS_STROKE} fontSize={12} tickLine={false} />
                <YAxis stroke={CHART_AXIS_STROKE} fontSize={12} tickLine={false} />
                <Tooltip {...CHART_TOOLTIP_STYLE} />
                <Line type="monotone" dataKey="sales" stroke="#da291c" strokeWidth={2} dot={{ fill: '#da291c', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] sm:h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#da291c" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#da291c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                <XAxis dataKey="date" stroke={CHART_AXIS_STROKE} fontSize={12} tickLine={false} />
                <YAxis stroke={CHART_AXIS_STROKE} fontSize={12} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(value: number) => [formatCurrency(value), 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#da291c" fill="url(#revenueGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div className="grid gap-4 lg:grid-cols-2" variants={itemVariants}>
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] sm:h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} horizontal={false} />
                <XAxis type="number" stroke={CHART_AXIS_STROKE} fontSize={12} tickLine={false} />
                <YAxis type="category" dataKey="name" stroke={CHART_AXIS_STROKE} fontSize={11} tickLine={false} width={100} />
                <Tooltip {...CHART_TOOLTIP_STYLE} />
                <Bar dataKey="quantity" fill="#da291c" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Top Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] sm:h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topCategories}
                  dataKey="revenue"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {topCategories.map((cat) => (
                    <Cell key={cat.id} fill={cat.color} stroke="#ffffff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(value: number) => [formatCurrency(value), 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              {topCategories.map((cat) => (
                <div key={cat.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  {cat.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div className="grid gap-4 lg:grid-cols-2" variants={itemVariants}>
        <div className="space-y-3">
          <h2 className="text-sm font-medium">Recent Orders</h2>
          <DataTable columns={orderColumns} data={recentOrders} />
        </div>
        <div className="space-y-3">
          <h2 className="text-sm font-medium">Recent Customers</h2>
          <DataTable columns={customerColumns} data={recentCustomers} />
        </div>
      </motion.div>
    </motion.div>
  )
}
