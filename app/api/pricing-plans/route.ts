import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireRole } from '@/lib/auth'
import { createPricingPlanSchema } from '@/lib/validations/pricing-plan'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth()
    if (!auth.ok) return auth.response
    const { role, supabase } = auth

    const { searchParams } = req.nextUrl
    const limit  = Math.min(Math.max(parseInt(searchParams.get('limit')  ?? '100', 10), 1), 200)
    const offset = Math.max(parseInt(searchParams.get('offset') ?? '0',  10), 0)

    let query: any = supabase
      .from('pricing_plans')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (role !== 'admin') {
      query = query.eq('is_active', true)
    }

    const { data, error, count } = await query
    if (error) throw error

    return NextResponse.json({ plans: data ?? [], total: count ?? 0, limit, offset })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(['admin'])
    if (!auth.ok) return auth.response
    const { supabase } = auth

    const body = await req.json()
    const parsed = createPricingPlanSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Validation error' },
        { status: 400 },
      )
    }

    const { data: plan, error: insertError } = await supabase
      .from('pricing_plans')
      .insert({ ...parsed.data, is_active: true })
      .select()
      .single()

    if (insertError) throw insertError

    return NextResponse.json({ plan }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
