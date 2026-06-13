import { useEffect, useState } from 'react'
import { Calendar, Clock, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { DataTable, PageHeader } from '@/components/shared'
import { bookingsApi } from '@/services/api'
import type { Booking } from '@/types'
import { formatDate } from '@/utils'

const statusVariant = {
  confirmed: 'success',
  cancelled: 'destructive',
  completed: 'secondary',
} as const

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    bookingsApi.getAll()
      .then((data) => setBookings(data as unknown as Booking[]))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader title="Bookings" description="View and manage table reservations" />

      <DataTable
        isLoading={isLoading}
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
            cell: (b) => formatDate(b.date),
          },
          {
            key: 'time',
            header: 'Time',
            cell: (b) => (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {b.time}
              </span>
            ),
          },
          {
            key: 'guests',
            header: 'Guests',
            cell: (b) => (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {b.guests}
              </span>
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
        {(['confirmed', 'cancelled', 'completed'] as const).map((status) => (
          <Card key={status} className="border-border bg-card shadow-sm">
            <CardContent className="flex items-center gap-3 p-4">
              <Calendar className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{bookings.filter((b) => b.status === status).length}</p>
                <p className="text-xs capitalize text-muted-foreground">{status}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
