"use client";

import Link from "next/link";
import { useEffect, useState, startTransition } from "react";
import {
  ArrowUpRight,
  Award,
  BarChart3,
  CheckCircle2,
  Clock3,
  Code2,
  GitBranch,
  Layers3,
  Radar,
  ScanSearch,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

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

function formatRelativeDate(value: string | null) {
  if (!value) return "No activity yet";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";

  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.max(0, Math.round(diffMs / (1000 * 60 * 60)));

  if (diffHours < 1) return "Updated just now";
  if (diffHours < 24) return `Updated ${diffHours}h ago`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `Updated ${diffDays}d ago`;

  return `Updated ${date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })}`;
}

function formatDate(value: string | null) {
  if (!value) return "Unknown";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

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
    case "completed":
      return project.certificates?.length ? "Ready for cert" : "Stable";
    case "processing":
      return "Analyzing";
    case "failed":
      return "Needs retry";
    default:
      return "Queued";
  }
}

function statusTone(status: string) {
  switch (status) {
    case "Stable":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
    case "Ready for cert":
      return "border-amber-400/20 bg-amber-400/10 text-amber-300";
    case "Analyzing":
      return "border-sky-400/20 bg-sky-400/10 text-sky-300";
    case "Needs retry":
      return "border-red-400/20 bg-red-400/10 text-red-300";
    default:
      return "border-white/10 bg-white/5 text-muted";
  }
}

function average(values: Array<number | null | undefined>) {
  const valid = values.filter((value): value is number => typeof value === "number");
  if (!valid.length) return null;
  return Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length);
}

function gradeFromScore(score: number | null) {
  if (score === null) return "Pending";
  if (score >= 90) return "A";
  if (score >= 80) return "A-";
  if (score >= 70) return "B+";
  if (score >= 60) return "B";
  return "C";
}

function firstMetric(project: ProjectRecord) {
  return project.metrics?.[0] ?? null;
}

function firstScore(project: ProjectRecord) {
  return project.scores?.[0] ?? null;
}

function latestJob(project: ProjectRecord) {
  return project.analysis_jobs?.[0] ?? null;
}

async function fetchProjectsClient() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(
      `
      id,
      repo_name,
      repo_url,
      analysis_status,
      default_branch,
      created_at,
      last_analyzed_at,
      analysis_error,
      metrics (
        files,
        test_ratio,
        raw_metrics_json
      ),
      scores (
        backend_score,
        architecture_score,
        documentation_score,
        confidence_score,
        explanation
      ),
      certificates (
        id,
        status,
        created_at
      ),
      analysis_jobs (
        id,
        job_type,
        status,
        started_at,
        finished_at,
        error_message
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Could not load dashboard projects.");
  }

  return (data || []) as ProjectRecord[];
}

export default function DashboardClient() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
          setProjects([]);
          setLoadError(
            error instanceof Error
              ? error.message
              : "Could not load dashboard projects."
          );
          setIsLoading(false);
        });
      });

    return () => {
      isActive = false;
    };
  }, []);

  const focusProject = projects[0] ?? null;
  const focusScore = focusProject ? firstScore(focusProject) : null;
  const focusMetric = focusProject ? firstMetric(focusProject) : null;
  const focusJob = focusProject ? latestJob(focusProject) : null;

  const completedProjects = projects.filter(
    (project) => project.analysis_status === "completed"
  ).length;
  const activeQueue = projects.filter((project) =>
    project.analysis_jobs?.some((job) => job.status === "running")
  ).length;
  const mintedCertificates = projects.reduce(
    (count, project) => count + (project.certificates?.length || 0),
    0
  );
  const verifiedCertificates = projects.reduce(
    (count, project) =>
      count +
      (project.certificates?.filter(
        (certificate) => certificate.status === "verified"
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
      label: "Certificates minted",
      value: isLoading ? "..." : String(mintedCertificates),
      detail:
        mintedCertificates > 0
          ? `${verifiedCertificates} verified on-chain`
          : isLoading
            ? "Loading certificates"
            : "0 ready yet",
      accent: "from-amber-400/35 to-transparent",
    },
    {
      label: "Active queue",
      value: isLoading ? "..." : String(activeQueue),
      detail:
        activeQueue > 0
          ? `${activeQueue} scan in progress`
          : isLoading
            ? "Checking queue"
            : "No active scans",
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
      summary:
        score?.explanation ||
        project.analysis_error ||
        formatRelativeDate(project.last_analyzed_at || project.created_at),
    };
  });

  const queue = focusProject?.analysis_jobs?.length
    ? focusProject.analysis_jobs.map((job) => ({
        step: job.job_type.replace(/_/g, " "),
        state: job.status,
        note:
          job.error_message ||
          (job.status === "completed"
            ? "The saved project analysis finished successfully."
            : job.status === "running"
              ? "Analysis is still running for this repository."
              : "This job is waiting for the next processing step."),
      }))
    : [
        {
          step: "repository analysis",
          state: projects.length ? "Waiting" : isLoading ? "Loading" : "No jobs yet",
          note: projects.length
            ? "This project has no visible job history yet."
            : isLoading
              ? "Loading saved analysis jobs."
              : "Analyze a repository to populate the queue state.",
        },
      ];

  const recentCertificates = projects
    .flatMap((project) =>
      (project.certificates || []).map((certificate) => ({
        id: certificate.id,
        projectId: project.id,
        repo: repoLabel(project),
        status:
          certificate.status === "verified"
            ? "Verified"
            : certificate.status === "pending"
              ? "Pending"
              : certificate.status || "Pending",
        issuedAt: formatDate(certificate.created_at),
      }))
    )
    .slice(0, 3);

  const architectureAverage = average(
    projects.map((project) => firstScore(project)?.architecture_score)
  );
  const confidenceAverage = average(
    projects.map((project) => firstScore(project)?.confidence_score)
  );

  return (
    <main className="w-full px-4 pb-12 pt-4 sm:px-6 sm:pb-14 lg:px-8 lg:pb-16">
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
                  ? "Loading portfolio"
                  : loadError
                    ? "Backend unavailable"
                    : "Live project data"}
              </span>
            </div>

            <div className="max-w-3xl space-y-4">
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Your repo intelligence, arranged like a real control room.
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-muted">
                Track what is cert-ready, what still needs stronger evidence, and where the current scan queue is spending its time.
              </p>
              {loadError ? (
                <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {loadError}
                </p>
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
                  Focus repo
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
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${statusTone(focusProject ? projectStatusLabel(focusProject) : "Queued")}`}>
                <Clock3 className="h-3.5 w-3.5" />
                {focusProject ? projectStatusLabel(focusProject) : isLoading ? "Loading" : "Waiting"}
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-[1.5rem] border border-white/8 bg-surface/35 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Radar className="h-4 w-4 text-accent" />
                  Evidence bands
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
                  Scan note
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {focusJob?.error_message ||
                    focusScore?.explanation ||
                    focusMetric?.raw_metrics_json?.summary ||
                    focusProject?.analysis_error ||
                    (isLoading
                      ? "Loading saved score summary..."
                      : "Analyze a repository to populate the saved score summary here.")}
                </p>
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
                href="/submit"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Analyze new repo
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

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
                      </div>
                      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
                        {project.summary}
                      </p>
                    </div>

                    <div className="flex items-center">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${statusTone(project.status)}`}
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
                <div className="px-6 py-8 text-sm text-muted">
                  {isLoading
                    ? "Loading saved projects..."
                    : "No saved projects yet. Run your first repository analysis to populate the dashboard."}
                </div>
              )}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[2rem] border border-border/70 bg-surface/40 p-6 shadow-sm backdrop-blur-xl">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <ScanSearch className="h-4 w-4 text-accent" />
                Queue state
              </div>
              <div className="mt-5 space-y-4">
                {queue.map((item) => (
                  <div key={`${item.step}-${item.state}`} className="rounded-[1.35rem] border border-white/8 bg-background/40 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-medium capitalize text-white">{item.step}</p>
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                        {item.state}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{item.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-border/70 bg-surface/40 p-6 shadow-sm backdrop-blur-xl">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <BarChart3 className="h-4 w-4 text-amber-300" />
                Recruiter-facing posture
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.4rem] border border-white/8 bg-background/40 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <Layers3 className="h-4 w-4 text-accent" />
                    Architecture consistency
                  </div>
                  <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
                    {gradeFromScore(architectureAverage)}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {architectureAverage !== null
                      ? `Average architecture score across saved projects is ${architectureAverage}, giving recruiters a clearer picture of system design consistency.`
                      : "Architecture scoring will appear here once projects are analyzed and saved."}
                  </p>
                </div>
                <div className="rounded-[1.4rem] border border-white/8 bg-background/40 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <Award className="h-4 w-4 text-amber-300" />
                    Verification readiness
                  </div>
                  <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
                    {confidenceAverage !== null ? `${confidenceAverage}%` : "0%"}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {confidenceAverage !== null
                      ? "This reflects how ready the saved portfolio is for recruiter-facing proof and public verification."
                      : "Run an analysis to start building a recruiter-facing readiness score."}
                  </p>
                </div>
              </div>
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
                      ? `Open certificate flow for ${repoLabel(project)} once verification is ready.`
                      : `Review ${repoLabel(project)} and decide whether to generate a certificate next.`,
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
              Recent certificates
            </div>
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
                  {isLoading ? "Loading certificate records..." : "No certificate records yet."}
                </div>
              )}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
