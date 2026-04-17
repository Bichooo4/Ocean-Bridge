import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { adminClient }  from '@/lib/supabase/admin'
import { z } from 'zod'

const createStaffSchema = z.object({
  full_name: z.string().min(2).max(100),
  email:     z.string().email(),
  phone:     z.string().max(30).optional(),
  role:      z.enum(['admin', 'staff']),
  password:  z.string().min(8),
})

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(['admin'])
    if (!auth.ok) return auth.response

    const body = await req.json()
    const parsed = createStaffSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Validation error' },
        { status: 400 },
      )
    }

    const { full_name, email, phone, role, password } = parsed.data

    const { data, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata:  { role },
    })

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 })
    }

    const { error: profileError } = await adminClient
      .from('users')
      .insert({
        id: data.user.id,
        role,
        full_name,
        phone: phone ?? null,
      })

    if (profileError) {

      await adminClient.auth.admin.deleteUser(data.user.id)
      return NextResponse.json(
        { error: 'Failed to create user profile. Please try again.' },
        { status: 500 },
      )
    }

    return NextResponse.json(
      { user: { id: data.user.id, email, full_name, role } },
      { status: 201 },
    )
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
