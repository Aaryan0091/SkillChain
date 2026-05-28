const { getSupabaseAdminClient } = require("../lib/supabase");

async function ensureUserProfile(authUser) {
  const supabase = getSupabaseAdminClient();
  const email = authUser.email;

  if (!email) {
    throw new Error("Authenticated Supabase user is missing an email address.");
  }

  const payload = {
    id: authUser.id,
    email,
    wallet_address:
      authUser.user_metadata?.wallet_address ||
      authUser.user_metadata?.walletAddress ||
      null,
  };

  const { error } = await supabase.from("users").upsert(payload);

  if (error) {
    throw new Error(`Failed to sync user profile: ${error.message}`);
  }

  return payload;
}

async function resolveAuthenticatedUser(request) {
  const authHeader = request.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) {
    return null;
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    throw new Error("Invalid Supabase access token.");
  }

  await ensureUserProfile(data.user);
  return data.user;
}

module.exports = {
  ensureUserProfile,
  resolveAuthenticatedUser,
};
