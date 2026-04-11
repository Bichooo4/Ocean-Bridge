// Placeholder for generated Supabase DB types.
// Run: npx supabase gen types typescript --project-id lbuxfcmjhtbdflqkhmiv > lib/supabase/types.ts
// to regenerate after schema changes.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: Record<string, unknown>
    Views: Record<string, unknown>
    Functions: Record<string, unknown>
    Enums: Record<string, unknown>
  }
}
