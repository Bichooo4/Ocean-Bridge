import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { z } from 'zod'

const toggleSchema = z.object({
  is_active: z.boolean(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const auth = await requireRole(['admin'])
    if (!auth.ok) return auth.response
    const { supabase } = auth

    const body = await req.json()
    const parsed = toggleSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'is_active (boolean) is required' }, { status: 400 })
    }

    const { data: plan, error } = await supabase
      .from('pricing_plans')
      .update({ is_active: parsed.data.is_active })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ plan })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
