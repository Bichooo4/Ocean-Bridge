'use client'

import Link from 'next/link'
import { toast } from 'sonner'
import { Ship, Truck, Plane } from 'lucide-react'
import { PageHeader }     from '@/components/shared/PageHeader'
import { DataTable }      from '@/components/shared/DataTable'
import { EmptyState }     from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { buttonVariants } from '@/components/ui/button'
import { formatDate, formatPrice } from '@/lib/utils'
import { useTrips, type TripWithCount } from '@/hooks/useTrips'
import type { TransportType } from '@/types/database'

const TRANSPORT_ICONS: Record<TransportType, React.ReactNode> = {
  ship:     <Ship  className="h-4 w-4 text-[#4A90D9]" />,
  truck:    <Truck className="h-4 w-4 text-[#4A90D9]" />,
  airplane: <Plane className="h-4 w-4 text-[#4A90D9]" />,
}

export default function CompanyTripsPage() {

  const { trips, loading, error } = useTrips()

  if (error) toast.error(error)

  const openTrips = trips.filter((t) => t.status === 'open' || t.status === 'full')

  const columns = [
    {
      key: 'route',
      header: 'Route',
      render: (t: TripWithCount) => (
        <div className="flex items-center gap-2">
          {TRANSPORT_ICONS[t.transport_type]}
          <div>
            <p className="font-semibold text-[#1B2E5E]">{t.from_location} → {t.to_location}</p>
            <p className="text-xs capitalize text-[#6B7280]">{t.transport_type}</p>
          </div>
        </div>
      ),
    },
    { key: 'departure_date', header: 'Departure', render: (t: TripWithCount) => formatDate(t.departure_date) },
    { key: 'arrival_date',   header: 'Arrival',   render: (t: TripWithCount) => formatDate(t.arrival_date)   },
    {
      key: 'availability',
      header: 'Available Slots',
      render: (t: TripWithCount) => {
        const available = t.max_containers - t.booking_count
        return (
          <span className={available <= 2 ? 'font-semibold text-[#F59E0B]' : 'text-[#1B2E5E]'}>
            {available} / {t.max_containers}
          </span>
        )
      },
    },
    {
      key: 'pricing',
      header: 'Pricing',
      render: (t: TripWithCount) => (
        <span className="text-sm text-[#6B7280]">
          {formatPrice(t.base_price)} + {formatPrice(t.per_kg_rate)}/kg
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (t: TripWithCount) => {
        const available = t.max_containers - t.booking_count
        if (available === 0) {
          return <span className="text-xs text-[#6B7280]">Full</span>
        }
        return (
          <Link
            href={`/company/bookings/new?trip_id=${t.id}`}
            className={buttonVariants({ size: 'sm' }) + ' bg-[#1B2E5E] text-white hover:bg-[#152449]'}
          >
            Book This Trip
          </Link>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Available Trips"
        subtitle="Browse open trips and book your shipment"
      />

      {loading ? (
        <LoadingSpinner size="lg" className="py-20" />
      ) : openTrips.length === 0 ? (
        <EmptyState
          title="No trips available"
          description="There are no open trips at the moment. Check back soon or contact us."
        />
      ) : (
        <DataTable<TripWithCount>
          columns={columns}
          data={openTrips}
          emptyMessage="No open trips found."
        />
      )}
    </div>
  )
}
