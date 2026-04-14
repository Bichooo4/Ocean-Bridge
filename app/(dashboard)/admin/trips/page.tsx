// Client Component — admin trips management with live data.
// Uses useTrips hook — replaces mock data.
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { PageHeader }     from '@/components/shared/PageHeader'
import { DataTable }      from '@/components/shared/DataTable'
import { StatusBadge }    from '@/components/shared/StatusBadge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { buttonVariants } from '@/components/ui/button'
import { Input }          from '@/components/ui/input'
import { formatDate, formatPrice, cn } from '@/lib/utils'
import { Pagination }                    from '@/components/shared/Pagination'
import { useTrips, type TripWithCount } from '@/hooks/useTrips'
import type { TripStatus, TransportType } from '@/types/database'

const TRANSPORT_OPTIONS: { value: TransportType | 'all'; label: string }[] = [
  { value: 'all',      label: 'All Types'  },
  { value: 'ship',     label: 'Ship'       },
  { value: 'truck',    label: 'Truck'      },
  { value: 'airplane', label: 'Airplane'   },
]

const STATUS_OPTIONS: { value: TripStatus | 'all'; label: string }[] = [
  { value: 'all',              label: 'All Statuses'    },
  { value: 'open',             label: 'Open'            },
  { value: 'full',             label: 'Full'            },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered',        label: 'Delivered'       },
]

const columns = [
  { key: 'route',          header: 'Route',      render: (r: TripWithCount) => <span className="font-medium">{r.from_location} → {r.to_location}</span> },
  { key: 'transport_type', header: 'Transport',  render: (r: TripWithCount) => <span className="capitalize">{r.transport_type}</span>                    },
  { key: 'departure_date', header: 'Departure',  render: (r: TripWithCount) => formatDate(r.departure_date)                                              },
  { key: 'arrival_date',   header: 'Arrival',    render: (r: TripWithCount) => formatDate(r.arrival_date)                                                },
  { key: 'base_price',     header: 'Base Price', render: (r: TripWithCount) => formatPrice(r.base_price)                                                 },
  { key: 'booked',         header: 'Booked/Max', render: (r: TripWithCount) => `${r.booking_count} / ${r.max_containers}`                               },
  { key: 'status',         header: 'Status',     render: (r: TripWithCount) => <StatusBadge status={r.status as TripStatus} type="trip" />              },
]

export default function AdminTripsPage() {
  const [search,    setSearch]    = useState('')
  const [transport, setTransport] = useState<TransportType | 'all'>('all')
  const [status,    setStatus]    = useState<TripStatus | 'all'>('all')

  // Pass status and transport to the hook so the server filters and paginates.
  // Text search remains client-side (cheap, no round-trip needed).
  const {
    trips, total, page, pageSize, totalPages, loading, error, setPage,
  } = useTrips(
    status    !== 'all' ? status    : undefined,
    transport !== 'all' ? transport : undefined,
  )

  if (error) toast.error(error)

  const filtered = trips.filter((t) =>
    search === '' || `${t.from_location} ${t.to_location}`.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trips"
        subtitle={loading ? 'Loading…' : `${total} trips total`}
        action={
          <Link href="/admin/trips/new" className={cn(buttonVariants(), 'bg-[#1B2E5E] text-white hover:bg-[#152449]')}>
            <Plus className="mr-2 h-4 w-4" />New Trip
          </Link>
        }
      />

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search route…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-60"
        />
        <select
          value={transport}
          onChange={(e) => setTransport(e.target.value as TransportType | 'all')}
          className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1B2E5E] focus:outline-none focus:ring-2 focus:ring-[#4A90D9]/40"
        >
          {TRANSPORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as TripStatus | 'all')}
          className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1B2E5E] focus:outline-none focus:ring-2 focus:ring-[#4A90D9]/40"
        >
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {loading
        ? <LoadingSpinner size="lg" className="py-20" />
        : (
          <>
            <DataTable<TripWithCount> columns={columns} data={filtered} emptyMessage="No trips match your filters." />
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
    </div>
  )
}
