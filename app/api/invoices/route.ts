import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth()
    if (!auth.ok) return auth.response
    const { supabase } = auth

    const { searchParams } = req.nextUrl
    const statusParam   = searchParams.get('status')
    const fromParam     = searchParams.get('from_date')
    const toParam       = searchParams.get('to_date')
    const companyParam  = searchParams.get('company_id')
    const limit         = Math.min(Math.max(parseInt(searchParams.get('limit')  ?? '50', 10), 1), 200)
    const offset        = Math.max(parseInt(searchParams.get('offset') ?? '0',  10), 0)

    let query: any = supabase
      .from('invoices')
      .select(`
        *,
        companies:company_id (company_name)
      `, { count: 'exact' })
      .order('issued_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (statusParam && statusParam !== 'all') query = query.eq('status', statusParam)
    if (companyParam && companyParam !== 'all') query = query.eq('company_id', companyParam)
    if (fromParam) query = query.gte('issued_at', fromParam)
    if (toParam)   query = query.lte('issued_at', toParam + 'T23:59:59Z')

    const { data, error, count } = await query
    if (error) throw error

    const invoices = ((data ?? []) as Record<string, unknown>[]).map((i) => {
      const companies = i.companies as Record<string, string> | null
      return {
        ...i,
        company_name:  companies?.company_name ?? '—',
        booking_short: String(i.booking_id ?? '').replace('b-', 'BK-'),
        companies:     undefined,
      }
    })

    return NextResponse.json({ invoices, total: count ?? 0, limit, offset })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
