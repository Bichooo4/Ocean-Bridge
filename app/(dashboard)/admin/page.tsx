'use client'

import Link from 'next/link'
import { Ship, Package, Building2, DollarSign, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader }     from '@/components/shared/PageHeader'
import { StatCard }       from '@/components/shared/StatCard'
import { DataTable }      from '@/components/shared/DataTable'
import { StatusBadge }    from '@/components/shared/StatusBadge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { buttonVariants } from '@/components/ui/button'
import { formatPrice, formatDate, cn } from '@/lib/utils'
import { useBookings, type BookingWithDetails } from '@/hooks/useBookings'
import { useTrips }    from '@/hooks/useTrips'
import { useInvoices } from '@/hooks/useInvoices'
import type { BookingStatus } from '@/types/database'

const columns = [
  { key: 'id',           header: 'Booking ID', render: (r: BookingWithDetails) => <span className="font-mono text-xs text-[#6B7280]">{r.id.toUpperCase()}</span>      },
  { key: 'company_name', header: 'Company',    render: (r: BookingWithDetails) => <span className="font-medium">{r.company_name}</span>                               },
  { key: 'trip_route',   header: 'Route',      render: (r: BookingWithDetails) => r.trip_route                                                                         },
  { key: 'total_price',  header: 'Amount',     render: (r: BookingWithDetails) => formatPrice(r.total_price)                                                           },
  { key: 'status',       header: 'Status',     render: (r: BookingWithDetails) => <StatusBadge status={r.status as BookingStatus} type="booking" />                   },
  { key: 'created_at',   header: 'Date',       render: (r: BookingWithDetails) => formatDate(r.created_at)                                                             },
]

export default function AdminDashboardPage() {
  const { bookings, loading: bLoading, error: bError } = useBookings()
  const { trips,    loading: tLoading, error: tError } = useTrips()
  const { invoices, loading: iLoading, error: iError } = useInvoices()

  if (bError) toast.error(bError)
  if (tError) toast.error(tError)
  if (iError) toast.error(iError)

  const loading = bLoading || tLoading || iLoading

  const totalRevenue  = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.total_price, 0)
  const activeTrips   = trips.filter((t) => t.status === 'open' || t.status === 'out_for_delivery').length
  const companySet    = new Set(bookings.map((b) => b.company_id))
  const recentBookings = [...bookings]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5)

  if (loading) return <LoadingSpinner size="lg" className="py-32" />

  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Overview of all activity on Ocean Bridge"
        action={
          <div className="flex gap-2">
            <Link href="/admin/pricing/new" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              <Plus className="mr-1 h-4 w-4" />Pricing Plan
            </Link>
            <Link href="/admin/trips/new" className={cn(buttonVariants({ size: 'sm' }), 'bg-[#1B2E5E] hover:bg-[#152449] text-white')}>
              <Plus className="mr-1 h-4 w-4" />New Trip
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Bookings"  value={bookings.length}      icon={<Package    className="h-5 w-5 text-[#4A90D9]" />} />
        <StatCard label="Revenue (Paid)"  value={formatPrice(totalRevenue)} icon={<DollarSign className="h-5 w-5 text-[#22C55E]" />} />
        <StatCard label="Active Trips"    value={activeTrips}           icon={<Ship       className="h-5 w-5 text-[#4A90D9]" />} />
        <StatCard label="Companies"       value={companySet.size}       icon={<Building2  className="h-5 w-5 text-[#8B5CF6]" />} />
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-[#1B2E5E]">Recent Bookings</h3>
          <Link href="/admin/bookings" className="text-sm font-medium text-[#4A90D9] hover:underline">
            View all →
          </Link>
        </div>
        <DataTable<BookingWithDetails> columns={columns} data={recentBookings} />
      </div>
    </div>
  )
}
