"use client";

import Link from "next/link";
import { useEffect, useState, startTransition } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  Fingerprint,
  ListChecks,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import EmptyStateCard from "@/components/EmptyStateCard";
import RecruiterCandidateSelector from "@/components/recruiter/RecruiterCandidateSelector";
import StatePanel from "@/components/StatePanel";
import {
  resolveCertificateVerification,
  type CertificateVerificationView,
} from "@/lib/certificate-verification";
import type { ProjectRecord as DashboardProjectRecord } from "@/lib/dashboard-data";
import { averageNumbers } from "@/lib/formatting";
import {
  type CandidateDecisionEntry,
  type CandidateReviewStatus,
  readStoredDecisionBoard,
  writeStoredDecisionBoard,
} from "@/lib/recruiter-board";
import {
  assessRoleFit,
  createCustomRecruiterRole,
  recruiterRolePresets,
} from "@/lib/recruiter-fit";
import {
  aggregateCounts,
  fetchProjectsClient,
  isRecruiterReadyProject,
  repoLabel,
  scoreAverage,
  searchCandidatesClient,
  type RecruiterCandidate,
} from "@/lib/recruiter-client-data";
import { getErrorMessage } from "@/lib/user-facing-errors";

type RecruiterClientProps = {
  initialProjects?: DashboardProjectRecord[];
  viewerId: string;
  viewerLabel: string;
  candidateId?: string;
  showCandidateSelector?: boolean;
};

type RecruiterProjectFitCard = {
  project: DashboardProjectRecord;
  score: number;
  verification: CertificateVerificationView | null;
  matchedSignals: string[];
  missingSignals: string[];
  recommendation: "Strong fit" | "Possible fit" | "Weak fit";
};

export default function RecruiterClient({
  initialProjects = [],
  viewerId,
  viewerLabel,
  candidateId,
  showCandidateSelector = true,
}: RecruiterClientProps) {
  const hasInitialProjects = initialProjects.length > 0;
  const [projects, setProjects] = useState<DashboardProjectRecord[]>(initialProjects);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!hasInitialProjects);
  const [activeCandidate, setActiveCandidate] = useState<RecruiterCandidate>({
    id: candidateId || viewerId,
    label: viewerLabel,
    handle: viewerLabel.toLowerCase().replace(/\s+/g, "-"),
    email: null,
    projectCount: initialProjects.length,
    verifiedCertificateCount: 0,
    isCurrentUser: (candidateId || viewerId) === viewerId,
  });
  const [candidateSearch, setCandidateSearch] = useState("");
  const [candidateResults, setCandidateResults] = useState<RecruiterCandidate[]>([]);
  const [isCandidateSearchLoading, setIsCandidateSearchLoading] = useState(false);
  const [candidateSearchError, setCandidateSearchError] = useState<string | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState(recruiterRolePresets[0].id);
  const [customRoleInput, setCustomRoleInput] = useState("");
  const [customRoleError, setCustomRoleError] = useState<string | null>(null);
  const [decisionSelection, setDecisionSelection] =
    useState<CandidateReviewStatus>("pending");
  const [decisionBoard, setDecisionBoard] =
    useState<CandidateDecisionEntry[]>(() => readStoredDecisionBoard(viewerId));

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    fetchProjectsClient(activeCandidate.id, controller.signal)
      .then((data) => {
        if (!isActive) return;
        startTransition(() => {
          setProjects(data.projects || []);
          if (data.candidate) {
            setActiveCandidate((current) => ({
              ...current,
              ...data.candidate,
              isCurrentUser: data.candidate.id === viewerId,
            }));
          }
          setLoadError(null);
          setIsLoading(false);
        });
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (!isActive) return;
        startTransition(() => {
          if (!hasInitialProjects) {
            setProjects([]);
          }
          setLoadError(getErrorMessage(error, "Could not load recruiter view data."));
          setIsLoading(false);
        });
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [activeCandidate.id, hasInitialProjects, viewerId]);

  useEffect(() => {
    if (!showCandidateSelector) return;

    let isActive = true;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      setIsCandidateSearchLoading(true);
      searchCandidatesClient(candidateSearch, controller.signal)
        .then((data) => {
          if (!isActive) return;
          startTransition(() => {
            setCandidateResults(
              data.map((item) => ({
                ...item,
                isCurrentUser: item.id === viewerId,
              }))
            );
            setCandidateSearchError(null);
            setIsCandidateSearchLoading(false);
          });
        })
        .catch((error) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          if (!isActive) return;
          startTransition(() => {
            setCandidateResults([]);
            setCandidateSearchError(getErrorMessage(error, "Could not search candidate profiles."));
            setIsCandidateSearchLoading(false);
          });
        });
    }, 250);

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [candidateSearch, showCandidateSelector, viewerId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    writeStoredDecisionBoard(decisionBoard, viewerId);
  }, [decisionBoard, viewerId]);

  const recruiterReadyProjects = projects.filter(isRecruiterReadyProject);
  const customRole = createCustomRecruiterRole(customRoleInput);
  const availableRoles = customRole
    ? [...recruiterRolePresets, customRole]
    : recruiterRolePresets;
  const roleAssessments = availableRoles
    .map((role) => assessRoleFit(recruiterReadyProjects, role))
    .sort((a, b) => {
      if (b.overallScore !== a.overallScore) {
        return b.overallScore - a.overallScore;
      }
      return b.verifiedProjectCount - a.verifiedProjectCount;
    });
  const autoFitRole = roleAssessments[0]?.role || availableRoles[0] || recruiterRolePresets[0];
  const selectedRole =
    availableRoles.find((role) => role.id === selectedRoleId) ||
    availableRoles[0] ||
    recruiterRolePresets[0];
  const selectedAssessment =
    roleAssessments.find((assessment) => assessment.role.id === selectedRole.id) ||
    assessRoleFit(recruiterReadyProjects, selectedRole);
  const allCertificates = recruiterReadyProjects.flatMap(
    (project) => project.certificates || []
  );
  const verifiedCertificates = recruiterReadyProjects.flatMap((project) =>
    (project.certificates || [])
      .filter(
        (certificate) =>
          resolveCertificateVerification(certificate, project).state === "verified"
      )
      .map((certificate) => ({ certificate, project }))
  );

  const topProjects = recruiterReadyProjects
    .map((project) => ({
      project,
      score: scoreAverage(project),
      verification: project.certificates?.[0]
        ? resolveCertificateVerification(project.certificates[0], project)
        : null,
    }))
    .sort((a, b) => {
      const verifiedBoostA = a.verification?.state === "verified" ? 1 : 0;
      const verifiedBoostB = b.verification?.state === "verified" ? 1 : 0;
      if (verifiedBoostA !== verifiedBoostB) return verifiedBoostB - verifiedBoostA;
      return b.score - a.score;
    })
    .slice(0, 4);
  const bestProjectCards: RecruiterProjectFitCard[] = (
    selectedAssessment.bestProjects.length
      ? selectedAssessment.bestProjects.map((fit) => ({
          ...fit,
          verification: fit.project.certificates?.[0]
            ? resolveCertificateVerification(fit.project.certificates[0], fit.project)
            : null,
        }))
      : topProjects.map(({ project, score, verification }) => ({
          project,
          score,
          verification,
          matchedSignals: [],
          missingSignals: [],
          recommendation: "Possible fit",
        }))
  );

  const allStrengths = recruiterReadyProjects.flatMap(
    (project) => project.scores?.[0]?.score_breakdown_json?.strengths || []
  );
  const allRisks = recruiterReadyProjects.flatMap(
    (project) => project.scores?.[0]?.score_breakdown_json?.risks || []
  );
  const allSkills = recruiterReadyProjects.flatMap((project) => [
    ...(project.metrics?.[0]?.raw_metrics_json?.frameworks || []),
    ...(project.scores?.[0]?.score_breakdown_json?.skillEvidence || []),
  ]);

  const topStrengths = aggregateCounts(allStrengths).slice(0, 5);
  const topRisks = aggregateCounts(allRisks).slice(0, 4);
  const topSkills = aggregateCounts(allSkills).slice(0, 6);

  const backendCoverage = recruiterReadyProjects.filter(
    (project) => (project.scores?.[0]?.backend_score || 0) >= 65
  ).length;
  const frontendCoverage = recruiterReadyProjects.filter(
    (project) => (project.scores?.[0]?.score_breakdown_json?.frontend || 0) >= 65
  ).length;
  const architectureCoverage = recruiterReadyProjects.filter(
    (project) => (project.scores?.[0]?.architecture_score || 0) >= 65
  ).length;

  const candidateFit = [
    {
      label: "Backend-heavy fit",
      score:
        recruiterReadyProjects.length > 0
          ? Math.round((backendCoverage / recruiterReadyProjects.length) * 100)
          : 0,
      note: "Based on how many saved projects show strong backend evidence.",
    },
    {
      label: "Frontend-heavy fit",
      score:
        recruiterReadyProjects.length > 0
          ? Math.round((frontendCoverage / recruiterReadyProjects.length) * 100)
          : 0,
      note: "Based on how many saved projects show strong frontend evidence.",
    },
    {
      label: "Architecture fit",
      score:
        recruiterReadyProjects.length > 0
          ? Math.round((architectureCoverage / recruiterReadyProjects.length) * 100)
          : 0,
      note: "Based on architecture scoring across saved projects.",
    },
  ];

  const overallConfidence =
    averageNumbers(
      recruiterReadyProjects.map((project) => project.scores?.[0]?.confidence_score)
    ) ?? 0;
  const overallArchitecture =
    averageNumbers(
      recruiterReadyProjects.map((project) => project.scores?.[0]?.architecture_score)
    ) ?? 0;
  const verifiedRate =
    allCertificates.length > 0
      ? Math.round((verifiedCertificates.length / allCertificates.length) * 100)
      : 0;

  function applyCustomRole() {
    if (!customRoleInput.trim()) {
      setCustomRoleError("Write a job or role description first.");
      return;
    }

    if (!customRole) {
      setCustomRoleError("Add clearer skill words so the recruiter role can be derived.");
      return;
    }

    setCustomRoleError(null);
    setSelectedRoleId(customRole.id);
  }

  function confirmDecision() {
    const nextEntry: CandidateDecisionEntry = {
      id: activeCandidate.id,
      recruiterId: viewerId,
      label: activeCandidate.label,
      status: decisionSelection,
      roleLabel: selectedRole.label,
      desiredRole: selectedRole.label,
      score: selectedAssessment.overallScore,
      updatedAt: new Date().toISOString(),
    };

    setDecisionBoard((current) => {
      const remaining = current.filter((item) => item.id !== activeCandidate.id);
      return [nextEntry, ...remaining];
    });
  }

  const currentCandidateDecision =
    decisionBoard.find((item) => item.id === activeCandidate.id) || null;
  const activeCandidateProfileHref = activeCandidate.primaryCertificateId
    ? `/verify/profile/${activeCandidate.primaryCertificateId}`
    : null;

  return (
    <main className="w-full px-4 pb-12 pt-4 sm:px-6 sm:pb-14 lg:px-8 lg:pb-16">
      <section className="space-y-8">
        <header className="rounded-[2.5rem] border border-border/70 bg-surface/50 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.18)] backdrop-blur-2xl sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-accent">
                <BriefcaseBusiness className="h-4 w-4" />
                Recruiter Workspace
              </p>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {activeCandidate.label} recruiter review
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
                This view compresses the saved proof system into recruiter-ready signals: best verified work, role fit, strengths, risks, and trust indicators.
              </p>
            </div>
            <div className="rounded-[1.6rem] border border-white/10 bg-background/45 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Hiring summary
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/85">
                {verifiedCertificates.length
                  ? "Verified project proof exists. Review the top projects below before making a decision."
                  : "Saved project proof exists, but no certificate is fully verified yet. Use this page cautiously until at least one certificate is verified."}
              </p>
            </div>
          </div>
        </header>

        {showCandidateSelector ? (
          <RecruiterCandidateSelector
            candidateSearch={candidateSearch}
            candidateSearchError={candidateSearchError}
            candidateResults={candidateResults}
            activeCandidate={activeCandidate}
            activeCandidateProfileHref={activeCandidateProfileHref}
            isCandidateSearchLoading={isCandidateSearchLoading}
            onSearchChange={setCandidateSearch}
            onSelectCandidate={setActiveCandidate}
          />
        ) : (
          <section className="rounded-[1rem] border border-white/10 bg-surface/40 p-4 shadow-sm backdrop-blur-xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a8f5e9]">
                  Candidate
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <p className="text-xl font-semibold text-white">{activeCandidate.label}</p>
                  <span className="text-sm text-white/50">
                    @{activeCandidate.handle}
                    {activeCandidate.email ? ` • ${activeCandidate.email}` : ""}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
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
                <Link
                  href="/dashboard/recruiter/search"
                  className="inline-flex cursor-pointer items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 font-semibold text-white transition hover:bg-white/10"
                >
                  Change candidate
                </Link>
              </div>
            </div>
          </section>
        )}

        {loadError ? (
          <StatePanel
            variant="warning"
            title="Recruiter data did not load fully"
            message={`${loadError} The summary below may be incomplete until the saved project data loads successfully.`}
          />
        ) : null}

        {!isLoading && !recruiterReadyProjects.length ? (
          <EmptyStateCard
            title="No recruiter-ready project proof yet"
            message={`${activeCandidate.label} does not have saved recruiter-ready project proof yet. Verified projects, strengths, risks, and fit signals will appear here after that.`}
            actionHref="/dashboard/submit"
            actionLabel="Analyze a repository"
          />
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Saved proof records",
                  value: isLoading ? "..." : String(recruiterReadyProjects.length),
                  note: "Repositories with saved analysis, evidence, or certificates.",
                  icon: Sparkles,
                },
                {
                  label: "Verified proof rate",
                  value: isLoading ? "..." : `${verifiedRate}%`,
                  note: `${verifiedCertificates.length} of ${allCertificates.length} certificates are fully verified.`,
                  icon: ShieldCheck,
                },
                {
                  label: "Average confidence",
                  value: isLoading ? "..." : `${overallConfidence}%`,
                  note: "Average saved confidence score across recruiter-ready repositories.",
                  icon: TrendingUp,
                },
                {
                  label: "Architecture signal",
                  value: isLoading ? "..." : `${overallArchitecture}%`,
                  note: "Average architecture score across recruiter-ready repositories.",
                  icon: Fingerprint,
                },
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <article
                    key={card.label}
                    className="rounded-[1.8rem] border border-white/10 bg-surface/40 p-5 shadow-sm backdrop-blur-xl"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-accent">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                      {card.label}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-white">{card.value}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{card.note}</p>
                  </article>
                );
              })}
            </section>

            <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
              <article className="rounded-[2rem] border border-border/70 bg-surface/40 p-6 shadow-sm backdrop-blur-xl">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                      Role Matching
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      Choose the hiring target
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      The page compares saved proof against role signals, score patterns, and repeated implementation evidence.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedRoleId(autoFitRole.id)}
                    className="cursor-pointer rounded-full border border-[#a8f5e9]/30 bg-[#a8f5e9]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#a8f5e9] transition hover:border-[#a8f5e9]/50 hover:bg-[#a8f5e9]/16"
                  >
                    Auto-fit: {autoFitRole.label}
                  </button>
                </div>

                <div className="mt-5 grid gap-3">
                  <div className="rounded-[1.4rem] border border-white/10 bg-background/35 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      <FileSearch className="h-4 w-4 text-accent" />
                      Custom job or role input
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      Paste a hiring brief like `Need a full-stack engineer with React, Supabase, auth, API, and deployment experience`.
                    </p>
                    <textarea
                      value={customRoleInput}
                      onChange={(event) => {
                        setCustomRoleInput(event.target.value);
                        if (customRoleError) {
                          setCustomRoleError(null);
                        }
                      }}
                      placeholder="Write the role, stack, and what the recruiter needs."
                      className="mt-4 min-h-28 w-full rounded-[1.2rem] border border-white/10 bg-background/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#a8f5e9]/40"
                    />
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={applyCustomRole}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#a8f5e9]/30 bg-[#a8f5e9]/10 px-4 py-2 text-sm font-semibold text-[#a8f5e9] transition hover:border-[#a8f5e9]/50 hover:bg-[#a8f5e9]/16"
                      >
                        <ClipboardCheck className="h-4 w-4" />
                        Apply custom role
                      </button>
                      {customRole ? (
                        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
                          Custom role ready
                        </span>
                      ) : null}
                    </div>
                    {customRoleError ? (
                      <p className="mt-3 text-sm text-amber-300">{customRoleError}</p>
                    ) : null}
                  </div>

                  {recruiterRolePresets.map((role) => {
                    const isActive = role.id === selectedRoleId;
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setSelectedRoleId(role.id)}
                        className={`cursor-pointer rounded-[1.4rem] border p-4 text-left transition ${
                          isActive
                            ? "border-[#a8f5e9]/45 bg-[#a8f5e9]/10 shadow-[0_0_0_1px_rgba(168,245,233,0.12)]"
                            : "border-white/10 bg-background/35 hover:border-white/20 hover:bg-background/45"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-white">{role.label}</p>
                            <p className="mt-1 text-sm leading-relaxed text-muted">{role.summary}</p>
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                              isActive
                                ? "bg-[#a8f5e9] text-slate-950"
                                : "border border-white/10 bg-white/5 text-white/65"
                            }`}
                          >
                            {isActive ? "Selected" : "Preset"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                  {customRole ? (
                    <button
                      type="button"
                      onClick={() => setSelectedRoleId(customRole.id)}
                      className={`cursor-pointer rounded-[1.4rem] border p-4 text-left transition ${
                        selectedRoleId === customRole.id
                          ? "border-[#a8f5e9]/45 bg-[#a8f5e9]/10 shadow-[0_0_0_1px_rgba(168,245,233,0.12)]"
                          : "border-white/10 bg-background/35 hover:border-white/20 hover:bg-background/45"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">Custom Role</p>
                          <p className="mt-1 text-sm leading-relaxed text-muted">
                            {customRole.summary}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                            selectedRoleId === customRole.id
                              ? "bg-[#a8f5e9] text-slate-950"
                              : "border border-white/10 bg-white/5 text-white/65"
                          }`}
                        >
                          {selectedRoleId === customRole.id ? "Selected" : "Custom"}
                        </span>
                      </div>
                    </button>
                  ) : null}
                </div>
              </article>

              <article className="rounded-[2rem] border border-border/70 bg-surface/40 p-6 shadow-sm backdrop-blur-xl">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                      Hiring Decision Support
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      {selectedRole.label}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
                      {selectedAssessment.recommendationNote}
                    </p>
                  </div>
                  <div className="rounded-[1.4rem] border border-[#a8f5e9]/30 bg-[#a8f5e9]/10 px-5 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a8f5e9]">
                      Match score
                    </p>
                    <p className="mt-2 text-4xl font-bold text-white">
                      {isLoading ? "..." : `${selectedAssessment.overallScore}%`}
                    </p>
                    <p className="mt-1 text-sm text-white/80">
                      {selectedAssessment.recommendation}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-3">
                  <div className="rounded-[1.4rem] border border-white/10 bg-background/35 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                      Best use
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-white/85">
                      {selectedAssessment.recommendedUseCase}
                    </p>
                  </div>
                  <div className="rounded-[1.4rem] border border-white/10 bg-background/35 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                      Verified projects
                    </p>
                    <p className="mt-3 text-3xl font-bold text-white">
                      {isLoading ? "..." : selectedAssessment.verifiedProjectCount}
                    </p>
                    <p className="mt-2 text-sm text-muted">
                      Saved projects with fully verified certificates.
                    </p>
                  </div>
                  <div className="rounded-[1.4rem] border border-white/10 bg-background/35 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                      Recommended decision
                    </p>
                    <p className="mt-3 text-lg font-semibold text-white">
                      {selectedAssessment.recommendation}
                    </p>
                    <p className="mt-2 text-sm text-muted">
                      Use with the matched signals and risks shown below.
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-background/35 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <ListChecks className="h-4 w-4 text-accent" />
                    Recruiter decision actions
                  </div>
                  <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
                    <select
                      value={decisionSelection}
                      onChange={(event) =>
                        setDecisionSelection(event.target.value as CandidateReviewStatus)
                      }
                      className="min-w-[220px] rounded-full border border-white/10 bg-background/60 px-4 py-2.5 text-sm font-semibold text-white outline-none transition focus:border-[#a8f5e9]/40"
                    >
                      <option value="pending">Pending</option>
                      <option value="selected">Selected</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="declined">Declined</option>
                    </select>
                    <button
                      type="button"
                      onClick={confirmDecision}
                      className="inline-flex cursor-pointer items-center justify-center rounded-full border border-[#a8f5e9]/30 bg-[#a8f5e9]/10 px-4 py-2.5 text-sm font-semibold text-[#a8f5e9] transition hover:border-[#a8f5e9]/50 hover:bg-[#a8f5e9]/16"
                    >
                      Confirm
                    </button>
                    {currentCandidateDecision ? (
                      <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
                        Current: {currentCandidateDecision.status}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-4 text-sm text-muted">
                    Confirm this candidate first, then open the extended recruiter board for the full decision list.
                  </p>
                </div>
                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[1.4rem] border border-white/10 bg-background/35 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
                      Matched signals
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedAssessment.matchedSignals.length ? (
                        selectedAssessment.matchedSignals.map((signal) => (
                          <span
                            key={signal}
                            className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-100"
                          >
                            {signal}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-muted">No strong role-specific signals found yet.</p>
                      )}
                    </div>
                  </div>
                  <div className="rounded-[1.4rem] border border-white/10 bg-background/35 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">
                      Missing signals
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedAssessment.missingSignals.length ? (
                        selectedAssessment.missingSignals.map((signal) => (
                          <span
                            key={signal}
                            className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-100"
                          >
                            {signal}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-muted">No major role-signal gaps detected for this preset.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[1.4rem] border border-white/10 bg-background/35 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                      Why this role fits
                    </p>
                    <ul className="mt-3 space-y-3">
                      {selectedAssessment.evidenceSummary.map((item) => (
                        <li key={item} className="text-sm leading-relaxed text-white/85">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-[1.4rem] border border-white/10 bg-background/35 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">
                      What to verify next
                    </p>
                    <ul className="mt-3 space-y-3">
                      {selectedAssessment.nextChecks.length ? (
                        selectedAssessment.nextChecks.map((item) => (
                          <li key={item} className="text-sm leading-relaxed text-white/85">
                            {item}
                          </li>
                        ))
                      ) : (
                        <li className="text-sm leading-relaxed text-white/85">
                          No major follow-up check is strongly required for this role preset right now.
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </article>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <section className="rounded-[2rem] border border-border/70 bg-surface/40 p-6 shadow-sm backdrop-blur-xl">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Best projects for {selectedRole.label}</h2>
                    <p className="mt-1 text-sm text-muted">
                      Highest-signal repositories for this selected hiring target.
                    </p>
                  </div>
                </div>
                <div className="mt-5 space-y-4">
                  {bestProjectCards.map(({ project, score, recommendation, matchedSignals, verification }) => (
                    (() => {
                      const projectCertificate = project.certificates?.[0] || null;
                      const projectHref = activeCandidate.isCurrentUser
                        ? `/dashboard/projects/${project.id}`
                        : projectCertificate?.id
                          ? `/verify/${projectCertificate.id}`
                          : project.repo_url;
                      const isExternalProjectHref = !activeCandidate.isCurrentUser && !projectCertificate?.id;

                      return (
                    <article
                      key={project.id}
                      className="rounded-[1.4rem] border border-white/10 bg-background/40 p-4"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                            {repoLabel(project)}
                          </p>
                          <h3 className="mt-2 text-lg font-semibold text-white">
                            {repoLabel(project)}
                          </h3>
                          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
                            {project.scores?.[0]?.explanation ||
                              project.metrics?.[0]?.raw_metrics_json?.summary ||
                              "Saved repository proof available."}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
                              Branch: {project.default_branch || "default"}
                            </span>
                            <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                              {verification?.badgeLabel || "Pending"}
                            </span>
                            <span className="rounded-full border border-[#a8f5e9]/20 bg-[#a8f5e9]/10 px-3 py-1 text-xs font-semibold text-[#a8f5e9]">
                              {recommendation}
                            </span>
                          </div>
                          {matchedSignals.length ? (
                            <p className="mt-3 text-xs leading-relaxed text-muted">
                              Matched: {matchedSignals.slice(0, 4).join(", ")}
                            </p>
                          ) : null}
                        </div>
                        <div className="flex flex-col items-start gap-3 lg:items-end">
                          <p className="text-3xl font-bold text-white">{score}</p>
                          <Link
                            href={projectHref}
                            target={isExternalProjectHref ? "_blank" : undefined}
                            rel={isExternalProjectHref ? "noreferrer" : undefined}
                            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                          >
                            {activeCandidate.isCurrentUser
                              ? "Review project"
                              : projectCertificate?.id
                                ? "Open proof record"
                                : "View repository"}
                            <ArrowUpRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </article>
                      );
                    })()
                  ))}
                </div>
              </section>

              <section className="space-y-6">
                <article className="rounded-[2rem] border border-border/70 bg-surface/40 p-6 shadow-sm backdrop-blur-xl">
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
                    <BadgeCheck className="h-5 w-5 text-accent" />
                    Role-fit snapshot
                  </h2>
                  <div className="mt-5 space-y-4">
                    {candidateFit.map((fit) => (
                      <div key={fit.label}>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="font-medium text-white/85">{fit.label}</span>
                          <span className="font-semibold text-white">{fit.score}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/8">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-accent via-emerald-300 to-white/80"
                            style={{ width: `${fit.score}%` }}
                          />
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-muted">{fit.note}</p>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="rounded-[2rem] border border-border/70 bg-surface/40 p-6 shadow-sm backdrop-blur-xl">
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    Common strengths
                  </h2>
                  <ul className="mt-5 space-y-3">
                    {topStrengths.length ? (
                      topStrengths.map(([item, count]) => (
                        <li
                          key={item}
                          className="rounded-[1.2rem] border border-white/8 bg-background/40 px-4 py-3 text-sm leading-relaxed text-white/85"
                        >
                          <span className="font-semibold text-white">{item}</span>
                          <span className="ml-2 text-muted">
                            Seen in {count} saved project{count === 1 ? "" : "s"}.
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-muted">
                        No repeated strengths have been saved yet.
                      </li>
                    )}
                  </ul>
                </article>

                <article className="rounded-[2rem] border border-border/70 bg-surface/40 p-6 shadow-sm backdrop-blur-xl">
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
                    <AlertTriangle className="h-5 w-5 text-amber-300" />
                    Common risks
                  </h2>
                  <ul className="mt-5 space-y-3">
                    {topRisks.length ? (
                      topRisks.map(([item, count]) => (
                        <li
                          key={item}
                          className="rounded-[1.2rem] border border-white/8 bg-background/40 px-4 py-3 text-sm leading-relaxed text-white/85"
                        >
                          <span className="font-semibold text-white">{item}</span>
                          <span className="ml-2 text-muted">
                            Seen in {count} saved project{count === 1 ? "" : "s"}.
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-muted">
                        No repeated risks have been saved yet.
                      </li>
                    )}
                  </ul>
                </article>
              </section>
            </section>

            <section className="rounded-[2rem] border border-border/70 bg-surface/40 p-6 shadow-sm backdrop-blur-xl">
              <h2 className="text-xl font-semibold text-white">Verified skill signals</h2>
              <p className="mt-2 text-sm text-muted">
                These are the most repeated saved skill signals across analyzed repositories.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {topSkills.length ? (
                  topSkills.map(([skill, count]) => (
                    <span
                      key={skill}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/90"
                    >
                      {skill} <span className="text-muted">({count})</span>
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-muted">No saved skill evidence yet.</p>
                )}
              </div>
            </section>
          </>
        )}
      </section>
    </main>
  );
}
