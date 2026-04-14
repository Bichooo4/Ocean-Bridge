// API Route — /api/bookings/[id]
// GET: single booking detail with all related data
// PATCH: company edits booking — always resets to pending

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateBookingSchema } from '@/lib/validations/booking'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        *,
        companies:company_id (company_name, contact_name, phone),
        trips:trip_id (*),
        containers (*),
        booking_status_history (*)
      `)
      .eq('id', id)
      .single()

    if (error || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Fetch invoice separately
    const { data: invoice } = await supabase
      .from('invoices')
      .select('*')
      .eq('booking_id', id)
      .maybeSingle()

    const b = booking as Record<string, unknown>

    return NextResponse.json({
      booking: {
        ...b,
        company:  b.companies,
        trip:     b.trips,
        history:  ((b.booking_status_history ?? []) as Record<string, unknown>[])
          .sort((a, z) => String(z.created_at).localeCompare(String(a.created_at))),
        containers: b.containers,
        invoice,
        companies:              undefined,
        trips:                  undefined,
        booking_status_history: undefined,
      },
    })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.app_metadata?.role !== 'company') {
      return NextResponse.json({ error: 'Forbidden — company only' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = updateBookingSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Validation error' },
        { status: 400 },
      )
    }

    const { notes, containers } = parsed.data

    // Fetch current booking — must belong to this company
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, trips:trip_id (base_price, per_kg_rate, max_containers)')
      .eq('id', id)
      .eq('company_id', user.id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const b = booking as Record<string, unknown>
    const trip = b.trips as Record<string, unknown> | null

    if (!['pending', 'approved'].includes(b.status as string)) {
      return NextResponse.json(
        { error: 'Cannot edit a booking that is in transit or delivered' },
        { status: 400 },
      )
    }

    // Capacity check with new container count
    const { data: otherBookingIds } = await supabase
      .from('bookings')
      .select('id')
      .eq('trip_id', b.trip_id as string)
      .neq('id', id)
      .neq('status', 'cancelled')

    const otherIds = ((otherBookingIds ?? []) as { id: string }[]).map((x) => x.id)
    let otherCount = 0
    if (otherIds.length > 0) {
      const { count } = await supabase
        .from('containers')
        .select('*', { count: 'exact', head: true })
        .in('booking_id', otherIds)
      otherCount = count ?? 0
    }

    const maxContainers = (trip?.max_containers ?? 999) as number
    if (otherCount + containers.length > maxContainers) {
      return NextResponse.json({ error: 'Trip does not have enough capacity' }, { status: 400 })
    }

    // Recalculate price
    const total_weight_kg = containers.reduce((s, c) => s + c.weight_kg, 0)
    const base  = (trip?.base_price  ?? 0) as number
    const rate  = (trip?.per_kg_rate ?? 0) as number
    const total_price = base + total_weight_kg * rate

    // Delete old containers and insert new
    await supabase.from('containers').delete().eq('booking_id', id)

    const { error: insertError } = await supabase
      .from('containers')
      .insert(containers.map((c) => ({
        booking_id:  id,
        weight_kg:   c.weight_kg,
        description: c.description ?? null,
      })))

    if (insertError) throw insertError

    // Update booking
    const { data: updated, error: updateError } = await supabase
      .from('bookings')
      .update({
        total_weight_kg,
        total_price,
        notes:      notes ?? null,
        status:     'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    // Status history
    await supabase.from('booking_status_history').insert({
      booking_id: id,
      updated_by: user.id,
      status:     'pending',
      notes:      'Booking edited — reset to pending',
    })

    // Trip status: if was full, may go back to open
    const newTotal = otherCount + containers.length
    if ((b.trips as Record<string, unknown> | null) !== null) {
      const newStatus = newTotal >= maxContainers ? 'full' : 'open'
      await supabase
        .from('trips')
        .update({ status: newStatus })
        .eq('id', b.trip_id as string)
        .in('status', ['open', 'full'])   // only update if not in transit
    }

    return NextResponse.json({ booking: updated })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
