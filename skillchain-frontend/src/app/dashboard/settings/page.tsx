import { redirect } from "next/navigation";
import SettingsClient, { type SettingsUser } from "./SettingsClient";
import { getSessionUser } from "@/utils/supabase/server";

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function getGitHubIdentity(user: {
  identities?: Array<{
    provider?: string;
    identity_data?: Record<string, unknown>;
  }>;
  user_metadata?: Record<string, unknown>;
}) {
  const identity = user.identities?.find((entry) => entry.provider === "github");
  const identityData = identity?.identity_data || {};
  const metadata = user.user_metadata || {};
  const username =
    readString(identityData.user_name) ||
    readString(identityData.preferred_username) ||
    readString(identityData.username) ||
    readString(identityData.login) ||
    readString(metadata.user_name) ||
    readString(metadata.preferred_username) ||
    readString(metadata.username) ||
    readString(metadata.login);

  return {
    connected: Boolean(identity || username),
    username: username || null,
    id:
      readString(identityData.provider_id) ||
      readString(identityData.sub) ||
      readString(metadata.provider_id) ||
      null,
  };
}

export default async function DashboardSettingsPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const metadata = user.user_metadata || {};
  const github = getGitHubIdentity(user);
  const providers = Array.from(
    new Set(
      (user.identities || [])
        .map((identity) => identity.provider)
        .filter((provider): provider is string => Boolean(provider))
    )
  );

  const settingsUser: SettingsUser = {
    id: user.id,
    email: user.email || null,
    createdAt: user.created_at || null,
    lastSignInAt: user.last_sign_in_at || null,
    primaryProvider: readString(user.app_metadata?.provider) || "email",
    providers,
    github,
    preferences: {
      displayName:
        readString(metadata.full_name) ||
        readString(metadata.name) ||
        user.email?.split("@")[0] ||
        "Developer",
      preferredRole: readString(metadata.preferred_role),
      profileVisibility: readString(metadata.profile_visibility) || "public",
      recruiterContactPreference:
        readString(metadata.recruiter_contact_preference) || "open",
    },
  };

  return <SettingsClient user={settingsUser} />;
}
