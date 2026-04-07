const { createClient } = require("@supabase/supabase-js");
const { env } = require("../config/env");

let adminClient;

function getSupabaseAdminClient() {
  if (adminClient) {
    return adminClient;
  }

  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for backend client."
    );
  }

  adminClient = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return adminClient;
}

module.exports = { getSupabaseAdminClient };
