import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import type { Order } from '@/types'
import { formatCurrency, formatDateTime } from '@/utils'
import { APP_NAME } from '@/config/brand'

export interface ReportExportPayload {
  dateFrom: string
  dateTo: string
  metrics: {
    revenue: number
    totalOrders: number
    avgOrderValue: number
    productsSold: number
  }
  orders: Order[]
  topProducts: { name: string; quantity: number; revenue: number }[]
  topCategories: { name: string; quantity: number; revenue: number }[]
}

function reportFilename(ext: string) {
  const stamp = new Date().toISOString().slice(0, 10)
  return `cafeluxe-report-${stamp}.${ext}`
}

export function exportReportPdf(data: ReportExportPayload) {
  const doc = new jsPDF()
  const title = `${APP_NAME} Sales Report`

  doc.setFontSize(16)
  doc.text(title, 14, 18)
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Period: ${data.dateFrom} to ${data.dateTo}`, 14, 26)
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, 32)
  doc.setTextColor(0)

  autoTable(doc, {
    startY: 38,
    head: [['Metric', 'Value']],
    body: [
      ['Revenue', formatCurrency(data.metrics.revenue)],
      ['Total Orders', String(data.metrics.totalOrders)],
      ['Avg Order Value', formatCurrency(data.metrics.avgOrderValue)],
      ['Products Sold', String(data.metrics.productsSold)],
    ],
    theme: 'striped',
    headStyles: { fillColor: [218, 41, 28] },
  })

  const afterSummary = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 70

  autoTable(doc, {
    startY: afterSummary + 8,
    head: [['Order', 'Customer', 'Items', 'Total', 'Date']],
    body: data.orders.map((o) => [
      o.orderNumber,
      o.customerName ?? 'Walk-in',
      String(o.items.reduce((s, i) => s + i.quantity, 0)),
      formatCurrency(o.total),
      formatDateTime(o.createdAt),
    ]),
    theme: 'striped',
    headStyles: { fillColor: [218, 41, 28] },
    styles: { fontSize: 8 },
  })

  let y = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 120
  if (y > 250) {
    doc.addPage()
    y = 20
  }

  autoTable(doc, {
    startY: y + 8,
    head: [['Top Product', 'Qty', 'Revenue']],
    body: data.topProducts.map((p) => [p.name, String(p.quantity), formatCurrency(p.revenue)]),
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 8 },
  })

  y = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y + 40
  if (y > 250) {
    doc.addPage()
    y = 20
  }

  autoTable(doc, {
    startY: y + 8,
    head: [['Top Category', 'Qty', 'Revenue']],
    body: data.topCategories.map((c) => [c.name, String(c.quantity), formatCurrency(c.revenue)]),
    theme: 'grid',
    headStyles: { fillColor: [34, 197, 94] },
    styles: { fontSize: 8 },
  })

  doc.save(reportFilename('pdf'))
}

export function exportReportExcel(data: ReportExportPayload) {
  const wb = XLSX.utils.book_new()

  const summarySheet = XLSX.utils.aoa_to_sheet([
    [`${APP_NAME} Sales Report`],
    ['Period', `${data.dateFrom} to ${data.dateTo}`],
    ['Generated', new Date().toLocaleString('en-IN')],
    [],
    ['Metric', 'Value'],
    ['Revenue', data.metrics.revenue],
    ['Total Orders', data.metrics.totalOrders],
    ['Avg Order Value', data.metrics.avgOrderValue],
    ['Products Sold', data.metrics.productsSold],
  ])
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary')

  const ordersSheet = XLSX.utils.json_to_sheet(
    data.orders.map((o) => ({
      'Order #': o.orderNumber,
      Customer: o.customerName ?? 'Walk-in',
      Employee: o.employeeName,
      Items: o.items.reduce((s, i) => s + i.quantity, 0),
      Subtotal: o.subtotal,
      Tax: o.tax,
      Discount: o.discount,
      Total: o.total,
      'Payment Method': o.paymentMethod ?? '',
      Date: formatDateTime(o.createdAt),
    }))
  )
  XLSX.utils.book_append_sheet(wb, ordersSheet, 'Orders')

  const productsSheet = XLSX.utils.json_to_sheet(
    data.topProducts.map((p) => ({
      Product: p.name,
      Quantity: p.quantity,
      Revenue: p.revenue,
    }))
  )
  XLSX.utils.book_append_sheet(wb, productsSheet, 'Top Products')

  const categoriesSheet = XLSX.utils.json_to_sheet(
    data.topCategories.map((c) => ({
      Category: c.name,
      Quantity: c.quantity,
      Revenue: c.revenue,
    }))
  )
  XLSX.utils.book_append_sheet(wb, categoriesSheet, 'Top Categories')

  XLSX.writeFile(wb, reportFilename('xlsx'))
}
