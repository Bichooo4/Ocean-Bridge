'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { MoreHorizontal } from 'lucide-react'
import { PageHeader }     from '@/components/shared/PageHeader'
import { DataTable }      from '@/components/shared/DataTable'
import { StatusBadge }    from '@/components/shared/StatusBadge'
import { ConfirmDialog }  from '@/components/shared/ConfirmDialog'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Input }          from '@/components/ui/input'
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatPrice, formatDate } from '@/lib/utils'
import { Pagination }                              from '@/components/shared/Pagination'
import { useBookings, type BookingWithDetails }    from '@/hooks/useBookings'
import { useTrips }                                from '@/hooks/useTrips'
import type { BookingStatus } from '@/types/database'

const STATUS_OPTIONS: { value: BookingStatus | 'all'; label: string }[] = [
  { value: 'all',              label: 'All Statuses'    },
  { value: 'pending',          label: 'Pending'         },
  { value: 'approved',         label: 'Approved'        },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered',        label: 'Delivered'       },
  { value: 'cancelled',        label: 'Cancelled'       },
]

export default function AdminBookingsPage() {
  const [search,       setSearch]       = useState('')
  const [status,       setStatus]       = useState<BookingStatus | 'all'>('all')
  const [tripFilter,   setTrip]         = useState('all')
  const [dateFrom,     setDateFrom]     = useState('')
  const [dateTo,       setDateTo]       = useState('')
  const [cancelTarget, setCancelTarget] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const {
    bookings, total, page, pageSize, totalPages, loading, error, refetch, setPage,
  } = useBookings(
    status     !== 'all' ? status     : undefined,
    tripFilter !== 'all' ? tripFilter : undefined,
    dateFrom   || undefined,
    dateTo     || undefined,
  )
  const { trips } = useTrips()

  if (error) toast.error(error)

  const filtered = bookings.filter((b) =>
    search === '' ||
    b.company_name.toLowerCase().includes(search.toLowerCase()) ||
    b.id.includes(search),
  )

  async function approveBooking(id: string) {
    try {
      const res = await fetch(`/api/bookings/${id}/approve`, { method: 'PATCH' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: string }).error ?? 'Approval failed')
      }
      toast.success('Booking approved')
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Approval failed')
    }
  }

  async function cancelBooking() {
    if (!cancelTarget) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/bookings/${cancelTarget}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: string }).error ?? 'Cancellation failed')
      }
      toast.success('Booking cancelled')
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Cancellation failed')
    } finally {
      setActionLoading(false)
      setCancelTarget(null)
    }
  }

  const columns = [
    { key: 'id',               header: 'Booking ID',    render: (r: BookingWithDetails) => <span className="font-mono text-xs text-[#6B7280]">{r.id.slice(0, 8).toUpperCase()}</span> },
    { key: 'company_name',     header: 'Company',       render: (r: BookingWithDetails) => <span className="font-medium">{r.company_name}</span>                                         },
    { key: 'trip_route',       header: 'Route',         render: (r: BookingWithDetails) => r.trip_route                                                                                   },
    { key: 'containers_count', header: 'Ctrs / Kg',     render: (r: BookingWithDetails) => `${r.containers_count} / ${r.total_weight_kg.toLocaleString()} kg`                           },
    { key: 'total_price',      header: 'Total',         render: (r: BookingWithDetails) => formatPrice(r.total_price)                                                                     },
    { key: 'status',           header: 'Status',        render: (r: BookingWithDetails) => <StatusBadge status={r.status as BookingStatus} type="booking" />                             },
    { key: 'created_at',       header: 'Date',          render: (r: BookingWithDetails) => formatDate(r.created_at)                                                                       },
    {
      key: 'actions',
      header: '',
      render: (r: BookingWithDetails) => (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-gray-100">
            <MoreHorizontal className="h-4 w-4 text-[#6B7280]" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {r.status === 'pending' && (
              <DropdownMenuItem onClick={() => approveBooking(r.id)}>Approve</DropdownMenuItem>
            )}
            {(r.status === 'pending' || r.status === 'approved') && (
              <DropdownMenuItem
                onClick={() => setCancelTarget(r.id)}
                className="text-red-600 focus:text-red-600"
              >
                Cancel
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="All Bookings" subtitle={loading ? 'Loading…' : `${total} bookings total`} />

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search company or ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-56"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as BookingStatus | 'all')}
          className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1B2E5E] focus:outline-none focus:ring-2 focus:ring-[#4A90D9]/40"
        >
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          value={tripFilter}
          onChange={(e) => setTrip(e.target.value)}
          className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1B2E5E] focus:outline-none focus:ring-2 focus:ring-[#4A90D9]/40"
        >
          <option value="all">All Trips</option>
          {trips.map((t) => (
            <option key={t.id} value={t.id}>{t.from_location} → {t.to_location}</option>
          ))}
        </select>
        <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-38" />
        <Input type="date" value={dateTo}   onChange={(e) => setDateTo(e.target.value)}   className="w-38" />
      </div>

      {loading
        ? <LoadingSpinner size="lg" className="py-20" />
        : (
          <>
            <DataTable<BookingWithDetails>
              columns={columns}
              data={filtered}
              emptyMessage="No bookings match your filters."
            />
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </>
        )
      }

      <ConfirmDialog
        open={cancelTarget !== null}
        onOpenChange={(o) => { if (!o) setCancelTarget(null) }}
        title="Cancel Booking"
        description="This will cancel the booking and release the reserved containers."
        confirmLabel="Cancel Booking"
        variant="danger"
        onConfirm={cancelBooking}
        loading={actionLoading}
      />
    </div>
  )
}
