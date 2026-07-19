"use client";

import Link from "next/link";
import { useEffect, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Search,
  ShieldCheck,
  UserRoundSearch,
} from "lucide-react";
import EmptyStateCard from "@/components/EmptyStateCard";
import StatePanel from "@/components/StatePanel";
import { buildSkillchainApiUrl } from "@/lib/skillchain-api";
import { createClient } from "@/utils/supabase/client";

type RecruiterCandidate = {
  id: string;
  email: string | null;
  handle: string;
  label: string;
  projectCount: number;
  verifiedCertificateCount: number;
  primaryCertificateId?: string | null;
  isCurrentUser?: boolean;
};

async function searchCandidates(searchTerm: string, signal?: AbortSignal) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Please sign in again to search candidate profiles.");
  }

  const params = new URLSearchParams();
  if (searchTerm.trim()) params.set("search", searchTerm.trim());
  params.set("limit", "10");

  const response = await fetch(
    buildSkillchainApiUrl(`/projects/recruiter/candidates?${params.toString()}`),
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      cache: "no-store",
      signal,
    }
  );
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Could not search candidate profiles.");
  }

  return (result.data || []) as RecruiterCandidate[];
}

export default function RecruiterSearchClient({ viewerId }: { viewerId: string }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [candidates, setCandidates] = useState<RecruiterCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      setIsLoading(true);
      searchCandidates(searchTerm, controller.signal)
        .then((data) => {
          if (!isActive) return;
          startTransition(() => {
            setCandidates(
              data.map((candidate) => ({
                ...candidate,
                isCurrentUser: candidate.id === viewerId,
              }))
            );
            setError(null);
            setIsLoading(false);
          });
        })
        .catch((caughtError) => {
          if (caughtError instanceof DOMException && caughtError.name === "AbortError") return;
          if (!isActive) return;
          startTransition(() => {
            setCandidates([]);
            setError(
              caughtError instanceof Error
                ? caughtError.message
                : "Could not search candidates."
            );
            setIsLoading(false);
          });
        });
    }, 250);

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [searchTerm, viewerId]);

  return (
    <main className="w-full px-4 pb-12 pt-4 sm:px-6 sm:pb-14 lg:px-8 lg:pb-16">
      <section className="space-y-6">
        <header className="rounded-[1rem] border border-border/70 bg-surface/45 p-6 shadow-sm backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-[#a8f5e9]/20 bg-[#a8f5e9]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#a8f5e9]">
                <UserRoundSearch className="h-4 w-4" />
                Candidate Search
              </p>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Search saved candidate profiles
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
                Choose a saved developer profile first, then open a focused recruiter review page with that person’s projects, role fit, strengths, risks, and decision controls.
              </p>
            </div>
            <Link
              href="/dashboard/recruiter/candidate?id=me"
              prefetch={false}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <BriefcaseBusiness className="h-4 w-4" />
              Review my profile
            </Link>
          </div>
        </header>

        <section className="rounded-[1rem] border border-white/10 bg-surface/40 p-5 shadow-sm backdrop-blur-xl sm:p-6">
          <label
            htmlFor="recruiter-candidate-search"
            className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55"
          >
            Search by email or handle
          </label>
          <div className="relative mt-2">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <input
              id="recruiter-candidate-search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="aaryangupta2005, email, or profile handle"
              className="w-full rounded-[0.9rem] border border-white/10 bg-background/55 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-[#a8f5e9]/35 focus:ring-2 focus:ring-[#a8f5e9]/15"
            />
          </div>

          {error ? (
            <StatePanel
              variant="error"
              title="Candidate search failed"
              message={error}
              className="mt-4"
            />
          ) : null}

          <div className="mt-5 grid gap-3">
            {candidates.map((candidate) => {
              const candidateHref = `/dashboard/recruiter/candidate?id=${candidate.id}`;

              return (
              <article
                key={candidate.id}
                className="group rounded-[0.9rem] border border-white/10 bg-background/35 p-4 transition hover:border-[#a8f5e9]/35 hover:bg-background/45"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-lg font-semibold text-white">
                        {candidate.label}
                      </h2>
                      {candidate.isCurrentUser ? (
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">
                          You
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 truncate text-sm text-white/50">
                      @{candidate.handle}
                      {candidate.email ? ` • ${candidate.email}` : ""}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70">
                        {candidate.projectCount} project{candidate.projectCount === 1 ? "" : "s"}
                      </span>
                      <span className="rounded-full border border-[#a8f5e9]/20 bg-[#a8f5e9]/10 px-3 py-1 text-[#a8f5e9]">
                        {candidate.verifiedCertificateCount} verified cert{candidate.verifiedCertificateCount === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {candidate.primaryCertificateId ? (
                      <Link
                        href={`/verify/profile/${candidate.primaryCertificateId}`}
                        prefetch={false}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                      >
                        Public summary
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => router.push(candidateHref)}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#a8f5e9]/30 bg-[#a8f5e9]/10 px-4 py-2 text-sm font-semibold text-[#a8f5e9] transition hover:border-[#a8f5e9]/50 hover:bg-[#a8f5e9]/16 focus:outline-none focus:ring-2 focus:ring-[#a8f5e9]/20"
                    >
                      Open profile
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              </article>
              );
            })}

            {isLoading ? (
              <p className="text-sm text-muted">Searching saved candidates...</p>
            ) : null}

            {!isLoading && !candidates.length ? (
              <EmptyStateCard
                compact
                icon={ShieldCheck}
                title="No saved candidates found"
                message="Only SkillChain users with saved analyzed projects appear here. Public-only repo checks stay in Public Repo Search."
              />
            ) : null}
          </div>
        </section>
      </section>
    </main>
  );
}
