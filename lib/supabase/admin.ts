import { createClient } from '@supabase/supabase-js'

// WARNING: Never expose this client to the browser.
// Use ONLY in server-side API routes.
export const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)
