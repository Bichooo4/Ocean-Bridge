// Client Component — reusable trips filter bar.
// Uses useTrips hook — replaces mock data.
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { DataTable }      from '@/components/shared/DataTable'
import { StatusBadge }    from '@/components/shared/StatusBadge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Input }          from '@/components/ui/input'
import { buttonVariants } from '@/components/ui/button'
import { formatDate }     from '@/lib/utils'
import { useTrips, type TripWithCount } from '@/hooks/useTrips'
import type { TripStatus, TransportType } from '@/types/database'

const TRANSPORT_OPTIONS: { value: TransportType | 'all'; label: string }[] = [
  { value: 'all',      label: 'All Types'   },
  { value: 'ship',     label: 'Ship'        },
  { value: 'truck',    label: 'Truck'       },
  { value: 'airplane', label: 'Airplane'    },
]

const STATUS_OPTIONS: { value: TripStatus | 'all'; label: string }[] = [
  { value: 'all',              label: 'All Statuses'     },
  { value: 'open',             label: 'Open'             },
  { value: 'full',             label: 'Full'             },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered',        label: 'Delivered'        },
]

export function TripsFilter() {
  const { trips, loading, error } = useTrips()

  const [search,    setSearch]    = useState('')
  const [status,    setStatus]    = useState<TripStatus | 'all'>('all')
  const [transport, setTransport] = useState<TransportType | 'all'>('all')

  if (error) toast.error(error)

  const filtered = trips.filter((t) => {
    const matchSearch    = search === '' || `${t.from_location} ${t.to_location}`.toLowerCase().includes(search.toLowerCase())
    const matchStatus    = status === 'all'    || t.status === status
    const matchTransport = transport === 'all' || t.transport_type === transport
    return matchSearch && matchStatus && matchTransport
  })

  const columns = [
    { key: 'route',          header: 'Route',       render: (t: TripWithCount) => <span className="font-medium">{t.from_location} → {t.to_location}</span> },
    { key: 'transport_type', header: 'Transport',   render: (t: TripWithCount) => <span className="capitalize">{t.transport_type}</span>                    },
    { key: 'departure_date', header: 'Departure',   render: (t: TripWithCount) => formatDate(t.departure_date)                                              },
    { key: 'arrival_date',   header: 'Arrival',     render: (t: TripWithCount) => formatDate(t.arrival_date)                                                },
    { key: 'capacity',       header: 'Booked / Max', render: (t: TripWithCount) => `${t.booking_count} / ${t.max_containers}`                              },
    { key: 'status',         header: 'Status',      render: (t: TripWithCount) => <StatusBadge status={t.status as TripStatus} type="trip" />              },
    {
      key: 'actions',
      header: '',
      render: (_t: TripWithCount) => (
        <Link href="/staff/bookings" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          View Bookings
        </Link>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search route…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-56"
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
        ? <LoadingSpinner size="lg" className="py-16" />
        : (
          <DataTable<TripWithCount>
            columns={columns}
            data={filtered}
            emptyMessage="No trips match your filters."
          />
        )
      }
    </div>
  )
}
