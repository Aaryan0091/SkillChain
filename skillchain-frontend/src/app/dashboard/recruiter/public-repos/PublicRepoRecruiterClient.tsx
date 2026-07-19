"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BriefcaseBusiness,
  Eye,
  FileSearch,
  FolderKanban,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import EmptyStateCard from "@/components/EmptyStateCard";
import StatePanel from "@/components/StatePanel";
import {
  publicRepoResultHref,
  readRecruiterRecentSearches,
  type RecruiterRecentSearch,
} from "@/lib/recruiter-public-repos";

type PublicRepoRecruiterClientProps = {
  recruiterId: string;
  recruiterLabel: string;
  savedProjectCount: number;
};

function formatViewedAt(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Recently";

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PublicRepoRecruiterClient({
  recruiterId,
  recruiterLabel,
  savedProjectCount,
}: PublicRepoRecruiterClientProps) {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [recentSearches] = useState<RecruiterRecentSearch[]>(() =>
    readRecruiterRecentSearches(recruiterId)
  );

  const hasRecentSearches = recentSearches.length > 0;
  const workspaceSummary = useMemo(
    () => [
      {
        label: "Saved projects",
        value: savedProjectCount,
        note: "Your own SkillChain profile work stays available here.",
      },
      {
        label: "Public repo checks",
        value: recentSearches.length,
        note: "Recent recruiter lookups are stored locally for quick recall.",
      },
    ],
    [recentSearches.length, savedProjectCount]
  );

  function openRepoResult(nextRepoUrl: string, nextBranch?: string) {
    router.push(publicRepoResultHref(nextRepoUrl, nextBranch));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!repoUrl.trim()) {
      setError("Paste a public GitHub repository URL first.");
      return;
    }

    setError(null);
    openRepoResult(repoUrl.trim(), branch.trim());
  }

  return (
    <div className="space-y-6 pb-10">
      <section className="rounded-[2.3rem] border border-white/10 bg-[linear-gradient(135deg,rgba(10,14,27,0.96),rgba(11,28,37,0.92),rgba(168,245,233,0.08))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-2xl sm:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#a8f5e9]/20 bg-[#a8f5e9]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a8f5e9]">
              <FileSearch className="h-3.5 w-3.5" />
              Recruiter public repo intake
            </div>
            <div className="space-y-3">
              <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Review any public GitHub repository like a recruiter, without attaching it to a developer profile.
              </h1>
              <p className="max-w-3xl text-sm leading-relaxed text-white/70 sm:text-base">
                This area is for screening random public repositories. It keeps your own saved SkillChain projects separate, while giving you a neat recruiter-facing view for outside work you want to inspect.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-[#a8f5e9]/20 bg-[#a8f5e9]/8 px-3 py-1 text-[11px] font-medium text-[#a8f5e9]">
                Public repos only
              </span>
              <span className="rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1 text-[11px] font-medium text-sky-200">
                Not saved to a developer profile
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-white/70">
                Recent lookups stored locally
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <article className="rounded-[1.6rem] border border-white/10 bg-black/20 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#a8f5e9]/20 bg-[#a8f5e9]/10 text-[#a8f5e9]">
                <BriefcaseBusiness className="h-5 w-5" />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                Recruiter profile
              </p>
              <p className="mt-2 text-lg font-semibold text-white">{recruiterLabel}</p>
              <p className="mt-2 text-sm leading-relaxed text-white/65">
                Your recruiter workspace can inspect public repos and still jump back into your own saved candidate-proof view anytime.
              </p>
            </article>
            <article className="rounded-[1.6rem] border border-white/10 bg-black/20 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-300/20 bg-sky-300/10 text-sky-200">
                <FolderKanban className="h-5 w-5" />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                What you can do here
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/65">
                Paste a repo URL, open the recruiter result page, compare strengths and risks, then return to your own projects or recruiter decisions.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-white/10 bg-surface/45 p-5 shadow-sm backdrop-blur-xl sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a8f5e9]">
                Start a recruiter review
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Enter a public repo</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/65">
                Use this for any public GitHub repo you want to inspect for hiring. The result opens in a separate recruiter result page so it stays clean and easy to scan.
              </p>
            </div>
            <Link
              href="/dashboard/projects"
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              View my projects
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="recruiter-repo-url"
                className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55"
              >
                GitHub repository URL
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35" />
                <input
                  id="recruiter-repo-url"
                  type="url"
                  value={repoUrl}
                  onChange={(event) => setRepoUrl(event.target.value)}
                  placeholder="https://github.com/username/project"
                  className="w-full rounded-[1.15rem] border border-white/10 bg-background/55 py-3.5 pl-12 pr-4 text-sm text-white outline-none transition focus:border-[#a8f5e9]/35 focus:ring-2 focus:ring-[#a8f5e9]/15"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="recruiter-branch"
                className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55"
              >
                Branch <span className="normal-case tracking-normal text-white/35">(optional)</span>
              </label>
              <input
                id="recruiter-branch"
                type="text"
                value={branch}
                onChange={(event) => setBranch(event.target.value)}
                placeholder="main"
                className="w-full rounded-[1.15rem] border border-white/10 bg-background/55 px-4 py-3.5 text-sm text-white outline-none transition focus:border-[#a8f5e9]/35 focus:ring-2 focus:ring-[#a8f5e9]/15"
              />
            </div>

            {error ? (
              <StatePanel
                variant="error"
                title="Repo link needed"
                message={error}
              />
            ) : null}

            <button
              type="submit"
              className="group relative inline-flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-[1.2rem] border border-[#a8f5e9]/25 bg-[#a8f5e9]/12 px-5 py-3.5 text-sm font-semibold text-[#a8f5e9] transition hover:border-[#a8f5e9]/45 hover:text-[#07131a]"
            >
              <span className="absolute inset-0 bg-[linear-gradient(90deg,rgba(168,245,233,0)_0%,rgba(168,245,233,0.15)_25%,rgba(168,245,233,0.7)_50%,rgba(168,245,233,0.15)_75%,rgba(168,245,233,0)_100%)] -translate-x-full transition-transform duration-[1400ms] ease-out group-hover:translate-x-full" />
              <span className="absolute inset-0 bg-[#a8f5e9] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="relative z-10 flex items-center gap-2">
                Open recruiter result
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-white/10 bg-surface/45 p-5 shadow-sm backdrop-blur-xl sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a8f5e9]">
              Workspace snapshot
            </p>
            <div className="mt-4 grid gap-3">
              {workspaceSummary.map((item) => (
                <article
                  key={item.label}
                  className="rounded-[1.35rem] border border-white/10 bg-background/35 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <span className="text-2xl font-semibold text-[#a8f5e9]">{item.value}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{item.note}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-surface/45 p-5 shadow-sm backdrop-blur-xl sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a8f5e9]">
              How this differs from saved profile proof
            </p>
            <div className="mt-4 grid gap-3">
              <article className="rounded-[1.35rem] border border-white/10 bg-background/35 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#a8f5e9]/20 bg-[#a8f5e9]/10 text-[#a8f5e9]">
                    <Eye className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Public screening</p>
                    <p className="text-sm text-white/60">Works for any public repo.</p>
                  </div>
                </div>
              </article>
              <article className="rounded-[1.35rem] border border-white/10 bg-background/35 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-300/20 bg-sky-300/10 text-sky-200">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">No profile attachment</p>
                    <p className="text-sm text-white/60">It does not alter anyone’s saved profile.</p>
                  </div>
                </div>
              </article>
              <article className="rounded-[1.35rem] border border-white/10 bg-background/35 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-300/10 text-amber-200">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Recruiter-ready result</p>
                    <p className="text-sm text-white/60">The next page shows a neat screening summary.</p>
                  </div>
                </div>
              </article>
            </div>
          </section>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-surface/45 p-5 shadow-sm backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a8f5e9]">
              Recent public repo lookups
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Open a recent search again</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/65">
              If you check the same repo again, it stays listed here for quick recruiter follow-up.
            </p>
          </div>
        </div>

        <div className="mt-5">
          {hasRecentSearches ? (
            <div className="grid gap-3">
              {recentSearches.map((entry) => (
                <button
                  key={`${entry.repoUrl}-${entry.branch}`}
                  type="button"
                  onClick={() => openRepoResult(entry.repoUrl, entry.branch)}
                  className="flex cursor-pointer flex-col gap-3 rounded-[1.35rem] border border-white/10 bg-background/35 p-4 text-left transition hover:border-[#a8f5e9]/30 hover:bg-background/55 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{entry.repoLabel}</p>
                    <p className="mt-1 truncate text-xs text-white/45">{entry.repoUrl}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70">
                      {entry.branch || "default branch"}
                    </span>
                    <span className="rounded-full border border-[#a8f5e9]/20 bg-[#a8f5e9]/10 px-3 py-1 text-[#a8f5e9]">
                      {formatViewedAt(entry.lastViewedAt)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <EmptyStateCard
              compact
              title="No recent recruiter searches yet"
              message="Your public-repo lookups will appear here after the first recruiter screening run."
            />
          )}
        </div>
      </section>
    </div>
  );
}
