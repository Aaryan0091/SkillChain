"use client";

import Link from "next/link";
import { useEffect, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowUpRight,
  Award,
  CheckCircle2,
  Clock3,
  Code2,
  ExternalLink,
  Fingerprint,
  GitBranch,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { buildSkillchainApiUrl } from "@/lib/skillchain-api";
import { createClient } from "@/utils/supabase/client";

type MetricRecord = {
  files: number | null;
  test_ratio: number | null;
  raw_metrics_json?: {
    frameworks?: string[];
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
  score_breakdown_json?: {
    frontend?: number;
    codeQuality?: number;
    security?: number;
    strengths?: string[];
    risks?: string[];
    skillEvidence?: string[];
  } | null;
};

type CertificateRecord = {
  id: string;
  status: string | null;
  verification_status?: string | null;
  created_at: string | null;
  certificate_hash?: string | null;
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

function formatDate(value: string | null) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(value: string | null) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function titleCase(value: string) {
  return value
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function statusTone(status: string) {
  switch (status) {
    case "completed":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
    case "processing":
      return "border-sky-400/20 bg-sky-400/10 text-sky-300";
    case "failed":
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

async function fetchProject(projectId: string) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Please sign in again to view this project.");
  }

  const response = await fetch(buildSkillchainApiUrl(`/projects/${projectId}`), {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    cache: "no-store",
  });

  const result = await response.json();

  if (response.status === 404) {
    return null;
  }

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Could not load project.");
  }

  return result.data as ProjectRecord;
}

export default function ProjectDetailClient({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    fetchProject(projectId)
      .then((data) => {
        if (!isActive) return;

        if (!data) {
          startTransition(() => {
            setProject(null);
            setLoadError("Project not found.");
            setIsLoading(false);
          });
          return;
        }

        startTransition(() => {
          setProject(data);
          setLoadError(null);
          setIsLoading(false);
        });
      })
      .catch((error) => {
        if (!isActive) return;

        const message =
          error instanceof Error ? error.message : "Could not load project.";

        if (message.includes("sign in again")) {
          router.replace("/login");
          return;
        }

        startTransition(() => {
          setProject(null);
          setLoadError(message);
          setIsLoading(false);
        });
      });

    return () => {
      isActive = false;
    };
  }, [projectId, router]);

  if (isLoading) {
    return (
      <main className="w-full px-4 pb-12 pt-4 sm:px-6 sm:pb-14 lg:px-8 lg:pb-16">
        <section className="overflow-hidden rounded-[2.5rem] border border-border/70 bg-surface/50 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
          <div className="animate-pulse space-y-4">
            <div className="h-5 w-40 rounded-full bg-white/10" />
            <div className="h-10 w-full max-w-2xl rounded-2xl bg-white/10" />
            <div className="h-5 w-full max-w-xl rounded-full bg-white/8" />
            <div className="grid gap-4 md:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-32 rounded-[1.5rem] bg-white/8" />
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="w-full px-4 pb-12 pt-4 sm:px-6 sm:pb-14 lg:px-8 lg:pb-16">
        <section className="rounded-[2.5rem] border border-red-500/20 bg-red-500/10 p-8 shadow-[0_24px_70px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-300">
            Project unavailable
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-white">We couldn&apos;t load this project.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-red-200/90">
            {loadError || "The requested project could not be found for your account."}
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Back to Dashboard
          </Link>
        </section>
      </main>
    );
  }

  const metric = project.metrics?.[0] ?? null;
  const score = project.scores?.[0] ?? null;
  const certificates = project.certificates || [];
  const jobs = project.analysis_jobs || [];
  const strengths = score?.score_breakdown_json?.strengths || [];
  const risks = score?.score_breakdown_json?.risks || [];
  const evidence = score?.score_breakdown_json?.skillEvidence || [];
  const frameworks = metric?.raw_metrics_json?.frameworks || [];
  const overall = average([
    score?.backend_score,
    score?.architecture_score,
    score?.documentation_score,
    score?.confidence_score,
    score?.score_breakdown_json?.frontend ?? null,
    score?.score_breakdown_json?.codeQuality ?? null,
    score?.score_breakdown_json?.security ?? null,
  ]) ?? 0;

  const scoreBands = [
    { label: "Backend", value: score?.backend_score ?? 0 },
    { label: "Architecture", value: score?.architecture_score ?? 0 },
    { label: "Documentation", value: score?.documentation_score ?? 0 },
    { label: "Confidence", value: score?.confidence_score ?? 0 },
    { label: "Frontend", value: score?.score_breakdown_json?.frontend ?? 0 },
    { label: "Code Quality", value: score?.score_breakdown_json?.codeQuality ?? 0 },
  ];

  const stats = [
    {
      label: "Files analyzed",
      value: String(metric?.raw_metrics_json?.fileStats?.totalFiles ?? metric?.files ?? 0),
      icon: Code2,
    },
    {
      label: "Source files",
      value: String(metric?.raw_metrics_json?.fileStats?.sourceFiles ?? 0),
      icon: Activity,
    },
    {
      label: "Test ratio",
      value: `${Math.round(metric?.test_ratio ?? 0)}%`,
      icon: CheckCircle2,
    },
    {
      label: "Certificates",
      value: String(certificates.length),
      icon: Fingerprint,
    },
  ];

  return (
    <main className="w-full px-4 pb-12 pt-4 sm:px-6 sm:pb-14 lg:px-8 lg:pb-16">
      <section className="relative overflow-hidden rounded-[2.5rem] border border-border/70 bg-surface/50 shadow-[0_24px_70px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.16),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(59,130,246,0.14),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.03),transparent_58%)]" />

        <div className="relative flex flex-col gap-6 px-5 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-accent">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Saved Project Record
            </span>
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 ${statusTone(project.analysis_status)}`}>
              <Clock3 className="h-3.5 w-3.5" />
              {titleCase(project.analysis_status)}
            </span>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
                  Project detail
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  {project.repo_name}
                </h1>
              </div>

              <p className="max-w-2xl text-base leading-relaxed text-muted">
                {score?.explanation ||
                  metric?.raw_metrics_json?.summary ||
                  project.analysis_error ||
                  "This repository has been saved and can now feed certificates and public verification."}
              </p>

              <div className="flex flex-wrap gap-3 text-sm text-muted">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  <GitBranch className="h-4 w-4 text-accent" />
                  {project.default_branch || "default branch"}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  <Clock3 className="h-4 w-4 text-accent" />
                  Last analyzed {formatDate(project.last_analyzed_at || project.created_at)}
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href={project.repo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent/90"
                >
                  View Repository
                  <ExternalLink className="h-4 w-4" />
                </a>
                {certificates[0] ? (
                  <Link
                    href={`/verify/${certificates[0].id}`}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    Open Public Verify
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-4 rounded-[2rem] border border-white/10 bg-background/50 p-5 shadow-xl">
              <div className="flex h-28 w-28 items-center justify-center rounded-full border border-accent/20 bg-accent/10 text-4xl font-black text-white">
                {overall}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                  Composite score
                </p>
                <p className="mt-2 text-3xl font-extrabold text-white">
                  {overall >= 90 ? "S-Tier" : overall >= 80 ? "A-Tier" : overall >= 70 ? "B-Tier" : "C-Tier"}
                </p>
                <p className="mt-2 max-w-[170px] text-sm leading-relaxed text-muted">
                  Based on the saved architecture, backend, documentation, and code quality signals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <article
                  key={stat.label}
                  className="rounded-[1.6rem] border border-white/10 bg-background/45 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-accent">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted">{stat.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{stat.value}</p>
                </article>
              );
            })}
          </section>

          <section className="rounded-[2rem] border border-border/70 bg-surface/40 p-6 shadow-sm backdrop-blur-xl">
            <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-white">
              <TrendingUp className="h-5 w-5 text-accent" />
              Score breakdown
            </h2>
            <div className="mt-6 space-y-4">
              {scoreBands.map((band) => (
                <div key={band.label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-muted">{band.label}</span>
                    <span className="font-semibold text-white">{band.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/8">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent via-emerald-300 to-amber-300"
                      style={{ width: `${band.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-[2rem] border border-border/70 bg-surface/40 p-6 shadow-sm backdrop-blur-xl">
              <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-white">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                Strengths
              </h2>
              <ul className="mt-5 space-y-3">
                {strengths.length ? (
                  strengths.map((item, index) => (
                    <li key={`${item}-${index}`} className="rounded-[1.2rem] border border-white/8 bg-background/40 px-4 py-3 text-sm leading-relaxed text-muted">
                      {item}
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-muted">No saved strength notes yet.</li>
                )}
              </ul>
            </section>

            <section className="rounded-[2rem] border border-border/70 bg-surface/40 p-6 shadow-sm backdrop-blur-xl">
              <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-white">
                <ShieldAlert className="h-5 w-5 text-amber-300" />
                Risks
              </h2>
              <ul className="mt-5 space-y-3">
                {risks.length ? (
                  risks.map((item, index) => (
                    <li key={`${item}-${index}`} className="rounded-[1.2rem] border border-white/8 bg-background/40 px-4 py-3 text-sm leading-relaxed text-muted">
                      {item}
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-muted">No saved risk notes yet.</li>
                )}
              </ul>
            </section>
          </section>

          <section className="rounded-[2rem] border border-border/70 bg-surface/40 p-6 shadow-sm backdrop-blur-xl">
            <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-white">
              <Award className="h-5 w-5 text-accent-strong" />
              Skill evidence and frameworks
            </h2>
            <div className="mt-5 flex flex-wrap gap-3">
              {[...evidence, ...frameworks].length ? (
                [...evidence, ...frameworks].map((item, index) => (
                  <span
                    key={`${item}-${index}`}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/90"
                  >
                    {item}
                  </span>
                ))
              ) : (
                <p className="text-sm text-muted">No evidence items were saved for this project yet.</p>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-[2rem] border border-border/70 bg-surface/40 p-6 shadow-sm backdrop-blur-xl">
            <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-white">
              <Clock3 className="h-5 w-5 text-accent" />
              Analysis jobs
            </h2>
            <div className="mt-5 space-y-4">
              {jobs.length ? (
                jobs.map((job) => (
                  <article
                    key={job.id}
                    className="rounded-[1.3rem] border border-white/8 bg-background/40 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium capitalize text-white">
                        {job.job_type.replace(/_/g, " ")}
                      </p>
                      <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${statusTone(job.status)}`}>
                        {job.status}
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-muted">
                      Started {formatDateTime(job.started_at)}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      Finished {formatDateTime(job.finished_at)}
                    </p>
                    {job.error_message ? (
                      <p className="mt-3 text-sm text-red-300">{job.error_message}</p>
                    ) : null}
                  </article>
                ))
              ) : (
                <p className="text-sm text-muted">No saved jobs yet.</p>
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-border/70 bg-surface/40 p-6 shadow-sm backdrop-blur-xl">
            <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-white">
              <Fingerprint className="h-5 w-5 text-accent" />
              Certificates
            </h2>
            <div className="mt-5 space-y-4">
              {certificates.length ? (
                certificates.map((certificate) => (
                  <article
                    key={certificate.id}
                    className="rounded-[1.3rem] border border-white/8 bg-background/40 p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.16em] text-muted">{certificate.id}</p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${statusTone(certificate.status || "pending")}`}>
                        {titleCase(certificate.status || "pending")}
                      </span>
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/dashboard/certificates/${certificate.id}`}
                          className="text-sm font-semibold text-white transition-colors hover:text-accent"
                        >
                          View certificate
                        </Link>
                        <Link
                          href={`/verify/${certificate.id}`}
                          className="text-sm font-semibold text-accent transition-colors hover:text-accent/80"
                        >
                          Open verify
                        </Link>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-muted">Issued {formatDate(certificate.created_at)}</p>
                    {certificate.certificate_hash ? (
                      <p className="mt-3 break-all rounded-xl border border-white/8 bg-white/5 p-2 font-mono text-[11px] text-white/80">
                        {certificate.certificate_hash}
                      </p>
                    ) : null}
                  </article>
                ))
              ) : (
                <p className="text-sm text-muted">No certificate records yet.</p>
              )}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
