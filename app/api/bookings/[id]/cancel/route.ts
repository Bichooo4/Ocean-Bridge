// API Route — /api/bookings/[id]/cancel
// PATCH: cancel a booking — allowed for company (own) or staff/admin (any)
// Releases trip capacity and cancels linked invoice

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cancelBookingSchema } from '@/lib/validations/booking'

export async function PATCH(
  req: NextRequest,
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

    const body = await req.json().catch(() => ({}))
    const parsed = cancelBookingSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation error' }, { status: 400 })
    }

    const { cancel_reason } = parsed.data

    // Fetch booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const b = booking as Record<string, unknown>

    // Company can only cancel their own
    if (role === 'company' && b.company_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!['pending', 'approved'].includes(b.status as string)) {
      return NextResponse.json(
        { error: 'Cannot cancel a booking that is out for delivery or delivered' },
        { status: 400 },
      )
    }

    const now = new Date().toISOString()

    // Update booking
    const { data: updated, error: updateError } = await supabase
      .from('bookings')
      .update({
        status:        'cancelled',
        cancelled_at:  now,
        cancel_reason: cancel_reason ?? null,
        updated_at:    now,
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    // Cancel linked invoice
    await supabase
      .from('invoices')
      .update({ status: 'cancelled', cancelled_at: now })
      .eq('booking_id', id)
      .eq('status', 'unpaid')

    // Status history
    await supabase.from('booking_status_history').insert({
      booking_id: id,
      updated_by: user.id,
      status:     'cancelled',
      notes:      cancel_reason ?? 'Booking cancelled',
    })

    // Recalculate trip capacity — if trip was full, set back to open
    const { data: containerRows } = await supabase
      .from('containers')
      .select('id', { count: 'exact' })
      .eq('booking_id', id)

    const cancelledCount = containerRows?.length ?? 0

    if (cancelledCount > 0) {
      const { data: tripRow } = await supabase
        .from('trips')
        .select('max_containers, status')
        .eq('id', b.trip_id as string)
        .single()

      if (tripRow) {
        const t = tripRow as Record<string, unknown>

        if (t.status === 'full') {
          // Count remaining non-cancelled containers
          const { data: otherBookingIds } = await supabase
            .from('bookings')
            .select('id')
            .eq('trip_id', b.trip_id as string)
            .neq('id', id)
            .neq('status', 'cancelled')

          const otherIds = ((otherBookingIds ?? []) as { id: string }[]).map((x) => x.id)
          let remaining = 0
          if (otherIds.length > 0) {
            const { count } = await supabase
              .from('containers')
              .select('*', { count: 'exact', head: true })
              .in('booking_id', otherIds)
            remaining = count ?? 0
          }

          if (remaining < (t.max_containers as number)) {
            await supabase
              .from('trips')
              .update({ status: 'open' })
              .eq('id', b.trip_id as string)
          }
        }
      }
    }

    return NextResponse.json({ booking: updated })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
