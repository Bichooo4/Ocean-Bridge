import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const auth = await requireRole(['admin', 'staff'])
    if (!auth.ok) return auth.response
    const { user, supabase } = auth

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

    const { data: updated, error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    await supabase.from('booking_status_history').insert({
      booking_id: id,
      updated_by: user.id,
      status:     'approved',
      notes:      null,
    })

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
