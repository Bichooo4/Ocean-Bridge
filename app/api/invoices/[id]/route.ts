// API Route — /api/invoices/[id]
// PATCH: admin/staff toggles invoice paid/unpaid
// Company cannot change invoice status

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateInvoiceStatusSchema } from '@/lib/validations/invoice'

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
    if (!['admin', 'staff'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden — admin/staff only' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = updateInvoiceStatusSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Validation error' },
        { status: 400 },
      )
    }

    // Fetch invoice to check current status
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
