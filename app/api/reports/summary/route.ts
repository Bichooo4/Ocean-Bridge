// API Route — /api/reports/summary
// GET: returns aggregated analytics for admin/staff
// Uses multiple parallel Supabase queries for performance

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = (user.app_metadata?.role ?? '') as string
    if (!['admin', 'staff'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden — admin/staff only' }, { status: 403 })
    }

    const { searchParams } = req.nextUrl
    const fromDate = searchParams.get('from_date')
    const toDate   = searchParams.get('to_date')

    // Parallel queries
    const [bookingsRes, invoicesRes, companiesRes, tripsRes] = await Promise.all([
      // Bookings with company and trip info
      (() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let q: any = supabase
          .from('bookings')
          .select('id, status, total_price, company_id, trip_id, created_at, trips:trip_id (transport_type)')
        if (fromDate) q = q.gte('created_at', fromDate)
        if (toDate)   q = q.lte('created_at', toDate + 'T23:59:59Z')
        return q
      })(),

      // All invoices
      (() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let q: any = supabase.from('invoices').select('id, status, total_price, company_id, issued_at')
        if (fromDate) q = q.gte('issued_at', fromDate)
        if (toDate)   q = q.lte('issued_at', toDate + 'T23:59:59Z')
        return q
      })(),

      // Companies with booking + invoice data
      supabase.from('companies').select('id, company_name'),

      // Trips for transport breakdown
      supabase.from('trips').select('id, transport_type'),
    ])

    if (bookingsRes.error) throw bookingsRes.error
    if (invoicesRes.error) throw invoicesRes.error

    const bookings  = (bookingsRes.data ?? [])  as Record<string, unknown>[]
    const invoices  = (invoicesRes.data ?? [])  as Record<string, unknown>[]
    const companies = (companiesRes.data ?? []) as Record<string, unknown>[]
    const trips     = (tripsRes.data ?? [])     as Record<string, unknown>[]

    // --- Aggregations ---

    const total_bookings  = bookings.length
    const active_bookings = bookings.filter(
      (b) => !['cancelled', 'delivered'].includes(b.status as string),
    ).length

    const paid_invoices    = invoices.filter((i) => i.status === 'paid')
    const unpaid_invoices  = invoices.filter((i) => i.status === 'unpaid')
    const total_revenue    = paid_invoices.reduce((s, i) => s + (i.total_price as number), 0)
    const pending_revenue  = unpaid_invoices.reduce((s, i) => s + (i.total_price as number), 0)

    const cancelled_count   = bookings.filter((b) => b.status === 'cancelled').length
    const cancellation_rate = total_bookings > 0
      ? Math.round((cancelled_count / total_bookings) * 1000) / 10
      : 0

    // Bookings by status
    const statusCounts: Record<string, number> = {}
    for (const b of bookings) {
      const s = b.status as string
      statusCounts[s] = (statusCounts[s] ?? 0) + 1
    }
    const bookings_by_status = Object.entries(statusCounts).map(([status, count]) => ({
      status, count,
    }))

    // Revenue by month (from paid invoices)
    const monthMap: Record<string, number> = {}
    for (const inv of paid_invoices) {
      const month = String(inv.issued_at ?? '').slice(0, 7) // 'YYYY-MM'
      monthMap[month] = (monthMap[month] ?? 0) + (inv.total_price as number)
    }
    const revenue_by_month = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, revenue]) => ({ month, revenue }))

    // Bookings by transport type
    const transportMap: Record<string, number> = {}
    for (const b of bookings) {
      const trip = b.trips as Record<string, unknown> | null
      const tt = (trip?.transport_type ?? 'unknown') as string
      transportMap[tt] = (transportMap[tt] ?? 0) + 1
    }
    const bookings_by_transport = Object.entries(transportMap).map(
      ([transport_type, count]) => ({ transport_type, count }),
    )

    // Top companies by spend
    const top_companies = companies
      .map((c) => {
        const compBookings = bookings.filter((b) => b.company_id === c.id)
        const compInvoices = invoices.filter(
          (i) => i.company_id === c.id && i.status === 'paid',
        )
        return {
          company_name: c.company_name as string,
          bookings:    compBookings.length,
          total_spent: compInvoices.reduce((s, i) => s + (i.total_price as number), 0),
        }
      })
      .sort((a, b) => b.total_spent - a.total_spent)
      .slice(0, 10)

    return NextResponse.json({
      total_bookings,
      active_bookings,
      total_revenue,
      pending_revenue,
      cancellation_rate,
      bookings_by_status,
      revenue_by_month,
      bookings_by_transport,
      top_companies,
    })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
