import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const signupSchema = z.object({
  email:        z.string().email('Invalid email address'),
  password:     z.string().min(8, 'Password must be at least 8 characters'),
  company_name: z.string().min(2, 'Company name must be at least 2 characters').max(100),
  contact_name: z.string().min(2, 'Contact name must be at least 2 characters').max(100),
  phone:        z.string().max(30).optional().nullable(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = signupSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Validation error' },
        { status: 400 },
      )
    }

    const { email, password, company_name, contact_name, phone } = parsed.data

    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      app_metadata:  { role: 'company' },
    })

    if (error) {
      const msg = error.message ?? 'Registration failed'
      const status = msg.toLowerCase().includes('already registered') ? 409 : 400
      return NextResponse.json({ error: msg }, { status })
    }

    const { error: profileError } = await adminClient
      .from('companies')
      .insert({
        id:           data.user.id,
        company_name,
        contact_name,
        phone:        phone ?? null,
      })

    if (profileError) {

      await adminClient.auth.admin.deleteUser(data.user.id)
      return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 })
    }

    return NextResponse.json(
      { message: 'Account created. Please check your email to confirm your account.' },
      { status: 201 },
    )
  } catch {
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 })
  }
}
