"use client";

import Link from "next/link";
import { useEffect, useState, startTransition } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Code2,
  GitBranch,
  Radar,
  Trash2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import EmptyStateCard from "@/components/EmptyStateCard";
import StatePanel from "@/components/StatePanel";
import { formatRelativeDate, formatShortDate } from "@/lib/formatting";
import { statusTone } from "@/lib/status";
import { createClient } from "@/utils/supabase/client";
import { buildSkillchainApiUrl } from "@/lib/skillchain-api";
import { resolveCertificateVerification } from "@/lib/certificate-verification";
import { getErrorMessage } from "@/lib/user-facing-errors";
import type { ProjectRecord as DashboardProjectRecord } from "@/lib/dashboard-data";

type MetricRecord = {
  files: number | null;
  test_ratio: number | null;
  raw_metrics_json?: {
    fileStats?: {
      totalFiles?: number;
      sourceFiles?: number;
      testFiles?: number;
      docsFiles?: number;
      backendFiles?: number;
      frontendFiles?: number;
    };
    summary?: string;
  } | null;
};

type ScoreRecord = {
  backend_score: number | null;
  architecture_score: number | null;
  documentation_score: number | null;
  confidence_score: number | null;
  explanation: string | null;
};

type CertificateRecord = {
  id: string;
  status: string | null;
  verification_status?: string | null;
  created_at: string | null;
};

type AnalysisJobRecord = {
  id: string;
  job_type: string;
  status: string;
  started_at: string | null;
  finished_at: string | null;
  error_message: string | null;
};

type ProjectRecord = {
  id: string;
  repo_name: string;
  repo_url: string;
  analysis_status: string;
  default_branch: string | null;
  created_at: string;
  last_analyzed_at: string | null;
  analysis_error: string | null;
  metrics?: MetricRecord[];
  scores?: ScoreRecord[];
  certificates?: CertificateRecord[];
  analysis_jobs?: AnalysisJobRecord[];
};

type DashboardClientProps = {
  initialProjects?: DashboardProjectRecord[];
};

function repoLabel(project: ProjectRecord) {
  if (project.repo_name?.trim()) return project.repo_name;

  try {
    const url = new URL(project.repo_url);
    return url.pathname.replace(/^\/+/, "") || project.repo_url;
  } catch {
    return project.repo_url;
  }
}

function projectStatusLabel(project: ProjectRecord) {
  switch (project.analysis_status) {
    case "completed": {
      const certificate = project.certificates?.[0];
      if (!certificate) return "Stable";

      const verification = resolveCertificateVerification(certificate, project);
      if (verification.state === "verified") return "Certificate verified";
      if (verification.state === "failed") return "Verification failed";
      return "Verification pending";
    }
    case "processing":
      return "Analyzing";
    case "failed":
      return "Needs retry";
    default:
      return "Queued";
  }
}

function firstScore(project: ProjectRecord) {
  return project.scores?.[0] ?? null;
}

function certificateVerificationState(certificate: CertificateRecord) {
  return resolveCertificateVerification(certificate).badgeLabel;
}

async function fetchProjectsClient() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Please sign in again to load dashboard projects.");
  }

  const response = await fetch(buildSkillchainApiUrl("/projects"), {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Could not load dashboard projects.");
  }

  return (result.data || []) as ProjectRecord[];
}

async function deleteProjectClient(projectId: string) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Please sign in again to remove this project.");
  }

  const response = await fetch(buildSkillchainApiUrl(`/projects/${projectId}`), {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Could not remove project.");
  }
}

export default function DashboardClient({
  initialProjects = [],
}: DashboardClientProps) {
  const hasInitialProjects = initialProjects.length > 0;
  const [projects, setProjects] = useState<ProjectRecord[]>(
    initialProjects as ProjectRecord[]
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [removingProjectId, setRemovingProjectId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingRemoval, setPendingRemoval] = useState<{
    projectId: string;
    repo: string;
  } | null>(null);

  useEffect(() => {
    let isActive = true;

    fetchProjectsClient()
      .then((data) => {
        if (!isActive) return;
        startTransition(() => {
          setProjects(data);
          setLoadError(null);
          setIsLoading(false);
        });
      })
      .catch((error) => {
        if (!isActive) return;
        startTransition(() => {
          if (!hasInitialProjects) {
            setProjects([]);
          }
          setLoadError(getErrorMessage(error, "Could not load dashboard projects."));
          setIsLoading(false);
        });
      });

    return () => {
      isActive = false;
    };
  }, [hasInitialProjects]);

  const focusProject = projects[0] ?? null;
  const focusScore = focusProject ? firstScore(focusProject) : null;

  const completedProjects = projects.filter(
    (project) => project.analysis_status === "completed"
  ).length;
  const mintedCertificates = projects.reduce(
    (count, project) => count + (project.certificates?.length || 0),
    0
  );
  const verifiedCertificates = projects.reduce(
    (count, project) =>
      count +
      (project.certificates?.filter(
        (certificate) => certificate.verification_status === "verified"
      ).length || 0),
    0
  );

  const overviewStats = [
    {
      label: "Repositories analyzed",
      value: isLoading ? "..." : String(projects.length),
      detail:
        projects.length > 0
          ? `${completedProjects} completed`
          : isLoading
            ? "Loading projects"
            : "No projects yet",
      accent: "from-emerald-400/35 to-transparent",
    },
    {
      label: "Project certificates",
      value: isLoading ? "..." : String(mintedCertificates),
      detail:
        mintedCertificates > 0
          ? `${verifiedCertificates} fully verified`
          : isLoading
            ? "Loading certificates"
            : "0 issued yet",
      accent: "from-amber-400/35 to-transparent",
    },
    {
      label: "Verified certificates",
      value: isLoading ? "..." : String(verifiedCertificates),
      detail:
        verifiedCertificates > 0
          ? `${mintedCertificates - verifiedCertificates} still pending/failed`
          : isLoading
            ? "Checking verification"
            : "No fully verified certificates yet",
      accent: "from-sky-400/35 to-transparent",
    },
  ];

  const capabilityBands = focusScore
    ? [
        { name: "Architecture", score: focusScore.architecture_score ?? 0 },
        { name: "Backend", score: focusScore.backend_score ?? 0 },
        { name: "Documentation", score: focusScore.documentation_score ?? 0 },
        { name: "Confidence", score: focusScore.confidence_score ?? 0 },
      ]
    : [
        { name: "Architecture", score: 0 },
        { name: "Backend", score: 0 },
        { name: "Documentation", score: 0 },
        { name: "Confidence", score: 0 },
      ];

  const liveProjects = projects.slice(0, 3).map((project) => {
    const score = firstScore(project);
    return {
      id: project.id,
      repo: repoLabel(project),
      branch: project.default_branch || "default",
      status: projectStatusLabel(project),
      score: score ? score.confidence_score : null,
      certificateId: project.certificates?.[0]?.id || null,
      summary:
        score?.explanation ||
        project.analysis_error ||
        formatRelativeDate(project.last_analyzed_at || project.created_at),
    };
  });

  async function removeProject(projectId: string) {
    setRemovingProjectId(projectId);
    setActionError(null);

    try {
      await deleteProjectClient(projectId);
      startTransition(() => {
        setProjects((currentProjects) =>
          currentProjects.filter((project) => project.id !== projectId)
        );
        setRemovingProjectId(null);
        setPendingRemoval(null);
      });
    } catch (error) {
      setRemovingProjectId(null);
      setActionError(
        error instanceof Error ? error.message : "Could not remove project."
      );
    }
  }

  const recentCertificates = projects
    .flatMap((project) =>
      (project.certificates || []).map((certificate) => ({
        id: certificate.id,
        projectId: project.id,
        repo: repoLabel(project),
        status:
          certificateVerificationState(certificate),
        issuedAt: formatShortDate(certificate.created_at),
      }))
    )
    .slice(0, 3);

  return (
    <main className="w-full px-4 pb-12 pt-4 sm:px-6 sm:pb-14 lg:px-8 lg:pb-16">
      <ConfirmModal
        open={Boolean(pendingRemoval)}
        title="Remove this saved repository?"
        description={
          pendingRemoval
            ? `This will remove ${pendingRemoval.repo} from your dashboard and recent repository reads.`
            : ""
        }
        detail="Its linked saved metrics, scores, jobs, and certificate records will also be deleted."
        confirmLabel="Yes, remove it"
        busy={Boolean(removingProjectId)}
        onCancel={() => setPendingRemoval(null)}
        onConfirm={() => {
          if (pendingRemoval) {
            void removeProject(pendingRemoval.projectId);
          }
        }}
      />
      <section className="relative overflow-hidden rounded-[2.5rem] border border-border/70 bg-surface/50 shadow-[0_24px_70px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.16),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(245,158,11,0.16),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.03),transparent_58%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <div className="relative grid gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:gap-8 lg:px-8 xl:grid-cols-[1.45fr_0.9fr]">
          <div className="space-y-8">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-accent">
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Command Deck
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-muted">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                {isLoading
                  ? "Loading projects"
                  : loadError
                    ? "Backend unavailable"
                    : "Live project data"}
              </span>
            </div>

            <div className="max-w-3xl space-y-4">
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Your saved project summary, in one place.
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-muted">
                Use this page to scan recent project records quickly. Open a project when you want the full analysis, certificate, or public verification record.
              </p>
              {loadError ? (
                <StatePanel
                  variant="error"
                  title="Could not refresh dashboard data"
                  message={loadError}
                  actionHref="/dashboard/submit"
                  actionLabel="Analyze a repo"
                />
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {overviewStats.map((stat) => (
                <article
                  key={stat.label}
                  className="relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-background/45 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                >
                  <div className={`absolute inset-x-0 top-0 h-20 bg-gradient-to-b ${stat.accent}`} />
                  <div className="relative">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted">{stat.label}</p>
                    <div className="mt-4 flex items-end justify-between gap-3">
                      <span className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{stat.value}</span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-muted">
                        {stat.detail}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-background/50 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                  Focus project
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                  {focusProject ? repoLabel(focusProject) : isLoading ? "Loading..." : "No project yet"}
                </h2>
                {focusProject ? (
                  <Link
                    href={`/dashboard/projects/${focusProject.id}`}
                    className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent/80"
                  >
                    Open project detail
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>
              {(() => {
                const status = focusProject
                  ? projectStatusLabel(focusProject)
                  : isLoading
                    ? "Loading"
                    : "Waiting";
                const isFinal = status === "Certificate verified" || status === "Stable";
                const isFailed = status === "Verification failed" || status === "Needs retry";
                const StatusIcon = isFinal ? CheckCircle2 : isFailed ? ShieldCheck : Clock3;

                return (
                  <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${statusTone(status, {
                    Stable: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
                    "Certificate verified": "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
                    "Verification pending": "border-[#a8f5e9]/30 bg-[#a8f5e9]/10 text-[#a8f5e9]",
                    "Verification failed": "border-red-400/20 bg-red-400/10 text-red-300",
                    Analyzing: "border-sky-400/20 bg-sky-400/10 text-sky-300",
                    "Needs retry": "border-red-400/20 bg-red-400/10 text-red-300",
                    Loading: "border-white/10 bg-white/5 text-white/75",
                    Waiting: "border-white/10 bg-white/5 text-white/75",
                  })}`}>
                    <StatusIcon className="h-3.5 w-3.5" />
                    {status}
                  </span>
                );
              })()}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-[1.5rem] border border-white/8 bg-surface/35 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Radar className="h-4 w-4 text-accent" />
                  Saved score bands
                </div>
                <div className="mt-4 space-y-3">
                  {capabilityBands.map((band) => (
                    <div key={band.name}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-muted">{band.name}</span>
                        <span className="font-semibold text-white">{band.score}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/8">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-accent via-emerald-300 to-amber-300"
                          style={{ width: `${band.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/8 bg-surface/35 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <ShieldCheck className="h-4 w-4 text-amber-300" />
                  Project note
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {focusScore?.explanation ||
                    focusProject?.analysis_error ||
                    (isLoading
                      ? "Loading saved project summary..."
                      : "Analyze a repository to populate the saved project summary here.")}
                </p>
                {focusProject?.certificates?.[0] ? (
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href={`/dashboard/certificates/${focusProject.certificates[0].id}`}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/10"
                    >
                      Open project certificate
                    </Link>
                    <Link
                      href={`/dashboard/verify/${focusProject.certificates[0].id}`}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent transition-colors hover:bg-accent/15"
                    >
                      Verify certificate
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:mt-8 lg:gap-8 xl:grid-cols-[1.3fr_0.9fr]">
        <div className="space-y-8">
          <section className="overflow-hidden rounded-[2rem] border border-border/70 bg-surface/40 shadow-sm backdrop-blur-xl">
            <div className="flex flex-col gap-4 border-b border-border/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                  Live Portfolio
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                  Recent repository reads
                </h2>
              </div>
              <Link
                href="/dashboard/submit"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Analyze new repo
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            {actionError ? (
              <div className="border-t border-border/50 px-6 py-4">
                <StatePanel
                  variant="error"
                  title="Project action failed"
                  message={actionError}
                  actionHref="/dashboard/projects"
                  actionLabel="Open projects"
                />
              </div>
            ) : null}

            <div className="divide-y divide-border/50">
              {liveProjects.length ? (
                liveProjects.map((project) => (
                  <article
                    key={project.id}
                    className="grid gap-4 px-4 py-5 sm:px-6 md:grid-cols-[1.2fr_0.7fr_160px] md:gap-5"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          href={`/dashboard/projects/${project.id}`}
                          className="text-lg font-semibold text-white transition-colors hover:text-accent"
                        >
                          {project.repo}
                        </Link>
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-muted">
                          {project.branch}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setPendingRemoval({
                              projectId: project.id,
                              repo: project.repo,
                            })
                          }
                          disabled={removingProjectId === project.id}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-red-200 transition-colors hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {removingProjectId === project.id ? "Removing..." : "Remove"}
                        </button>
                        {project.certificateId ? (
                          <Link
                            href={`/dashboard/certificates/${project.certificateId}`}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-white/10"
                          >
                            Project certificate
                          </Link>
                        ) : null}
                      </div>
                      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
                        {project.summary}
                      </p>
                    </div>

                    <div className="flex items-center">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${statusTone(project.status, {
                          Stable: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
                          "Certificate verified": "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
                          "Verification pending": "border-[#a8f5e9]/30 bg-[#a8f5e9]/10 text-[#a8f5e9]",
                          "Verification failed": "border-red-400/20 bg-red-400/10 text-red-300",
                          Analyzing: "border-sky-400/20 bg-sky-400/10 text-sky-300",
                          "Needs retry": "border-red-400/20 bg-red-400/10 text-red-300",
                        })}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {project.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-start md:justify-end">
                      {project.score !== null ? (
                        <div className="min-w-[120px]">
                          <p className="text-xs uppercase tracking-[0.16em] text-muted">Skill score</p>
                          <div className="mt-2 flex items-center gap-3">
                            <span className="text-2xl font-semibold text-white">{project.score}</span>
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-accent to-amber-300"
                                style={{ width: `${project.score}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="min-w-[120px] rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-muted">
                          Score pending
                        </div>
                      )}
                    </div>
                  </article>
                ))
              ) : (
                <div className="px-6 py-8">
                  <EmptyStateCard
                    compact
                    title={isLoading ? "Loading saved projects" : "No saved projects yet"}
                    message={
                      isLoading
                        ? "We are fetching your latest saved repository records."
                        : "Run your first repository analysis to populate this summary page."
                    }
                    actionHref={isLoading ? undefined : "/dashboard/submit"}
                    actionLabel={isLoading ? undefined : "Analyze a repository"}
                  />
                </div>
              )}
            </div>
          </section>

        </div>

        <aside className="space-y-8">
          <section className="rounded-[2rem] border border-border/70 bg-surface/40 p-6 shadow-sm backdrop-blur-xl">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <GitBranch className="h-4 w-4 text-accent" />
              Next actions
            </div>
            <div className="mt-5 space-y-3">
              {(projects.slice(0, 3).map((project) => ({
                key: project.id,
                text:
                  project.analysis_status === "failed"
                    ? `Retry analysis for ${repoLabel(project)} and clear the saved error state.`
                    : project.certificates?.length
                      ? `Review the saved project certificate for ${repoLabel(project)} and share its verification record when needed.`
                      : `Review ${repoLabel(project)} and confirm its saved analysis before issuing proof.`,
              })) || []).map((item) => (
                <div
                  key={item.key}
                  className="rounded-[1.3rem] border border-white/8 bg-background/35 px-4 py-3 text-sm leading-relaxed text-muted"
                >
                  {item.text}
                </div>
              ))}
              {!projects.length ? (
                <div className="rounded-[1.3rem] border border-white/8 bg-background/35 px-4 py-3 text-sm leading-relaxed text-muted">
                  {isLoading
                    ? "Loading recommended next steps."
                    : "Submit your first repository to start generating project actions."}
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-[2rem] border border-border/70 bg-surface/40 p-6 shadow-sm backdrop-blur-xl">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Code2 className="h-4 w-4 text-amber-300" />
              Certificate archive
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Certificates belong to projects first. Use this area as a quick archive when you already know which issued proof you want to open.
            </p>
            <div className="mt-5 space-y-4">
              {recentCertificates.length ? (
                recentCertificates.map((certificate) => (
                  <div
                    key={certificate.id}
                    className="rounded-[1.4rem] border border-white/8 bg-background/40 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-muted">{certificate.id}</p>
                        <Link
                          href={`/dashboard/projects/${certificate.projectId}`}
                          className="mt-1 block font-medium text-white transition-colors hover:text-accent"
                        >
                          {certificate.repo}
                        </Link>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          certificate.status === "Verified"
                            ? "bg-emerald-400/10 text-emerald-300"
                            : "bg-amber-400/10 text-amber-300"
                        }`}
                      >
                        {certificate.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-muted">Issued {certificate.issuedAt}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.4rem] border border-white/8 bg-background/40 p-4 text-sm text-muted">
                  {isLoading ? "Loading certificate records..." : "No project certificates yet."}
                </div>
              )}
            </div>
            <Link
              href="/dashboard/certificates"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent/80"
            >
              Open full certificate archive
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </section>
        </aside>
      </section>
    </main>
  );
}
