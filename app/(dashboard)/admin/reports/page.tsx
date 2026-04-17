'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Package, DollarSign, TrendingDown, BarChart2 } from 'lucide-react'
import { PageHeader }       from '@/components/shared/PageHeader'
import { StatCard }         from '@/components/shared/StatCard'
import { DataTable }        from '@/components/shared/DataTable'
import { LoadingSpinner }   from '@/components/shared/LoadingSpinner'
import { BookingsByStatus } from '@/components/charts/BookingsByStatus'
import { RevenueOverTime }  from '@/components/charts/RevenueOverTime'
import { TripsOverview }    from '@/components/charts/TripsOverview'
import { Button }           from '@/components/ui/button'
import { Input }            from '@/components/ui/input'
import { Label }            from '@/components/ui/label'
import { formatPrice, formatDate } from '@/lib/utils'

interface SummaryData {
  total_bookings:        number
  active_bookings:       number
  total_revenue:         number
  pending_revenue:       number
  cancellation_rate:     number
  bookings_by_status:    { status: string; count: number }[]
  revenue_by_month:      { month: string; revenue: number }[]
  bookings_by_transport: { transport_type: string; count: number }[]
  top_companies:         { company_name: string; bookings: number; total_spent: number }[]
}

interface CompanyRow { company_name: string; bookings: number; total_spent: number }

export default function AdminReportsPage() {
  const [data,     setData]     = useState<SummaryData | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo,   setDateTo]   = useState('')

  const fetchSummary = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (dateFrom) params.set('from_date', dateFrom)
      if (dateTo)   params.set('to_date',   dateTo)
      const res = await fetch(`/api/reports/summary?${params.toString()}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: string }).error ?? 'Failed to load reports')
      }
      setData(await res.json() as SummaryData)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load reports')
    } finally {
      setLoading(false)
    }
  }, [dateFrom, dateTo])

  useEffect(() => { fetchSummary() }, [fetchSummary])

  const topColumns = [
    { key: 'company_name', header: 'Company',        render: (r: CompanyRow) => <span className="font-medium">{r.company_name}</span> },
    { key: 'bookings',     header: 'Total Bookings', render: (r: CompanyRow) => r.bookings                                            },
    { key: 'total_spent',  header: 'Total Spent',    render: (r: CompanyRow) => formatPrice(r.total_spent)                            },
  ]

  const chartStatusData = (data?.bookings_by_status ?? []).map((s) => ({
    status: s.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    count:  s.count,
  }))
  const chartTransportData = (data?.bookings_by_transport ?? []).map((s) => ({
    label: s.transport_type.charAt(0).toUpperCase() + s.transport_type.slice(1),
    count: s.count,
  }))
  const chartRevenueData = (data?.revenue_by_month ?? []).map((r) => ({
    month:   r.month,
    revenue: r.revenue,
  }))

  return (
    <div className="space-y-8">
      <PageHeader title="Reports & Analytics" subtitle="Business overview and performance metrics" />

      {}
      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-[#E5E7EB] bg-white p-4">
        <div className="space-y-1.5">
          <Label>From Date</Label>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-40" />
        </div>
        <div className="space-y-1.5">
          <Label>To Date</Label>
          <Input type="date" value={dateTo}   onChange={(e) => setDateTo(e.target.value)}   className="w-40" />
        </div>
        <Button variant="outline" onClick={() => { setDateFrom(''); setDateTo('') }}>Clear</Button>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" className="py-20" />
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Bookings"    value={data.total_bookings}           icon={<Package      className="h-5 w-5 text-[#4A90D9]" />} />
            <StatCard label="Revenue (Paid)"    value={formatPrice(data.total_revenue)} icon={<DollarSign   className="h-5 w-5 text-[#22C55E]" />} />
            <StatCard label="Pending Revenue"   value={formatPrice(data.pending_revenue)} icon={<BarChart2  className="h-5 w-5 text-[#8B5CF6]" />} />
            <StatCard label="Cancellation Rate" value={`${data.cancellation_rate}%`}  icon={<TrendingDown className="h-5 w-5 text-[#EF4444]" />} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
              <p className="mb-4 text-sm font-semibold text-[#1B2E5E]">Revenue Over Time</p>
              <RevenueOverTime data={chartRevenueData} />
            </div>
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
              <p className="mb-4 text-sm font-semibold text-[#1B2E5E]">Bookings by Status</p>
              <BookingsByStatus data={chartStatusData} />
            </div>
          </div>

          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
            <p className="mb-4 text-sm font-semibold text-[#1B2E5E]">Bookings by Transport Type</p>
            <TripsOverview data={chartTransportData} />
          </div>

          <div>
            <p className="mb-4 text-base font-semibold text-[#1B2E5E]">Top Companies by Spend</p>
            <DataTable<CompanyRow>
              columns={topColumns}
              data={data.top_companies}
              emptyMessage="No company data available."
            />
          </div>
        </>
      ) : null}
    </div>
  )
}
