import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const auth = await requireAuth()
    if (!auth.ok) return auth.response
    const { user, role, supabase } = auth

    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('*')
      .eq('id', id)
      .single()

    if (tripError || !trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    let bookingsQuery: any = supabase
      .from('bookings')
      .select(`
        *,
        companies:company_id (company_name),
        containers (id, weight_kg, description)
      `)
      .eq('trip_id', id)

    if (role === 'company') {
      bookingsQuery = bookingsQuery.eq('company_id', user.id)
    }

    const { data: bookings, error: bookingsError } = await bookingsQuery

    if (bookingsError) throw bookingsError

    return NextResponse.json({ trip, bookings: bookings ?? [] })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
