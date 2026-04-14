// API Route — /api/staff
// POST: admin creates a new staff or admin account
// Uses adminClient (service role) to bypass auth restrictions
// DB trigger auto-creates users table row from metadata

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
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
    // Auth check via regular client (reads session cookie)
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.app_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden — admin only' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = createStaffSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Validation error' },
        { status: 400 },
      )
    }

    const { full_name, email, phone, role, password } = parsed.data

    // Use adminClient — service role bypasses auth restrictions.
    // Role goes into app_metadata (server-only writable) so it cannot be tampered
    // with by the user via supabase.auth.updateUser().
    // Non-sensitive profile data goes into user_metadata.
    const { data, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata:  { role },
      user_metadata: { full_name, phone: phone ?? null },
    })

    if (createError) {
      // Surface known errors to client
      return NextResponse.json(
        { error: createError.message },
        { status: 400 },
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
