import { createBrowserClient } from '@supabase/ssr'
import { e2eAccessToken, e2eUser, isE2ETestMode } from '@/lib/e2e-fixtures'

export function createClient() {
  if (isE2ETestMode) {
    return {
      auth: {
        getSession: async () => ({
          data: {
            session: {
              access_token: e2eAccessToken,
              user: e2eUser,
            },
          },
          error: null,
        }),
        getUser: async () => ({
          data: { user: e2eUser },
          error: null,
        }),
        onAuthStateChange: () => ({
          data: {
            subscription: {
              unsubscribe() {},
            },
          },
        }),
        updateUser: async () => ({
          data: { user: e2eUser },
          error: null,
        }),
        signOut: async () => ({
          error: null,
        }),
      },
    } as ReturnType<typeof createBrowserClient>
  }

  // Uses environment variables to create a client components wrapper for Supabase
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
