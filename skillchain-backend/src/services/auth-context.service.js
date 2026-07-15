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

function extractGitHubUsername(authUser) {
  return extractGitHubIdentity(authUser).username;
}

function extractGitHubIdentity(authUser) {
  const candidates = [
    authUser?.user_metadata?.user_name,
    authUser?.user_metadata?.preferred_username,
    authUser?.user_metadata?.username,
    authUser?.user_metadata?.login,
    authUser?.app_metadata?.user_name,
    authUser?.app_metadata?.preferred_username,
    authUser?.app_metadata?.username,
  ];

  const identities = Array.isArray(authUser?.identities) ? authUser.identities : [];

  for (const identity of identities) {
    const provider = identity?.provider || identity?.identity_data?.provider;
    if (provider !== "github") continue;

    candidates.push(
      identity?.identity_data?.user_name,
      identity?.identity_data?.preferred_username,
      identity?.identity_data?.username,
      identity?.identity_data?.login
    );
  }

  const match = candidates.find(
    (value) => typeof value === "string" && value.trim().length > 0
  );

  const idCandidates = [
    authUser?.user_metadata?.provider_id,
    authUser?.user_metadata?.id,
    authUser?.app_metadata?.provider_id,
    authUser?.app_metadata?.id,
  ];

  for (const identity of identities) {
    const provider = identity?.provider || identity?.identity_data?.provider;
    if (provider !== "github") continue;

    idCandidates.push(identity?.id, identity?.identity_data?.id, identity?.identity_id);
  }

  const githubUserId = idCandidates.find((value) => {
    const normalized = String(value || "").trim();
    return normalized.length > 0 && /^\d+$/.test(normalized);
  });

  return {
    username: match ? match.trim() : null,
    githubUserId: githubUserId ? String(githubUserId).trim() : null,
  };
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
  extractGitHubIdentity,
  extractGitHubUsername,
  resolveAuthenticatedUser,
};
