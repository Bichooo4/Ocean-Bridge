// API Route — /api/auth/signup
// POST: server-side company self-registration.
//
// Why a server route instead of supabase.auth.signUp() on the client?
// supabase.auth.signUp() can only set user_metadata, which is writable by the
// user at any time. Role must live in app_metadata, which is writable ONLY by
// the service role. Using adminClient here guarantees the role is set correctly
// and cannot be escalated by a crafted client-side call.

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

    // Create user with role in app_metadata (server-only — cannot be self-modified).
    // email_confirm: false sends a confirmation email; the /api/auth/callback route
    // handles the token exchange and creates the session.
    // The DB trigger handle_new_auth_user() reads user_metadata to populate the
    // companies table row automatically on user creation.
    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      app_metadata:  { role: 'company' },
      user_metadata: { type: 'company', company_name, contact_name, phone: phone ?? null },
    })

    if (error) {
      // Surface recognisable errors to the client without leaking internals
      const msg = error.message ?? 'Registration failed'
      const status = msg.toLowerCase().includes('already registered') ? 409 : 400
      return NextResponse.json({ error: msg }, { status })
    }

    return NextResponse.json(
      { message: 'Account created. Please check your email to confirm your account.' },
      { status: 201 },
    )
  } catch {
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 })
  }
}
