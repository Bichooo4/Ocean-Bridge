// API Route — /api/pricing-plans
// GET: admin sees all plans; others see only active
// POST: admin only — creates new pricing plan

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPricingPlanSchema } from '@/lib/validations/pricing-plan'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = (user.app_metadata?.role ?? '') as string

    const { searchParams } = req.nextUrl
    const limit  = Math.min(Math.max(parseInt(searchParams.get('limit')  ?? '100', 10), 1), 200)
    const offset = Math.max(parseInt(searchParams.get('offset') ?? '0',  10), 0)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = supabase
      .from('pricing_plans')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Non-admin users only see active plans
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
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.app_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden — admin only' }, { status: 403 })
    }

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
