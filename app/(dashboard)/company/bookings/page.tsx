'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { PageHeader }     from '@/components/shared/PageHeader'
import { DataTable }      from '@/components/shared/DataTable'
import { StatusBadge }    from '@/components/shared/StatusBadge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Input }          from '@/components/ui/input'
import { buttonVariants } from '@/components/ui/button'
import { formatDate, formatPrice } from '@/lib/utils'
import { useBookings, type BookingWithDetails } from '@/hooks/useBookings'
import type { BookingStatus } from '@/types/database'

const STATUS_OPTIONS: { value: BookingStatus | 'all'; label: string }[] = [
  { value: 'all',              label: 'All Statuses'     },
  { value: 'pending',          label: 'Pending'          },
  { value: 'approved',         label: 'Approved'         },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered',        label: 'Delivered'        },
  { value: 'cancelled',        label: 'Cancelled'        },
]

export default function CompanyBookingsPage() {
  const { bookings, loading, error } = useBookings()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<BookingStatus | 'all'>('all')

  if (error) toast.error(error)

  const filtered = bookings.filter((b) => {
    const matchSearch = search === '' || b.trip_route.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase())
    const matchStatus = status === 'all' || b.status === status
    return matchSearch && matchStatus
  })

  const columns = [
    {
      key: 'id',
      header: 'Booking',
      render: (b: BookingWithDetails) => (
        <span className="font-mono text-xs font-semibold text-[#1B2E5E]">{b.id.toUpperCase()}</span>
      ),
    },
    {
      key: 'trip_route',
      header: 'Route',
      render: (b: BookingWithDetails) => (
        <div>
          <p className="font-medium">{b.trip_route}</p>
          <p className="text-xs capitalize text-[#6B7280]">{b.trip_transport}</p>
        </div>
      ),
    },
    {
      key: 'containers_count',
      header: 'Containers',
      render: (b: BookingWithDetails) => <span className="text-[#6B7280]">{b.containers_count}</span>,
    },
    {
      key: 'total_price',
      header: 'Amount',
      render: (b: BookingWithDetails) => <span className="font-semibold">{formatPrice(b.total_price)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (b: BookingWithDetails) => <StatusBadge status={b.status as BookingStatus} type="booking" />,
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (b: BookingWithDetails) => formatDate(b.created_at),
    },
    {
      key: 'actions',
      header: '',
      render: (b: BookingWithDetails) => (
        <Link href={`/company/bookings/${b.id}`} className="text-xs font-medium text-[#4A90D9] hover:underline">
          View
        </Link>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Bookings"
        subtitle={loading ? 'Loading…' : `${bookings.length} bookings total`}
        action={
          <Link
            href="/company/bookings/new"
            className={buttonVariants({ size: 'sm' }) + ' bg-[#1B2E5E] text-white hover:bg-[#152449]'}
          >
            + New Booking
          </Link>
        }
      />

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search by route or ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as BookingStatus | 'all')}
          className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1B2E5E] focus:outline-none focus:ring-2 focus:ring-[#4A90D9]/40"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {loading
        ? <LoadingSpinner size="lg" className="py-20" />
        : <DataTable<BookingWithDetails> columns={columns} data={filtered} emptyMessage="No bookings match your filters." />
      }
    </div>
  )
}
