// Client Component — company dashboard home with live data.
// Uses useBookings + useInvoices hooks scoped to the logged-in company via RLS.
'use client'

import Link from 'next/link'
import { toast } from 'sonner'
import { Package, Clock, DollarSign, Truck } from 'lucide-react'
import { PageHeader }     from '@/components/shared/PageHeader'
import { StatCard }       from '@/components/shared/StatCard'
import { DataTable }      from '@/components/shared/DataTable'
import { StatusBadge }    from '@/components/shared/StatusBadge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState }     from '@/components/shared/EmptyState'
import { buttonVariants } from '@/components/ui/button'
import { formatDate, formatPrice } from '@/lib/utils'
import { useBookings, type BookingWithDetails } from '@/hooks/useBookings'
import { useInvoices } from '@/hooks/useInvoices'
import type { BookingStatus } from '@/types/database'

const columns = [
  {
    key: 'id',
    header: 'Booking',
    render: (b: BookingWithDetails) => (
      <Link href={`/company/bookings/${b.id}`} className="font-mono text-xs font-semibold text-[#4A90D9] hover:underline">
        {b.id.toUpperCase()}
      </Link>
    ),
  },
  {
    key: 'trip_route',
    header: 'Route',
    render: (b: BookingWithDetails) => <span className="font-medium">{b.trip_route}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (b: BookingWithDetails) => <StatusBadge status={b.status as BookingStatus} type="booking" />,
  },
  {
    key: 'total_price',
    header: 'Amount',
    render: (b: BookingWithDetails) => <span className="font-semibold">{formatPrice(b.total_price)}</span>,
  },
  {
    key: 'created_at',
    header: 'Created',
    render: (b: BookingWithDetails) => formatDate(b.created_at),
  },
]

export default function CompanyDashboardPage() {
  const { bookings, loading: bLoading, error: bError } = useBookings()
  const { invoices, loading: iLoading, error: iError } = useInvoices()

  if (bError) toast.error(bError)
  if (iError) toast.error(iError)

  const loading = bLoading || iLoading

  const activeCount    = bookings.filter((b) => b.status !== 'cancelled' && b.status !== 'delivered').length
  const unpaidTotal    = invoices.filter((i) => i.status === 'unpaid').reduce((s, i) => s + i.total_price, 0)
  const deliveredCount = bookings.filter((b) => b.status === 'delivered').length
  const inTransit      = bookings.filter((b) => b.status === 'out_for_delivery')
  const recentBookings = [...bookings]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5)

  if (loading) return <LoadingSpinner size="lg" className="py-32" />

  // Welcome empty state for new companies with no bookings
  if (!loading && bookings.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="My Dashboard"
          subtitle="Welcome to Ocean Bridge"
        />
        <EmptyState
          title="Welcome to Ocean Bridge!"
          description="You have no bookings yet. Start by browsing available trips and booking your first shipment."
          action={
            <Link
              href="/company/trips"
              className={buttonVariants({ size: 'sm' }) + ' bg-[#1B2E5E] text-white hover:bg-[#152449]'}
            >
              Browse Trips
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Dashboard"
        subtitle="Overview of your shipments and invoices"
        action={
          <Link
            href="/company/bookings/new"
            className={buttonVariants({ size: 'sm' }) + ' bg-[#1B2E5E] text-white hover:bg-[#152449]'}
          >
            + New Booking
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active Bookings"      value={activeCount}           icon={<Package    className="h-5 w-5 text-[#4A90D9]" />} />
        <StatCard label="Outstanding Balance"  value={formatPrice(unpaidTotal)} icon={<DollarSign className="h-5 w-5 text-[#F59E0B]" />} />
        <StatCard label="Delivered"            value={deliveredCount}        icon={<Truck      className="h-5 w-5 text-[#22C55E]" />} />
      </div>

      {inTransit.length > 0 && (
        <div className="rounded-xl border border-[#4A90D9]/30 bg-[#EFF6FF] p-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#4A90D9]">
            In Transit ({inTransit.length})
          </p>
          <div className="space-y-2">
            {inTransit.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-[#4A90D9]" />
                  <div>
                    <p className="text-sm font-semibold text-[#1B2E5E]">{b.trip_route}</p>
                    <p className="text-xs text-[#6B7280]">
                      {b.containers_count} container{b.containers_count !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <Link href={`/company/bookings/${b.id}`} className="text-xs font-medium text-[#4A90D9] hover:underline">
                  View details
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-[#1B2E5E]">Recent Bookings</p>
          <Link href="/company/bookings" className="text-xs font-medium text-[#4A90D9] hover:underline">
            View all
          </Link>
        </div>
        <DataTable<BookingWithDetails>
          columns={columns}
          data={recentBookings}
          emptyMessage="You have no bookings yet."
        />
      </div>
    </div>
  )
}
