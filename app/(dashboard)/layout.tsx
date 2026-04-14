// Server Component
// Root layout for all dashboard routes (/admin, /staff, /company).
// Fetches user session and role from Supabase on every request.
// Passes user info down to DashboardLayout (client component).
// If no session → redirects to /login.

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // app_metadata is server-only writable — safe to trust for role resolution.
  const userType = user.app_metadata?.role as 'admin' | 'staff' | 'company' | undefined

  if (!userType) redirect('/login')

  // Resolve display name from the correct table
  let displayName = ''
  let email = user.email ?? ''

  if (userType === 'admin' || userType === 'staff') {
    const { data } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', user.id)
      .single()
    displayName = data?.full_name ?? email
  } else {
    const { data } = await supabase
      .from('companies')
      .select('contact_name')
      .eq('id', user.id)
      .single()
    displayName = data?.contact_name ?? email
  }

  return (
    <DashboardLayout
      title=""
      userName={displayName}
      userEmail={email}
      role={userType}
    >
      {children}
    </DashboardLayout>
  )
}
