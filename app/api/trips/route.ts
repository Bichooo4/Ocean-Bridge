import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireRole } from '@/lib/auth'
import { createTripSchema } from '@/lib/validations/trip'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth()
    if (!auth.ok) return auth.response
    const { role, supabase } = auth
    const { searchParams } = req.nextUrl
    const statusParam    = searchParams.get('status')
    const transportParam = searchParams.get('transport_type')
    const fromParam      = searchParams.get('from')
    const toParam        = searchParams.get('to')
    const limit          = Math.min(Math.max(parseInt(searchParams.get('limit')  ?? '50', 10), 1), 200)
    const offset         = Math.max(parseInt(searchParams.get('offset') ?? '0',  10), 0)

    let query: any = supabase
      .from('trips')
      .select('*', { count: 'exact' })
      .order('departure_date', { ascending: true })
      .range(offset, offset + limit - 1)

    if (role === 'company') {
      query = query.in('status', ['open', 'full'])
    }

    if (statusParam && statusParam !== 'all') query = query.eq('status', statusParam)
    if (transportParam && transportParam !== 'all') query = query.eq('transport_type', transportParam)
    if (fromParam) query = query.ilike('from_location', `%${fromParam}%`)
    if (toParam)   query = query.ilike('to_location',   `%${toParam}%`)

    const [tripsRes, bookingsRes] = await Promise.all([
      query,
      supabase.from('bookings').select('trip_id').neq('status', 'cancelled'),
    ])

    if (tripsRes.error) throw tripsRes.error

    const countsByTrip = ((bookingsRes.data ?? []) as { trip_id: string }[]).reduce(
      (acc, b) => { acc[b.trip_id] = (acc[b.trip_id] ?? 0) + 1; return acc },
      {} as Record<string, number>,
    )

    const trips = ((tripsRes.data ?? []) as Record<string, unknown>[]).map((t) => ({
      ...t,
      booking_count: countsByTrip[t.id as string] ?? 0,
    }))

    return NextResponse.json({ trips, total: tripsRes.count ?? 0, limit, offset })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(['admin'])
    if (!auth.ok) return auth.response
    const { user, supabase } = auth

    const body = await req.json()
    const parsed = createTripSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Validation error' },
        { status: 400 },
      )
    }

    const { pricing_plan_id, departure_date, arrival_date, max_containers } = parsed.data

    const { data: plan, error: planError } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('id', pricing_plan_id)
      .single()

    if (planError || !plan) {
      return NextResponse.json({ error: 'Pricing plan not found' }, { status: 400 })
    }

    const p = plan as Record<string, unknown>
    if (!p.is_active) {
      return NextResponse.json({ error: 'Pricing plan is not active' }, { status: 400 })
    }

    const { data: trip, error: insertError } = await supabase
      .from('trips')
      .insert({
        pricing_plan_id,
        from_location:  p.from_location,
        to_location:    p.to_location,
        transport_type: p.transport_type,
        base_price:     p.base_price,
        per_kg_rate:    p.per_kg_rate,
        departure_date,
        arrival_date,
        max_containers,
        status:         'open',
        created_by:     user.id,
      })
      .select()
      .single()

    if (insertError) throw insertError

    return NextResponse.json({ trip }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
