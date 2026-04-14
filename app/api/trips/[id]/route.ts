// API Route — /api/trips/[id]
// GET: returns single trip with its bookings
// Booking visibility filtered by role

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = (user.app_metadata?.role ?? '') as string

    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('*')
      .eq('id', id)
      .single()

    if (tripError || !trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    // Build bookings query — company sees only their own
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
