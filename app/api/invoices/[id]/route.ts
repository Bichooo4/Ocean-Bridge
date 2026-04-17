import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { updateInvoiceStatusSchema } from '@/lib/validations/invoice'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const auth = await requireRole(['admin', 'staff'])
    if (!auth.ok) return auth.response
    const { supabase } = auth

    const body = await req.json()
    const parsed = updateInvoiceStatusSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Validation error' },
        { status: 400 },
      )
    }

    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const inv = invoice as Record<string, unknown>

    if (inv.status === 'cancelled') {
      return NextResponse.json({ error: 'Cannot update a cancelled invoice' }, { status: 400 })
    }

    const { status } = parsed.data
    const updatePayload: Record<string, unknown> = { status }

    if (status === 'paid') {
      updatePayload.paid_at = new Date().toISOString()
    } else {
      updatePayload.paid_at = null
    }

    const { data: updated, error: updateError } = await supabase
      .from('invoices')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({ invoice: updated })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
