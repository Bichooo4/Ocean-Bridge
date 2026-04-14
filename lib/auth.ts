// Server-side auth helper functions.
// Used in server components, layouts, and API routes.
// All functions create a fresh server client per request.
// NEVER import this in client components — use @/lib/supabase/client instead.

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export interface CurrentUser {
  id: string
  email: string
  type: 'admin' | 'staff' | 'company'
  name: string
}

// Get current session — returns null if not logged in
export async function getSession() {
  try {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) return null
    return session
  } catch {
    return null
  }
}

// Get current user with role info
// Returns: { id, email, type, name } or null
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null

    // app_metadata is server-only writable — safe to trust for role checks.
    const type = user.app_metadata?.role as 'admin' | 'staff' | 'company' | undefined
    if (!type) return null

    let name = user.email ?? ''

    if (type === 'admin' || type === 'staff') {
      const { data } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', user.id)
        .single()
      name = data?.full_name ?? name
    } else {
      const { data } = await supabase
        .from('companies')
        .select('contact_name')
        .eq('id', user.id)
        .single()
      name = data?.contact_name ?? name
    }

    return {
      id: user.id,
      email: user.email ?? '',
      type,
      name,
    }
  } catch {
    return null
  }
}

// Get user role from metadata
// Returns: 'admin' | 'staff' | 'company' | null
export async function getUserRole(): Promise<'admin' | 'staff' | 'company' | null> {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null
    return (user.app_metadata?.role as 'admin' | 'staff' | 'company') ?? null
  } catch {
    return null
  }
}

// Sign out user and redirect to /login
export async function signOut() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch {
    // Ignore sign-out errors
  }
  redirect('/login')
}
