import { createClient } from "@supabase/supabase-js";
import { getPublicEnv } from "@/lib/env";

let browserClient:
  | ReturnType<typeof createClient>
  | undefined;

export function createBrowserSupabaseClient() {
  if (browserClient) {
    return browserClient;
  }

  const { supabaseUrl, supabaseAnonKey } = getPublicEnv();
  browserClient = createClient(supabaseUrl, supabaseAnonKey);
  return browserClient;
}
