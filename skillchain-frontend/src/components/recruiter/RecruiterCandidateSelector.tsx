"use client";

import Link from "next/link";
import { ArrowUpRight, Search, UserRoundSearch } from "lucide-react";
import type { RecruiterCandidate } from "@/lib/recruiter-client-data";

type RecruiterCandidateSelectorProps = {
  candidateSearch: string;
  candidateSearchError: string | null;
  candidateResults: RecruiterCandidate[];
  activeCandidate: RecruiterCandidate;
  activeCandidateProfileHref: string | null;
  isCandidateSearchLoading: boolean;
  onSearchChange: (value: string) => void;
  onSelectCandidate: (candidate: RecruiterCandidate) => void;
};

export default function RecruiterCandidateSelector({
  candidateSearch,
  candidateSearchError,
  candidateResults,
  activeCandidate,
  activeCandidateProfileHref,
  isCandidateSearchLoading,
  onSearchChange,
  onSelectCandidate,
}: RecruiterCandidateSelectorProps) {
  return (
    <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <article className="rounded-[2rem] border border-border/70 bg-surface/40 p-6 shadow-sm backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#a8f5e9]/20 bg-[#a8f5e9]/10 text-[#a8f5e9]">
            <UserRoundSearch className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Candidate selector
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Choose whose profile to review
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
              Search a saved candidate by email or handle, then switch the recruiter
              analysis to that person&apos;s saved projects. Your own profile stays
              available as the default option.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <label
              htmlFor="candidate-search"
              className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55"
            >
              Search saved candidates
            </label>
            <div className="relative mt-2">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
              <input
                id="candidate-search"
                type="text"
                value={candidateSearch}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search by email or profile handle"
                className="w-full rounded-[1.2rem] border border-white/10 bg-background/55 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-[#a8f5e9]/35 focus:ring-2 focus:ring-[#a8f5e9]/15"
              />
            </div>
            {candidateSearchError ? (
              <p className="mt-3 text-sm text-amber-300">{candidateSearchError}</p>
            ) : null}
            <div className="mt-4 grid gap-3">
              {candidateResults.map((candidate) => (
                <article
                  key={candidate.id}
                  className={`rounded-[1.25rem] border p-4 transition ${
                    activeCandidate.id === candidate.id
                      ? "border-[#a8f5e9]/40 bg-[#a8f5e9]/10"
                      : "border-white/10 bg-background/35 hover:border-white/20 hover:bg-background/45"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {candidate.label}
                      </p>
                      <p className="mt-1 truncate text-xs text-white/45">
                        @{candidate.handle}
                        {candidate.email ? ` • ${candidate.email}` : ""}
                      </p>
                    </div>
                    {candidate.isCurrentUser ? (
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">
                        You
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70">
                      {candidate.projectCount} project{candidate.projectCount === 1 ? "" : "s"}
                    </span>
                    <span className="rounded-full border border-[#a8f5e9]/20 bg-[#a8f5e9]/10 px-3 py-1 text-[#a8f5e9]">
                      {candidate.verifiedCertificateCount} verified cert{candidate.verifiedCertificateCount === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectCandidate(candidate)}
                      className="inline-flex cursor-pointer items-center rounded-full border border-[#a8f5e9]/30 bg-[#a8f5e9]/10 px-3 py-1.5 text-xs font-semibold text-[#a8f5e9] transition hover:border-[#a8f5e9]/50 hover:bg-[#a8f5e9]/16"
                    >
                      Select candidate
                    </button>
                    {candidate.primaryCertificateId ? (
                      <Link
                        href={`/verify/profile/${candidate.primaryCertificateId}`}
                        prefetch={false}
                        className="inline-flex cursor-pointer items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
                      >
                        Public summary
                      </Link>
                    ) : null}
                  </div>
                </article>
              ))}
              {isCandidateSearchLoading ? (
                <p className="text-sm text-muted">Searching saved candidates...</p>
              ) : null}
              {!isCandidateSearchLoading && !candidateResults.length ? (
                <p className="text-sm text-muted">No saved candidates match this search yet.</p>
              ) : null}
            </div>
          </div>

          <div className="rounded-[1.25rem] border border-white/10 bg-background/35 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a8f5e9]">
              Current candidate
            </p>
            {activeCandidateProfileHref ? (
              <Link
                href={activeCandidateProfileHref}
                className="mt-2 inline-flex cursor-pointer items-center gap-2 text-xl font-semibold text-white transition hover:text-[#a8f5e9]"
              >
                {activeCandidate.label}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            ) : (
              <h3 className="mt-2 text-xl font-semibold text-white">
                {activeCandidate.label}
              </h3>
            )}
            <p className="mt-1 text-sm text-white/55">
              {activeCandidateProfileHref ? (
                <Link
                  href={activeCandidateProfileHref}
                  className="cursor-pointer transition hover:text-[#a8f5e9]"
                >
                  @{activeCandidate.handle}
                </Link>
              ) : (
                `@${activeCandidate.handle}`
              )}
              {activeCandidate.email ? ` • ${activeCandidate.email}` : ""}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70">
                {activeCandidate.projectCount} project{activeCandidate.projectCount === 1 ? "" : "s"}
              </span>
              <span className="rounded-full border border-[#a8f5e9]/20 bg-[#a8f5e9]/10 px-3 py-1 text-[#a8f5e9]">
                {activeCandidate.verifiedCertificateCount} verified cert{activeCandidate.verifiedCertificateCount === 1 ? "" : "s"}
              </span>
              {activeCandidate.isCurrentUser ? (
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70">
                  You
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}
