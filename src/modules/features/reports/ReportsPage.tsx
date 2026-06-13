import { useEffect, useMemo, useState } from 'react'
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  IndianRupee,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTable, DateFilterTabs, PageHeader, StatCard } from '@/components/shared'
import { reportsApi } from '@/services/api'
import { useEmployeeStore, useOrderStore, useProductStore, useReportStore } from '@/store'
import { formatCurrency, formatDateTime } from '@/utils'
import { CHART_TOOLTIP_STYLE, CHART_GRID_STROKE, CHART_AXIS_STROKE, CHART_COLORS } from '@/utils/chartTheme'

const CHART_PALETTE = [CHART_COLORS.primary, CHART_COLORS.blue, CHART_COLORS.green, CHART_COLORS.purple, CHART_COLORS.gold]

interface SalesDataPoint {
  date: string
  sales: number
  revenue: number
  orders: number
}

interface TopProductRow {
  id: string
  name: string
  quantity: number
  revenue: number
}

interface TopCategoryRow {
  id: string
  name: string
  color?: string
  quantity: number
  revenue: number
}

export default function ReportsPage() {
  const { dateFilter, filters, setDateFilter, setFilters } = useReportStore()
  const { employees, fetchEmployees } = useEmployeeStore()
  const { products, fetchProducts } = useProductStore()
  const { orders, fetchOrders } = useOrderStore()
  const [salesData, setSalesData] = useState<SalesDataPoint[]>([])
  const [topProducts, setTopProducts] = useState<TopProductRow[]>([])
  const [topCategories, setTopCategories] = useState<TopCategoryRow[]>([])

  useEffect(() => {
    fetchEmployees()
    fetchProducts()
    fetchOrders()
    Promise.all([reportsApi.salesTrend(), reportsApi.topProducts(), reportsApi.topCategories()])
      .then(([trend, productsData, categoriesData]) => {
        setSalesData(trend as unknown as SalesDataPoint[])
        setTopProducts(productsData as unknown as TopProductRow[])
        setTopCategories(categoriesData as unknown as TopCategoryRow[])
      })
      .catch(() => {})
  }, [fetchEmployees, fetchProducts, fetchOrders])

  const sessions = useMemo(
    () => [...new Set(orders.map((o) => o.sessionId))].map((id) => ({ id, label: id })),
    [orders]
  )

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const date = o.createdAt.split('T')[0]
      if (filters.dateFrom && date < filters.dateFrom) return false
      if (filters.dateTo && date > filters.dateTo) return false
      if (filters.employeeId && o.employeeId !== filters.employeeId) return false
      if (filters.sessionId && o.sessionId !== filters.sessionId) return false
      if (filters.productId && !o.items.some((i) => i.productId === filters.productId)) return false
      return o.status === 'paid'
    })
  }, [orders, filters])

  const metrics = useMemo(() => {
    const revenue = filteredOrders.reduce((sum, o) => sum + o.total, 0)
    const totalOrders = filteredOrders.length
    const avgOrderValue = totalOrders ? revenue / totalOrders : 0
    const customers = new Set(filteredOrders.map((o) => o.customerId).filter(Boolean)).size
    const productsSold = filteredOrders.reduce(
      (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
      0
    )
    return { revenue, totalOrders, avgOrderValue, customers, productsSold }
  }, [filteredOrders])

  const topOrders = useMemo(
    () => [...filteredOrders].sort((a, b) => b.total - a.total).slice(0, 5),
    [filteredOrders]
  )

  const exportPdf = () => toast.success('Report exported as PDF (mock)')
  const exportExcel = () => toast.success('Report exported as Excel (mock)')

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Sales analytics and performance insights">
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <Button variant="outline" onClick={exportPdf} className="w-full sm:w-auto">
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
        <Button variant="outline" onClick={exportExcel} className="w-full sm:w-auto">
          <FileSpreadsheet className="h-4 w-4" />
          Export Excel
        </Button>
        </div>
      </PageHeader>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DateFilterTabs value={dateFilter} onChange={setDateFilter} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label>Date From</Label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ dateFrom: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Date To</Label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ dateTo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Employee</Label>
              <Select
                value={filters.employeeId ?? 'all'}
                onValueChange={(v) => setFilters({ employeeId: v === 'all' ? undefined : v })}
              >
                <SelectTrigger><SelectValue placeholder="All employees" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All employees</SelectItem>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Product</Label>
              <Select
                value={filters.productId ?? 'all'}
                onValueChange={(v) => setFilters({ productId: v === 'all' ? undefined : v })}
              >
                <SelectTrigger><SelectValue placeholder="All products" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All products</SelectItem>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Session</Label>
              <Select
                value={filters.sessionId ?? 'all'}
                onValueChange={(v) => setFilters({ sessionId: v === 'all' ? undefined : v })}
              >
                <SelectTrigger><SelectValue placeholder="All sessions" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sessions</SelectItem>
                  {sessions.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Revenue" value={metrics.revenue} icon={IndianRupee} isCurrency trend={{ value: 12, label: 'vs last period' }} />
        <StatCard title="Total Orders" value={metrics.totalOrders} icon={ShoppingCart} trend={{ value: 8, label: 'vs last period' }} />
        <StatCard title="Avg Order Value" value={metrics.avgOrderValue} icon={TrendingUp} isCurrency />
        <StatCard title="Products Sold" value={metrics.productsSold} icon={BarChart3} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Sales & Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                <XAxis dataKey="date" stroke={CHART_AXIS_STROKE} fontSize={12} />
                <YAxis stroke={CHART_AXIS_STROKE} fontSize={12} />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE.contentStyle}
                  labelStyle={CHART_TOOLTIP_STYLE.labelStyle}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke={CHART_COLORS.primary} strokeWidth={2} dot={{ fill: CHART_COLORS.primary }} />
                <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topCategories}
                  dataKey="revenue"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {topCategories.map((_, i) => (
                    <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={CHART_TOOLTIP_STYLE.contentStyle}
                />
              </PieChart>
            </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Daily Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] sm:h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
              <XAxis dataKey="date" stroke={CHART_AXIS_STROKE} fontSize={12} />
              <YAxis stroke={CHART_AXIS_STROKE} fontSize={12} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE.contentStyle} />
              <Bar dataKey="orders" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Top Products</h3>
          <DataTable
            data={topProducts}
            columns={[
              { key: 'name', header: 'Product', cell: (p) => p.name },
              { key: 'qty', header: 'Qty', cell: (p) => p.quantity },
              { key: 'rev', header: 'Revenue', cell: (p) => formatCurrency(p.revenue) },
            ]}
          />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Top Categories</h3>
          <DataTable
            data={topCategories}
            columns={[
              { key: 'name', header: 'Category', cell: (c) => c.name },
              { key: 'qty', header: 'Qty', cell: (c) => c.quantity },
              { key: 'rev', header: 'Revenue', cell: (c) => formatCurrency(c.revenue) },
            ]}
          />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Top Orders</h3>
          <DataTable
            data={topOrders}
            emptyMessage="No orders in selected range"
            columns={[
              { key: 'num', header: 'Order', cell: (o) => o.orderNumber },
              { key: 'customer', header: 'Customer', cell: (o) => o.customerName ?? 'Walk-in' },
              { key: 'total', header: 'Total', cell: (o) => formatCurrency(o.total) },
              { key: 'date', header: 'Date', cell: (o) => formatDateTime(o.createdAt) },
            ]}
          />
        </div>
      </div>
    </div>
  )
}
