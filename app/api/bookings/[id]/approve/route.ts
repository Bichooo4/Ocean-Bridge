// API Route — /api/bookings/[id]/approve
// PATCH: admin/staff approves a pending booking
// Auto-creates invoice on approval

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
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
    if (!['admin', 'staff'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden — admin/staff only' }, { status: 403 })
    }

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

    if (b.status !== 'pending') {
      return NextResponse.json(
        { error: 'Only pending bookings can be approved' },
        { status: 400 },
      )
    }

    // Update booking status
    const { data: updated, error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    // Status history
    await supabase.from('booking_status_history').insert({
      booking_id: id,
      updated_by: user.id,
      status:     'approved',
      notes:      null,
    })

    // Auto-create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        booking_id: id,
        company_id: b.company_id,
        total_price: b.total_price,
        status:      'unpaid',
        issued_at:   new Date().toISOString(),
        paid_at:     null,
        cancelled_at: null,
      })
      .select()
      .single()

    if (invoiceError) throw invoiceError

    return NextResponse.json({ booking: updated, invoice })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
