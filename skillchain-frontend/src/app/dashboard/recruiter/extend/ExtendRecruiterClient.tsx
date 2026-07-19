"use client";

import { useMemo, useState } from "react";
import EmptyStateCard from "@/components/EmptyStateCard";
import {
  type CandidateDecisionEntry,
  type CandidateReviewStatus,
  readStoredDecisionBoard,
  writeStoredDecisionBoard,
} from "@/lib/recruiter-board";

const statusOptions: CandidateReviewStatus[] = [
  "pending",
  "selected",
  "shortlisted",
  "declined",
];

export default function ExtendRecruiterClient({ recruiterId }: { recruiterId: string }) {
  const [decisionBoard, setDecisionBoard] =
    useState<CandidateDecisionEntry[]>(() => readStoredDecisionBoard(recruiterId));
  const [decisionFilter, setDecisionFilter] = useState<"all" | CandidateReviewStatus>("all");
  const [isEditMode, setIsEditMode] = useState(false);

  const visibleDecisionBoard = useMemo(
    () =>
      decisionBoard.filter((entry) =>
        decisionFilter === "all" ? true : entry.status === decisionFilter
      ),
    [decisionBoard, decisionFilter]
  );

  function updateEntry(
    entryId: string,
    updates: Partial<CandidateDecisionEntry>
  ) {
    setDecisionBoard((current) => {
      const next = current.map((entry) =>
        entry.id === entryId
          ? {
              ...entry,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : entry
      );
      writeStoredDecisionBoard(next, recruiterId);
      return next;
    });
  }

  if (!decisionBoard.length) {
    return (
      <EmptyStateCard
        title="No extended recruiter records yet"
        message="Confirm at least one recruiter decision from the recruiter page first. This extended board only appears after recruiter activity exists."
        actionHref="/dashboard/recruiter"
        actionLabel="Open recruiter workspace"
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-border/70 bg-surface/40 p-6 shadow-sm backdrop-blur-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              Extended Recruiter
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Recruiter candidate board</h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
              Track recruiter decisions in one clean list. Review candidate name, matched role,
              desired role, score, and current decision state.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsEditMode((value) => !value)}
            className="inline-flex cursor-pointer items-center justify-center rounded-full border border-[#a8f5e9]/30 bg-[#a8f5e9]/10 px-4 py-2.5 text-sm font-semibold text-[#a8f5e9] transition hover:border-[#a8f5e9]/50 hover:bg-[#a8f5e9]/16"
          >
            {isEditMode ? "Done Editing" : "Make Edits"}
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {(["all", ...statusOptions] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setDecisionFilter(status)}
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                decisionFilter === status
                  ? "border-[#a8f5e9]/40 bg-[#a8f5e9]/12 text-[#a8f5e9]"
                  : "border-white/10 bg-white/5 text-white/65 hover:border-white/20 hover:text-white/85"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-border/70 bg-surface/40 p-4 shadow-sm backdrop-blur-xl sm:p-6">
        <div className="grid gap-3">
          {visibleDecisionBoard.length ? (
            visibleDecisionBoard.map((entry) => (
              <article
                key={entry.id}
                className="rounded-[1.4rem] border border-white/10 bg-background/35 p-4"
              >
                <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr_0.9fr_0.8fr_0.8fr]">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                      Candidate name
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">{entry.label}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                      Role
                    </p>
                    {isEditMode ? (
                      <input
                        value={entry.roleLabel}
                        onChange={(event) =>
                          updateEntry(entry.id, { roleLabel: event.target.value })
                        }
                      className="mt-2 w-full cursor-pointer rounded-xl border border-white/10 bg-background/60 px-3 py-2 text-sm text-white outline-none focus:border-[#a8f5e9]/40"
                      />
                    ) : (
                      <p className="mt-2 text-sm text-white/90">{entry.roleLabel}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                      Desired role
                    </p>
                    {isEditMode ? (
                      <input
                        value={entry.desiredRole}
                        onChange={(event) =>
                          updateEntry(entry.id, { desiredRole: event.target.value })
                        }
                      className="mt-2 w-full cursor-pointer rounded-xl border border-white/10 bg-background/60 px-3 py-2 text-sm text-white outline-none focus:border-[#a8f5e9]/40"
                      />
                    ) : (
                      <p className="mt-2 text-sm text-white/90">{entry.desiredRole}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                      Role score
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">{entry.score}%</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                      Status
                    </p>
                    {isEditMode ? (
                      <select
                        value={entry.status}
                        onChange={(event) =>
                          updateEntry(entry.id, {
                            status: event.target.value as CandidateReviewStatus,
                          })
                        }
                        className="mt-2 w-full rounded-xl border border-white/10 bg-background/60 px-3 py-2 text-sm text-white outline-none focus:border-[#a8f5e9]/40"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="mt-2 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
                        {entry.status}
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-4 text-xs text-muted">
                  Last updated {new Date(entry.updatedAt).toLocaleDateString()}
                </p>
              </article>
            ))
          ) : (
            <p className="text-sm text-muted">
              No recruiter candidates exist for this filter yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
