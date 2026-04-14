// Client Component hook — gets current user and role from Supabase session.
// Uses browser client — safe in client components only.
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface UseUserResult {
  user:    User | null
  role:    'admin' | 'staff' | 'company' | null
  loading: boolean
}

export function useUser(): UseUserResult {
  const [user,    setUser]    = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // app_metadata is server-only writable — safe to trust for role checks.
  const role = (user?.app_metadata?.role ?? null) as 'admin' | 'staff' | 'company' | null

  return { user, role, loading }
}
