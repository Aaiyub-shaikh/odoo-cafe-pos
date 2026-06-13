import { useState } from 'react'
import { Calendar, Clock, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { DataTable, PageHeader } from '@/components/shared'
import { mockBookings } from '@/mock'
import type { Booking } from '@/types'
import { formatDate } from '@/utils'

const statusVariant = {
  confirmed: 'success',
  cancelled: 'destructive',
  completed: 'secondary',
} as const

export default function BookingsPage() {
  const [bookings] = useState<Booking[]>(mockBookings)

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Bookings" description="View and manage table reservations" />

      <DataTable
        data={bookings}
        columns={[
          {
            key: 'customer',
            header: 'Customer',
            cell: (b) => (
              <div>
                <p className="font-medium">{b.customerName}</p>
                <p className="text-xs text-muted-foreground">{b.customerPhone}</p>
              </div>
            ),
          },
          {
            key: 'table',
            header: 'Table',
            cell: (b) => `Table ${b.tableNumber}`,
          },
          {
            key: 'date',
            header: 'Date',
            cell: (b) => (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                {formatDate(b.date)}
              </div>
            ),
          },
          {
            key: 'time',
            header: 'Time',
            cell: (b) => (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                {b.time}
              </div>
            ),
          },
          {
            key: 'guests',
            header: 'Guests',
            cell: (b) => (
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                {b.guests}
              </div>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            cell: (b) => (
              <Badge variant={statusVariant[b.status]} className="capitalize">
                {b.status}
              </Badge>
            ),
          },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {(['confirmed', 'completed', 'cancelled'] as const).map((status) => {
          const count = bookings.filter((b) => b.status === status).length
          return (
            <Card key={status} className="border-border bg-card shadow-sm">
              <CardContent className="flex items-center justify-between p-4">
                <span className="text-sm capitalize text-muted-foreground">{status}</span>
                <Badge variant={statusVariant[status]}>{count}</Badge>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
