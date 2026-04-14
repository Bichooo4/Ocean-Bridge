// Server Route Handler
// Handles Supabase auth callback after email confirmation.
// Exchanges the auth code for a session, then redirects to root.
// Middleware will then route to the correct dashboard based on role.

import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')

  if (code) {
    try {
      const supabase = await createClient()
      await supabase.auth.exchangeCodeForSession(code)
      return NextResponse.redirect(`${origin}/`)
    } catch {
      return NextResponse.redirect(`${origin}/login`)
    }
  }

  return NextResponse.redirect(`${origin}/login`)
}
