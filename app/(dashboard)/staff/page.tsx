// Client Component — staff dashboard home with live data.
// Uses useBookings + useTrips hooks.
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Package, Ship, Clock, CheckCircle } from 'lucide-react'
import { createClient }  from '@/lib/supabase/client'
import { PageHeader }    from '@/components/shared/PageHeader'
import { StatCard }      from '@/components/shared/StatCard'
import { DataTable }     from '@/components/shared/DataTable'
import { StatusBadge }   from '@/components/shared/StatusBadge'
import { EmptyState }    from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { StaffPendingApprovals } from '@/components/shared/StaffPendingApprovals'
import { formatDate } from '@/lib/utils'
import { useBookings, type BookingWithDetails } from '@/hooks/useBookings'
import { useTrips, type TripWithCount }         from '@/hooks/useTrips'
import type { BookingStatus, TripStatus } from '@/types/database'

interface HistoryEntry {
  id:         string
  booking_id: string
  status:     string
  created_at: string
  updated_by: string | null
}

function timeAgo(dateStr: string): string {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3_600_000)
  if (hours < 1)  return 'just now'
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const TODAY = new Date().toISOString().slice(0, 10)

const tripColumns = [
  { key: 'route',          header: 'Route',     render: (t: TripWithCount) => <span className="font-medium">{t.from_location} → {t.to_location}</span> },
  { key: 'transport_type', header: 'Transport', render: (t: TripWithCount) => <span className="capitalize">{t.transport_type}</span>                    },
  { key: 'departure_date', header: 'Departure', render: (t: TripWithCount) => formatDate(t.departure_date)                                              },
  { key: 'arrival_date',   header: 'Arrival',   render: (t: TripWithCount) => formatDate(t.arrival_date)                                                },
  { key: 'status',         header: 'Status',    render: (t: TripWithCount) => <StatusBadge status={t.status as TripStatus} type="trip" />              },
]

export default function StaffDashboardPage() {
  const { bookings, loading: bLoading, error: bError, refetch } = useBookings()
  const { trips,    loading: tLoading, error: tError }           = useTrips()
  const [history,   setHistory]   = useState<HistoryEntry[]>([])
  const [hLoading,  setHLoading]  = useState(true)

  if (bError) toast.error(bError)
  if (tError) toast.error(tError)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('booking_status_history')
      .select('id, booking_id, status, created_at, updated_by')
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => {
        setHistory((data ?? []) as HistoryEntry[])
        setHLoading(false)
      })
  }, [])

  const pendingBookings = bookings.filter((b) => b.status === 'pending').slice(0, 5)
  const activeBookings  = bookings.filter((b) => b.status === 'pending' || b.status === 'approved').length
  const pendingCount    = bookings.filter((b) => b.status === 'pending').length
  const todayTrips      = trips.filter((t) => t.departure_date === TODAY || t.arrival_date === TODAY).length
  const departingToday  = trips.filter((t) => t.departure_date === TODAY).length
  const activeTrips     = trips.filter((t) => t.status === 'open' || t.status === 'full')

  const loading = bLoading || tLoading

  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" subtitle="Staff operations overview" />

      {loading ? (
        <LoadingSpinner size="lg" className="py-20" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Active Bookings"
              value={activeBookings}
              icon={<Package className="h-5 w-5 text-[#F59E0B]" />}
              trend={`${pendingCount} need approval`}
              trendUp={false}
            />
            <StatCard
              label="Trips Today"
              value={todayTrips}
              icon={<Ship className="h-5 w-5 text-[#4A90D9]" />}
              trend={`${departingToday} departing`}
              trendUp
            />
            <StatCard
              label="Pending Approvals"
              value={pendingCount}
              icon={<Clock className="h-5 w-5 text-[#F59E0B]" />}
              trend="Action required"
              trendUp={false}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* Pending approvals */}
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#1B2E5E]">Pending Approvals</h3>
                <Link href="/staff/bookings" className="text-xs font-medium text-[#4A90D9] hover:underline">
                  View all bookings →
                </Link>
              </div>
              {pendingBookings.length === 0 ? (
                <EmptyState
                  icon={<CheckCircle className="h-8 w-8" />}
                  title="All caught up"
                  description="No bookings waiting for approval"
                />
              ) : (
                <StaffPendingApprovals bookings={pendingBookings} refetch={refetch} />
              )}
            </div>

            {/* Activity feed */}
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold text-[#1B2E5E]">Activity Feed</h3>
              {hLoading ? (
                <LoadingSpinner size="md" className="py-8" />
              ) : (
                <ul className="space-y-3">
                  {history.map((entry) => (
                    <li key={entry.id} className="flex items-start gap-3 text-sm">
                      <StatusBadge status={entry.status as BookingStatus} type="booking" />
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-xs text-[#6B7280]">{entry.booking_id.toUpperCase()}</p>
                        <p className="text-xs text-[#6B7280]">{timeAgo(entry.created_at)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Active trips */}
          <div>
            <h3 className="mb-4 text-base font-semibold text-[#1B2E5E]">Active Trips</h3>
            <DataTable<TripWithCount>
              columns={tripColumns}
              data={activeTrips}
              emptyMessage="No active trips at the moment."
            />
          </div>
        </>
      )}
    </div>
  )
}
