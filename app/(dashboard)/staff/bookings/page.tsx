// Client Component — staff bookings management with live data.
// Uses useBookings hook; approve/cancel call API routes.
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { PageHeader }     from '@/components/shared/PageHeader'
import { DataTable }      from '@/components/shared/DataTable'
import { StatusBadge }    from '@/components/shared/StatusBadge'
import { ConfirmDialog }  from '@/components/shared/ConfirmDialog'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Input }          from '@/components/ui/input'
import { formatDate, formatPrice } from '@/lib/utils'
import { useBookings, type BookingWithDetails } from '@/hooks/useBookings'
import type { BookingStatus } from '@/types/database'

type DialogMode = 'approve' | 'cancel' | null

const STATUS_OPTIONS: { value: BookingStatus | 'all'; label: string }[] = [
  { value: 'all',              label: 'All Statuses'     },
  { value: 'pending',          label: 'Pending'          },
  { value: 'approved',         label: 'Approved'         },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered',        label: 'Delivered'        },
  { value: 'cancelled',        label: 'Cancelled'        },
]

export default function StaffBookingsPage() {
  const router = useRouter()
  const { bookings, loading, error, refetch } = useBookings()

  const [search,        setSearch]   = useState('')
  const [status,        setStatus]   = useState<BookingStatus | 'all'>('all')
  const [dateFrom,      setDateFrom] = useState('')
  const [dateTo,        setDateTo]   = useState('')
  const [dialogTarget,  setTarget]   = useState<string | null>(null)
  const [dialogMode,    setMode]     = useState<DialogMode>(null)
  const [actionLoading, setActionLoading] = useState(false)

  if (error) toast.error(error)

  const filtered = bookings.filter((b) => {
    const matchSearch = search === '' || b.company_name.toLowerCase().includes(search.toLowerCase()) || b.id.includes(search)
    const matchStatus = status === 'all' || b.status === status
    const matchFrom   = !dateFrom || b.created_at >= dateFrom
    const matchTo     = !dateTo   || b.created_at <= dateTo + 'T23:59:59Z'
    return matchSearch && matchStatus && matchFrom && matchTo
  })

  function openDialog(id: string, mode: 'approve' | 'cancel') {
    setTarget(id); setMode(mode)
  }

  async function handleConfirm() {
    if (!dialogTarget || !dialogMode) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/bookings/${dialogTarget}/${dialogMode}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: string }).error ?? 'Action failed')
      }
      toast.success(dialogMode === 'approve' ? 'Booking approved' : 'Booking cancelled')
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setActionLoading(false)
      setTarget(null); setMode(null)
    }
  }

  const targetBooking = bookings.find((b) => b.id === dialogTarget)

  const columns = [
    {
      key: 'id',
      header: 'Booking',
      render: (r: BookingWithDetails) => (
        <span className="font-mono text-xs font-semibold text-[#1B2E5E]">{r.id.toUpperCase()}</span>
      ),
    },
    { key: 'company_name', header: 'Company', render: (r: BookingWithDetails) => <span className="font-medium">{r.company_name}</span> },
    {
      key: 'trip_route',
      header: 'Route',
      render: (r: BookingWithDetails) => (
        <div>
          <p className="font-medium">{r.trip_route}</p>
          <p className="text-xs capitalize text-[#6B7280]">{r.trip_transport}</p>
        </div>
      ),
    },
    { key: 'containers_count', header: 'Containers', render: (r: BookingWithDetails) => <span className="text-[#6B7280]">{r.containers_count}</span> },
    { key: 'total_price',      header: 'Amount',     render: (r: BookingWithDetails) => <span className="font-semibold">{formatPrice(r.total_price)}</span> },
    { key: 'status',           header: 'Status',     render: (r: BookingWithDetails) => <StatusBadge status={r.status as BookingStatus} type="booking" /> },
    { key: 'created_at',       header: 'Created',    render: (r: BookingWithDetails) => formatDate(r.created_at) },
    {
      key: 'actions',
      header: 'Actions',
      render: (r: BookingWithDetails) => (
        <div className="flex gap-2">
          {r.status === 'pending' && (
            <button onClick={() => openDialog(r.id, 'approve')} className="text-xs font-medium text-[#22C55E] hover:underline">Approve</button>
          )}
          {(r.status === 'pending' || r.status === 'approved') && (
            <button onClick={() => openDialog(r.id, 'cancel')} className="text-xs font-medium text-red-500 hover:underline">Cancel</button>
          )}
          <button onClick={() => router.push(`/staff/bookings/${r.id}`)} className="text-xs font-medium text-[#6B7280] hover:underline">View</button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="All Bookings" subtitle={loading ? 'Loading…' : `${bookings.length} bookings total`} />

      <div className="flex flex-wrap gap-3">
        <Input placeholder="Search company or ID…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-56" />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as BookingStatus | 'all')}
          className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1B2E5E] focus:outline-none focus:ring-2 focus:ring-[#4A90D9]/40"
        >
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-38" />
        <Input type="date" value={dateTo}   onChange={(e) => setDateTo(e.target.value)}   className="w-38" />
      </div>

      {loading
        ? <LoadingSpinner size="lg" className="py-20" />
        : <DataTable<BookingWithDetails> columns={columns} data={filtered} emptyMessage="No bookings match your filters." />
      }

      <ConfirmDialog
        open={dialogTarget !== null}
        onOpenChange={(o) => { if (!o) { setTarget(null); setMode(null) } }}
        title={dialogMode === 'approve' ? 'Approve Booking' : 'Cancel Booking'}
        description={
          dialogMode === 'approve'
            ? `Approve booking ${targetBooking?.id.toUpperCase() ?? ''}? An invoice will be generated.`
            : `Cancel booking ${targetBooking?.id.toUpperCase() ?? ''}? This will release trip capacity.`
        }
        confirmLabel={dialogMode === 'approve' ? 'Approve' : 'Cancel Booking'}
        variant={dialogMode === 'cancel' ? 'danger' : 'default'}
        onConfirm={handleConfirm}
        loading={actionLoading}
      />
    </div>
  )
}
