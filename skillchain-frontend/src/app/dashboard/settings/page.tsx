import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  Bell,
  FolderGit2,
  Link2,
  LogOut,
  Shield,
  ShieldCheck,
  UserCircle2,
  UserRoundCog,
} from "lucide-react";
import { createClient, getSessionUser } from "@/utils/supabase/server";

function formatDate(value: string | null | undefined) {
  if (!value) return "Unknown";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getGitHubUsername(user: {
  user_metadata?: Record<string, unknown>;
}) {
  const candidates = [
    user.user_metadata?.user_name,
    user.user_metadata?.preferred_username,
    user.user_metadata?.username,
    user.user_metadata?.login,
  ];

  const match = candidates.find(
    (value) => typeof value === "string" && value.trim().length > 0
  );

  return typeof match === "string" ? match.trim() : null;
}

export default async function DashboardSettingsPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const signOut = async () => {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  };

  const provider = user.app_metadata?.provider || "email";
  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Developer";
  const lastSignIn = formatDate(user.last_sign_in_at);
  const email = user.email || "Unknown";
  const githubUsername = getGitHubUsername(user);

  const accountCards = [
    {
      label: "Display name",
      value: displayName,
      note: "Taken from your current auth profile.",
      icon: UserRoundCog,
    },
    {
      label: "Primary sign-in",
      value: provider,
      note: "This is the provider currently connected to your SkillChain account.",
      icon: Link2,
    },
    {
      label: "Member since",
      value: formatDate(user.created_at),
      note: "Your account creation date in SkillChain.",
      icon: ShieldCheck,
    },
  ];

  const quickActions = [
    {
      href: "/dashboard/profile",
      label: "Open profile",
      note: "Review your saved stats and public-facing summary.",
      icon: UserCircle2,
    },
    {
      href: "/dashboard/certificates",
      label: "Open certificates",
      note: "Manage issued project proof records.",
      icon: ShieldCheck,
    },
    {
      href: "/dashboard/submit",
      label: "Submit repository",
      note: "Analyze another repo and attach it to your profile.",
      icon: FolderGit2,
    },
  ];

  return (
    <main className="w-full px-4 pb-12 pt-4 sm:px-6 sm:pb-14 lg:px-8 lg:pb-16">
      <section className="rounded-[2.5rem] border border-border/70 bg-surface/50 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.18)] backdrop-blur-2xl sm:p-8">
        <p className="inline-flex items-center rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-accent">
          Account Controls
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Settings
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          This area is intentionally simple for now. It shows your connected account details, a few basic account actions, and the safest place to sign out.
        </p>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {accountCards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.label}
                className="rounded-[1.6rem] border border-white/10 bg-background/45 p-5"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-accent">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  {card.label}
                </p>
                <p className="mt-2 break-all text-lg font-semibold text-white">
                  {card.value}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{card.note}</p>
              </article>
            );
          })}
        </div>

        <div className="mt-4 rounded-[1.6rem] border border-accent/15 bg-accent/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Connected GitHub
          </p>
          <p className="mt-2 text-xl font-semibold text-white">
            {githubUsername ? `@${githubUsername}` : "No GitHub account detected"}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            This is the GitHub username currently being used for repository ownership checks in SkillChain.
          </p>
        </div>

        <div className="mt-8 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[1.8rem] border border-white/10 bg-background/45 p-5">
            <h2 className="text-lg font-semibold text-white">Quick actions</h2>
            <div className="mt-4 grid gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex cursor-pointer items-start justify-between gap-4 rounded-[1.25rem] border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-background/60 text-accent">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{action.label}</p>
                        <p className="mt-1 text-sm leading-relaxed text-muted">{action.note}</p>
                      </div>
                    </div>
                    <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted" />
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="rounded-[1.8rem] border border-white/10 bg-background/45 p-5">
            <h2 className="text-lg font-semibold text-white">What you can manage here</h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
              <li>Review which account is currently connected.</li>
              <li>Confirm which provider you used to log in.</li>
              <li>Sign out safely without losing saved project records.</li>
              <li>See where broader account controls will expand later.</li>
            </ul>
          </section>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr]">
          <section className="rounded-[1.8rem] border border-white/10 bg-background/45 p-5">
            <div className="flex items-center gap-2 text-white">
              <Shield className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-semibold">Security basics</h2>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Signed in as</p>
                <p className="mt-2 break-all font-medium text-white">{email}</p>
              </div>
              <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Last sign-in</p>
                <p className="mt-2 font-medium text-white">{lastSignIn}</p>
              </div>
              <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Current provider</p>
                <p className="mt-2 font-medium capitalize text-white">{provider}</p>
              </div>
            </div>

            <form action={signOut} className="mt-6">
              <button
                type="submit"
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm font-semibold text-red-200 transition-colors hover:bg-red-400/15"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </form>
          </section>

          <section className="rounded-[1.8rem] border border-white/10 bg-background/45 p-5">
            <div className="flex items-center gap-2 text-white">
              <Bell className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-semibold">Current scope</h2>
            </div>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
              <p>
                Public proof is project-based. Your profile is a summary layer, while the main proof lives on project certificate verification pages.
              </p>
              <p>
                Connected-account switching, notification preferences, and deeper profile editing are still future controls.
              </p>
              <p>
                For now, this page focuses on real options that already work instead of fake saved preferences.
              </p>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
