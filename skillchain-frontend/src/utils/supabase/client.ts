import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Uses environment variables to create a client components wrapper for Supabase
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
