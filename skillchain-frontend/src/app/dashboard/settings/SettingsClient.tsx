"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownToLine,
  Bell,
  GitBranch,
  Link2,
  Loader2,
  LogOut,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  UserRoundCog,
} from "lucide-react";
import StatePanel from "@/components/StatePanel";
import { signOutCompletely } from "@/lib/auth-session";
import { buildSkillchainApiUrl } from "@/lib/skillchain-api";
import { createClient } from "@/utils/supabase/client";

export type SettingsUser = {
  id: string;
  email: string | null;
  createdAt: string | null;
  lastSignInAt: string | null;
  primaryProvider: string;
  providers: string[];
  github: {
    connected: boolean;
    username: string | null;
    id: string | null;
  };
  preferences: {
    displayName: string;
    preferredRole: string;
    profileVisibility: string;
    recruiterContactPreference: string;
  };
};

type Notice = {
  type: "success" | "error" | "info";
  message: string;
};

function formatDate(value: string | null) {
  if (!value) return "Unknown";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function readApiJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return {
      success: false,
      message: "The server returned an unreadable response. Please try again.",
    };
  }
}

async function getAccessToken() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session?.access_token) {
    throw new Error("Please sign in again before using this account action.");
  }

  return data.session.access_token;
}

export default function SettingsClient({ user }: { user: SettingsUser }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(user.preferences.displayName);
  const [preferredRole, setPreferredRole] = useState(user.preferences.preferredRole);
  const [profileVisibility, setProfileVisibility] = useState(
    user.preferences.profileVisibility
  );
  const [recruiterContactPreference, setRecruiterContactPreference] = useState(
    user.preferences.recruiterContactPreference
  );
  const [deletePhrase, setDeletePhrase] = useState("");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const canDelete = deletePhrase === "DELETE MY ACCOUNT";

  async function handleSavePreferences(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingPreferences(true);
    setNotice(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: displayName.trim() || "Developer",
          preferred_role: preferredRole.trim(),
          profile_visibility: profileVisibility,
          recruiter_contact_preference: recruiterContactPreference,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      setNotice({
        type: "success",
        message: "Profile preferences saved. Refreshing your settings view now.",
      });
      router.refresh();
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Could not save profile preferences.",
      });
    } finally {
      setSavingPreferences(false);
    }
  }

  async function handleExportAccount() {
    setExporting(true);
    setNotice(null);

    try {
      const accessToken = await getAccessToken();
      const response = await fetch(buildSkillchainApiUrl("/auth/account-export"), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const result = await readApiJson(response);

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not export account data.");
      }

      downloadJson(`skillchain-account-${user.id}.json`, result.data);
      setNotice({
        type: "success",
        message: "Account export downloaded as a JSON file.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error instanceof Error ? error.message : "Could not export account data.",
      });
    } finally {
      setExporting(false);
    }
  }

  async function handleDeleteAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canDelete) {
      setNotice({
        type: "error",
        message: "Type DELETE MY ACCOUNT before deleting this account.",
      });
      return;
    }

    setDeleting(true);
    setNotice(null);

    try {
      const accessToken = await getAccessToken();
      const response = await fetch(buildSkillchainApiUrl("/auth/account"), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ confirmation: deletePhrase }),
      });
      const result = await readApiJson(response);

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not delete account.");
      }

      await signOutCompletely(router);
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error instanceof Error ? error.message : "Could not delete account.",
      });
    } finally {
      setDeleting(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    setNotice(null);

    try {
      await signOutCompletely(router);
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Could not sign out.",
      });
      setSigningOut(false);
    }
  }

  return (
    <main className="w-full px-4 pb-12 pt-4 sm:px-6 sm:pb-14 lg:px-8 lg:pb-16">
      <section className="rounded-[2.25rem] border border-border/70 bg-surface/50 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.18)] backdrop-blur-2xl sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center rounded-full border border-[#a8f5e9]/25 bg-[#a8f5e9]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-[#a8f5e9]">
              Account Controls
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Settings
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
              Manage your connected GitHub identity, profile preferences, account export, and permanent account removal.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {signingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            Sign out
          </button>
        </div>

        {notice ? (
          <div className="mt-5">
            <StatePanel
              title={notice.type === "success" ? "Saved" : notice.type === "info" ? "Notice" : "Action failed"}
              message={notice.message}
              variant={notice.type}
            />
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="space-y-4">
            <article className="rounded-[1.6rem] border border-[#a8f5e9]/15 bg-[#a8f5e9]/10 p-5">
              <div className="flex items-center gap-3 text-[#a8f5e9]">
                <GitBranch className="h-5 w-5" />
                <h2 className="text-lg font-semibold text-white">Connected GitHub</h2>
              </div>
              <p className="mt-4 text-2xl font-semibold text-white">
                {user.github.username ? `@${user.github.username}` : "No GitHub account connected"}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {user.github.connected
                  ? "This GitHub identity is used for owner/contributor checks before a repo can be saved to your profile."
                  : "Sign in with GitHub to enable stronger repository ownership checks."}
              </p>
              <div className="mt-4 grid gap-3 text-sm">
                <div className="rounded-2xl border border-white/10 bg-background/45 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">GitHub ID</p>
                  <p className="mt-2 break-all font-medium text-white">{user.github.id || "Not available"}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-background/45 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Providers</p>
                  <p className="mt-2 font-medium capitalize text-white">
                    {user.providers.length ? user.providers.join(", ") : user.primaryProvider}
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-[1.6rem] border border-white/10 bg-background/45 p-5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-[#a8f5e9]" />
                <h2 className="text-lg font-semibold text-white">Account summary</h2>
              </div>
              <div className="mt-4 grid gap-3 text-sm">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Email</p>
                  <p className="mt-2 break-all font-medium text-white">{user.email || "Unknown"}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Member since</p>
                  <p className="mt-2 font-medium text-white">{formatDate(user.createdAt)}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Last sign-in</p>
                  <p className="mt-2 font-medium text-white">{formatDate(user.lastSignInAt)}</p>
                </div>
              </div>
            </article>
          </section>

          <section className="space-y-4">
            <form
              onSubmit={handleSavePreferences}
              className="rounded-[1.6rem] border border-white/10 bg-background/45 p-5"
            >
              <div className="flex items-center gap-3">
                <SlidersHorizontal className="h-5 w-5 text-[#a8f5e9]" />
                <h2 className="text-lg font-semibold text-white">Profile preferences</h2>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                These preferences shape your SkillChain profile summary. Public certificate proof records remain shareable through their verification links.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    Display name
                  </span>
                  <input
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-[#a8f5e9]/60"
                    placeholder="Your public name"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    Preferred role
                  </span>
                  <input
                    value={preferredRole}
                    onChange={(event) => setPreferredRole(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-[#a8f5e9]/60"
                    placeholder="Frontend engineer, backend engineer..."
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    Profile visibility
                  </span>
                  <select
                    value={profileVisibility}
                    onChange={(event) => setProfileVisibility(event.target.value)}
                    className="w-full cursor-pointer rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-[#a8f5e9]/60"
                  >
                    <option value="public">Prefer public summary</option>
                    <option value="certificate_only">Prefer certificate links only</option>
                    <option value="private">Prefer private dashboard only</option>
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    Recruiter contact
                  </span>
                  <select
                    value={recruiterContactPreference}
                    onChange={(event) => setRecruiterContactPreference(event.target.value)}
                    className="w-full cursor-pointer rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-[#a8f5e9]/60"
                  >
                    <option value="open">Open to recruiter contact</option>
                    <option value="review_first">Review requests first</option>
                    <option value="closed">Not open right now</option>
                  </select>
                </label>
              </div>

              <button
                type="submit"
                disabled={savingPreferences}
                className="mt-5 inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#a8f5e9] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingPreferences ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserRoundCog className="h-4 w-4" />}
                Save preferences
              </button>
            </form>

            <article className="rounded-[1.6rem] border border-white/10 bg-background/45 p-5">
              <div className="flex items-center gap-3">
                <ArrowDownToLine className="h-5 w-5 text-[#a8f5e9]" />
                <h2 className="text-lg font-semibold text-white">Export account data</h2>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Download your auth profile plus saved SkillChain projects, scores, certificates, and evidence records as JSON.
              </p>
              <button
                type="button"
                onClick={handleExportAccount}
                disabled={exporting}
                className="mt-5 inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-[#a8f5e9]/25 bg-[#a8f5e9]/10 px-5 py-2.5 text-sm font-semibold text-[#a8f5e9] transition hover:bg-[#a8f5e9]/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                Export JSON
              </button>
            </article>

            <form
              onSubmit={handleDeleteAccount}
              className="rounded-[1.6rem] border border-red-400/20 bg-red-950/15 p-5"
            >
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 text-red-200" />
                <h2 className="text-lg font-semibold text-white">Delete account</h2>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-red-100/75">
                This permanently removes your Supabase auth account, SkillChain profile row, saved projects, scores, jobs, metrics, and certificates. This cannot be undone.
              </p>
              <label className="mt-5 block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-red-100/70">
                  Type DELETE MY ACCOUNT
                </span>
                <input
                  value={deletePhrase}
                  onChange={(event) => setDeletePhrase(event.target.value)}
                  className="w-full rounded-2xl border border-red-200/15 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-red-200/60"
                  placeholder="DELETE MY ACCOUNT"
                />
              </label>
              <button
                type="submit"
                disabled={!canDelete || deleting}
                className="mt-5 inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-red-300/25 bg-red-400/15 px-5 py-2.5 text-sm font-semibold text-red-100 transition hover:bg-red-400/25 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Permanently delete account
              </button>
            </form>
          </section>
        </div>

        <section className="mt-4 rounded-[1.6rem] border border-white/10 bg-background/45 p-5">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-[#a8f5e9]" />
            <h2 className="text-lg font-semibold text-white">Account behavior notes</h2>
          </div>
          <div className="mt-4 grid gap-3 text-sm leading-relaxed text-muted lg:grid-cols-3">
            <p className="rounded-2xl border border-white/10 bg-white/5 p-4">
              Profile submissions are saved only when the GitHub identity passes owner or contributor checks.
            </p>
            <p className="rounded-2xl border border-white/10 bg-white/5 p-4">
              Public-only repo analysis stays separate from your personal SkillChain proof profile.
            </p>
            <p className="rounded-2xl border border-white/10 bg-white/5 p-4">
              Public proof remains project-certificate based; your profile is a summary layer.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
