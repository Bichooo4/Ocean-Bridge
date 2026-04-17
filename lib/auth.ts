import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export interface CurrentUser {
  id: string
  email: string
  type: 'admin' | 'staff' | 'company'
  name: string
}

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

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null

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

type UserRole = 'admin' | 'staff' | 'company'
type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

type AuthOk = { ok: true; user: NonNullable<Awaited<ReturnType<SupabaseServerClient['auth']['getUser']>>['data']['user']>; role: UserRole; supabase: SupabaseServerClient }
type AuthFail = { ok: false; response: NextResponse }
type AuthResult = AuthOk | AuthFail

export async function requireAuth(): Promise<AuthResult> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  const role = user.app_metadata?.role as UserRole | undefined
  if (!role) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  return { ok: true, user, role, supabase }
}

export async function requireRole(roles: UserRole[]): Promise<AuthResult> {
  const result = await requireAuth()
  if (!result.ok) return result
  if (!roles.includes(result.role)) {
    const label = roles.join('/') 
    return {
      ok: false,
      response: NextResponse.json({ error: `Forbidden — ${label} only` }, { status: 403 }),
    }
  }
  return result
}

export async function signOut() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch {

  }
  redirect('/login')
}
