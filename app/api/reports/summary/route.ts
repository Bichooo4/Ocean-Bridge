import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(['admin', 'staff'])
    if (!auth.ok) return auth.response
    const { supabase } = auth

    const { searchParams } = req.nextUrl
    const fromDate = searchParams.get('from_date')
    const toDate   = searchParams.get('to_date')

    const [bookingsRes, invoicesRes] = await Promise.all([
      (() => {

        let q: any = supabase
          .from('bookings')
          .select('id, status, total_price, company_id, created_at, trips:trip_id (transport_type), companies:company_id (company_name)')
        if (fromDate) q = q.gte('created_at', fromDate)
        if (toDate)   q = q.lte('created_at', toDate + 'T23:59:59Z')
        return q
      })(),

      (() => {

        let q: any = supabase.from('invoices').select('id, status, total_price, company_id, issued_at')
        if (fromDate) q = q.gte('issued_at', fromDate)
        if (toDate)   q = q.lte('issued_at', toDate + 'T23:59:59Z')
        return q
      })(),
    ])

    if (bookingsRes.error) throw bookingsRes.error
    if (invoicesRes.error) throw invoicesRes.error

    const bookings = (bookingsRes.data ?? []) as Record<string, unknown>[]
    const invoices = (invoicesRes.data ?? []) as Record<string, unknown>[]

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

    const statusCounts: Record<string, number> = {}
    for (const b of bookings) {
      const s = b.status as string
      statusCounts[s] = (statusCounts[s] ?? 0) + 1
    }
    const bookings_by_status = Object.entries(statusCounts).map(([status, count]) => ({
      status, count,
    }))

    const monthMap: Record<string, number> = {}
    for (const inv of paid_invoices) {
      const month = String(inv.issued_at ?? '').slice(0, 7) 
      monthMap[month] = (monthMap[month] ?? 0) + (inv.total_price as number)
    }
    const revenue_by_month = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, revenue]) => ({ month, revenue }))

    const transportMap: Record<string, number> = {}
    for (const b of bookings) {
      const trip = b.trips as Record<string, unknown> | null
      const tt = (trip?.transport_type ?? 'unknown') as string
      transportMap[tt] = (transportMap[tt] ?? 0) + 1
    }
    const bookings_by_transport = Object.entries(transportMap).map(
      ([transport_type, count]) => ({ transport_type, count }),
    )

    const companyNames: Record<string, string> = {}
    const companyBookingCount: Record<string, number> = {}
    for (const b of bookings) {
      const cid = b.company_id as string
      const co = b.companies as Record<string, string> | null
      if (co?.company_name) companyNames[cid] = co.company_name
      companyBookingCount[cid] = (companyBookingCount[cid] ?? 0) + 1
    }
    const companySpend: Record<string, number> = {}
    for (const inv of invoices) {
      if (inv.status !== 'paid') continue
      const cid = inv.company_id as string
      companySpend[cid] = (companySpend[cid] ?? 0) + (inv.total_price as number)
    }
    const top_companies = Object.keys(companyBookingCount)
      .map((cid) => ({
        company_name: companyNames[cid] ?? 'Unknown',
        bookings:     companyBookingCount[cid],
        total_spent:  companySpend[cid] ?? 0,
      }))
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
