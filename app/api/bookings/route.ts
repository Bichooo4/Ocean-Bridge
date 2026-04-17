import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireRole } from '@/lib/auth'
import { createBookingSchema } from '@/lib/validations/booking'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth()
    if (!auth.ok) return auth.response
    const { supabase } = auth

    const { searchParams } = req.nextUrl
    const statusParam  = searchParams.get('status')
    const tripParam    = searchParams.get('trip_id')
    const companyParam = searchParams.get('company_id')
    const fromParam    = searchParams.get('from_date')
    const toParam      = searchParams.get('to_date')
    const limit        = Math.min(Math.max(parseInt(searchParams.get('limit')  ?? '50', 10), 1), 200)
    const offset       = Math.max(parseInt(searchParams.get('offset') ?? '0',  10), 0)

    let query: any = supabase
      .from('bookings')
      .select(`
        *,
        companies:company_id (company_name, contact_name),
        trips:trip_id (from_location, to_location, transport_type, departure_date, arrival_date),
        containers (id, weight_kg, description)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (statusParam && statusParam !== 'all') query = query.eq('status', statusParam)
    if (tripParam    && tripParam !== 'all')   query = query.eq('trip_id', tripParam)
    if (companyParam && companyParam !== 'all') query = query.eq('company_id', companyParam)
    if (fromParam) query = query.gte('created_at', fromParam)
    if (toParam)   query = query.lte('created_at', toParam + 'T23:59:59Z')

    const { data, error, count } = await query
    if (error) throw error

    const bookings = ((data ?? []) as Record<string, unknown>[]).map((b) => {
      const companies  = b.companies  as Record<string, string>  | null
      const trips      = b.trips      as Record<string, string>  | null
      const containers = b.containers as unknown[]               | null
      return {
        ...b,
        company_name:     companies?.company_name     ?? '—',
        trip_route:       trips ? `${trips.from_location} → ${trips.to_location}` : '—',
        trip_transport:   trips?.transport_type       ?? '—',
        containers_count: containers?.length          ?? 0,
        companies:  undefined,
        trips:      undefined,
        containers: undefined,
      }
    })

    return NextResponse.json({ bookings, total: count ?? 0, limit, offset })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(['company'])
    if (!auth.ok) return auth.response
    const { user, supabase } = auth

    const body = await req.json()
    const parsed = createBookingSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Validation error' },
        { status: 400 },
      )
    }

    const { trip_id, notes, containers } = parsed.data

    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('base_price, per_kg_rate, status, max_containers')
      .eq('id', trip_id)
      .single()

    if (tripError || !trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 400 })
    }

    const t = trip as Record<string, unknown>

    if (!['open', 'full'].includes(t.status as string)) {
      return NextResponse.json({ error: 'Trip is not accepting bookings' }, { status: 400 })
    }

    const total_weight_kg = containers.reduce((s, c) => s + c.weight_kg, 0)
    const total_price     = (t.base_price as number) + total_weight_kg * (t.per_kg_rate as number)

    const { data: rpcData, error: rpcError } = await supabase.rpc('create_booking', {
      p_trip_id:         trip_id,
      p_company_id:      user.id,
      p_containers:      JSON.stringify(containers.map((c) => ({
        weight_kg:   c.weight_kg,
        description: c.description ?? null,
      }))),
      p_total_weight_kg: total_weight_kg,
      p_total_price:     total_price,
      p_notes:           notes ?? null,
    })

    if (rpcError) {

      const msg = rpcError.message ?? 'Failed to create booking'
      const status = msg.includes('capacity') || msg.includes('already have') ? 400 : 500
      return NextResponse.json({ error: msg }, { status })
    }

    const result = rpcData as { booking_id: string }
    return NextResponse.json({ booking: { id: result.booking_id } }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
