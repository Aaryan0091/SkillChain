import Link from "next/link";
import BackButton from "@/components/BackButton";
import PublicCertificateTools from "@/components/PublicCertificateTools";
import ScoreEvidenceAudit from "@/components/ScoreEvidenceAudit";
import VerificationStatusLegend from "@/components/VerificationStatusLegend";
import {
  Activity,
  Award,
  CheckCircle2,
  Clock,
  Code2,
  Fingerprint,
  GitCommit,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Trophy,
  User,
} from "lucide-react";
import { buildSkillchainApiUrl } from "@/lib/skillchain-api";
import { resolveCertificateVerification } from "@/lib/certificate-verification";
import { getE2ECertificate, isE2ETestMode } from "@/lib/e2e-fixtures";

type MetricRecord = {
  files: number | null;
  test_ratio: number | null;
  raw_metrics_json?: {
    frameworks?: string[];
    packageNames?: string[];
    selectedFiles?: {
      path: string;
      kind: string;
    }[];
    signals?: Record<string, boolean>;
    fileStats?: {
      totalFiles?: number;
      sourceFiles?: number;
      testFiles?: number;
      docsFiles?: number;
    };
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

type AnalysisJobRecord = {
  id: string;
  job_type: string;
  status: string;
  started_at: string | null;
  finished_at: string | null;
  error_message: string | null;
};

type ProjectRelation = {
  id: string;
  repo_name: string;
  repo_url: string;
  default_branch: string | null;
  analysis_status: string;
  created_at: string | null;
  last_analyzed_at: string | null;
  metrics?: MetricRecord[];
  scores?: ScoreRecord[];
  analysis_jobs?: AnalysisJobRecord[];
  users?: { email?: string | null } | Array<{ email?: string | null }>;
};

type CertificateRecord = {
  id: string;
  status: string | null;
  verification_status?: string | null;
  created_at: string | null;
  verification_url?: string | null;
  certificate_payload?: {
    summary?: {
      explanation?: string;
    };
    verificationBasis?: {
      scope?: string;
      basisVersion?: string;
      projectBinding?: {
        projectId?: string;
        repoUrl?: string;
        repoName?: string;
        defaultBranch?: string | null;
      };
      checks?: string[];
    };
  } | null;
  certificate_hash?: string | null;
  blockchain_tx?: string | null;
  chain_id?: string | null;
  contract_address?: string | null;
  projects?: ProjectRelation | ProjectRelation[];
};

function asSingle<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

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

function titleCase(value: string) {
  return value
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function repoLabel(project: ProjectRelation | null) {
  if (!project) return "Unknown Repository";
  if (project.repo_name?.trim()) return project.repo_name;

  try {
    const url = new URL(project.repo_url);
    return url.pathname.replace(/^\/+/, "") || project.repo_url;
  } catch {
    return project.repo_url;
  }
}

function overallScore(score: ScoreRecord | null) {
  if (!score) return 0;

  const values = [
    score.backend_score,
    score.architecture_score,
    score.documentation_score,
    score.confidence_score,
    score.score_breakdown_json?.frontend ?? null,
    score.score_breakdown_json?.codeQuality ?? null,
    score.score_breakdown_json?.security ?? null,
  ].filter((value): value is number => typeof value === "number");

  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function userEmail(project: ProjectRelation | null) {
  const users = asSingle(project?.users);
  return users?.email || null;
}

function ownerName(project: ProjectRelation | null) {
  const email = userEmail(project);
  if (!email) return "Verified Developer";

  return titleCase(email.split("@")[0]);
}

function username(project: ProjectRelation | null) {
  const email = userEmail(project);
  if (!email) return "developer";
  return email.split("@")[0];
}

async function fetchCertificate(certificateId: string) {
  if (isE2ETestMode) {
    return getE2ECertificate(certificateId) as CertificateRecord | null;
  }

  const response = await fetch(buildSkillchainApiUrl(`/verify/${certificateId}`), {
    cache: "no-store",
  });

  const result = await response.json();

  if (response.status === 404) {
    return null;
  }

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Could not load certificate.");
  }

  return result.data as CertificateRecord;
}

export default async function VerifyCertificatePageContent({
  id,
  backHref,
  backText,
  recordHrefBase = "/verify",
  showInlineBackButton = true,
  showPageBackButton = true,
}: {
  id: string;
  backHref: string;
  backText: string;
  recordHrefBase?: string;
  showInlineBackButton?: boolean;
  showPageBackButton?: boolean;
}) {
  let certificate: CertificateRecord | null = null;
  let loadError: string | null = null;

  try {
    certificate = await fetchCertificate(id);
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Could not load certificate.";
  }

  if (!certificate) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 sm:py-20">
        {showInlineBackButton ? (
          <div className="absolute left-10 top-10">
            <BackButton href={backHref} text={backText} />
          </div>
        ) : null}
        <div className="mb-8 mt-8 flex h-20 w-20 items-center justify-center rounded-full bg-accent-strong/10 text-accent-strong shadow-[0_0_30px_rgba(245,158,11,0.2)]">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <p className="rounded-full border border-accent-strong/20 bg-accent-strong/10 px-5 py-2 text-xs font-bold uppercase tracking-[0.25em] text-accent-strong">
          Certificate Not Found
        </p>
        <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-foreground drop-shadow-sm sm:text-5xl">
          No valid record located
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
          {loadError ||
            "This public verification area is active, but the provided project certificate ID could not be found in our network."}
        </p>
        <Link
          href={backHref}
          className="mt-10 inline-flex min-w-[220px] items-center justify-center rounded-full border border-[#a8f5e9]/75 bg-[#081411] px-8 py-4 text-base font-extrabold text-[#a8f5e9] shadow-[0_0_0_1px_rgba(168,245,233,0.08),0_16px_40px_rgba(168,245,233,0.16)] transition-all hover:scale-105 hover:bg-[#0d1f1a] hover:text-white"
        >
          {backText}
        </Link>
      </main>
    );
  }

  const project = asSingle(certificate.projects);
  const metrics = project?.metrics?.[0] ?? null;
  const score = project?.scores?.[0] ?? null;
  const jobs = project?.analysis_jobs || [];
  const strengths = score?.score_breakdown_json?.strengths || [];
  const risks = score?.score_breakdown_json?.risks || [];
  const frameworks = metrics?.raw_metrics_json?.frameworks || [];
  const packageNames = metrics?.raw_metrics_json?.packageNames || [];
  const selectedFiles = metrics?.raw_metrics_json?.selectedFiles || [];
  const detectedSignals = Object.entries(metrics?.raw_metrics_json?.signals || {})
    .filter(([, passed]) => Boolean(passed))
    .map(([label]) => titleCase(label.replace(/^has/, "").replace(/^uses/, "")));
  const achievements = [
    ...(score?.score_breakdown_json?.skillEvidence || []).slice(0, 3),
    ...frameworks.slice(0, 2),
  ].filter(Boolean);
  const verification = resolveCertificateVerification(certificate, project);
  const isVerified = verification.state === "verified";
  const overall = overallScore(score);
  const owner = ownerName(project);
  const handle = username(project);
  const repo = repoLabel(project);
  const integrityRef =
    certificate.blockchain_tx || certificate.certificate_hash || "Pending chain/hash reference";
  const verificationChecks = certificate.certificate_payload?.verificationBasis?.checks || [
    "This certificate is tied to one saved project record.",
    "The score summary shown here comes from that saved project analysis.",
    "The public verification link and hash point to the same certificate record.",
  ];
  const recruiterSignals = [
    {
      label: "Decision status",
      value: verification.badgeLabel,
      note: verification.recruiterSummary,
    },
    {
      label: "Repository proof",
      value: repo,
      note: "This certificate is tied to one saved project only.",
    },
    {
      label: "Evidence basis",
      value: `${achievements.length} saved signals`,
      note: "Built from strengths, frameworks, and saved score evidence.",
    },
  ];
  const statCards = [
    {
      label: "Repository Files",
      value: String(metrics?.raw_metrics_json?.fileStats?.totalFiles ?? metrics?.files ?? 0),
      note: "Saved from the analyzed project record",
    },
    {
      label: "Source Files",
      value: String(metrics?.raw_metrics_json?.fileStats?.sourceFiles ?? 0),
      note: "Signals how much real implementation was inspected",
    },
    {
      label: "Test Ratio",
      value: `${Math.round(metrics?.test_ratio ?? 0)}%`,
      note: "Derived from the saved repository metrics",
    },
    {
      label: "Jobs Recorded",
      value: String(jobs.length),
      note: "Processing history linked to this project",
    },
  ];
  const skillBreakdown = [
    { label: "Backend", value: score?.backend_score ?? 0 },
    { label: "Architecture", value: score?.architecture_score ?? 0 },
    { label: "Documentation", value: score?.documentation_score ?? 0 },
    { label: "Confidence", value: score?.confidence_score ?? 0 },
  ];
  const progress = jobs.length
    ? jobs.map((job) => {
        const timing = job.finished_at
          ? `Finished ${formatDate(job.finished_at)}`
          : job.started_at
            ? `Started ${formatDate(job.started_at)}`
            : "Timing unavailable";
        return `${titleCase(job.job_type)}: ${titleCase(job.status)}. ${timing}.`;
      })
    : [
        project?.last_analyzed_at
          ? `Last analyzed on ${formatDate(project.last_analyzed_at)}.`
          : "No analysis timeline available yet.",
      ];

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
      {showPageBackButton ? (
        <div className="mb-6">
          <BackButton href={backHref} text={backText} />
        </div>
      ) : null}

      <div className="flex flex-col gap-6 lg:gap-8">
        <header className="rounded-[2.5rem] border border-border/70 bg-surface/50 p-6 shadow-xl backdrop-blur-2xl sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.5rem] border border-accent/30 bg-accent/10 text-accent">
                <User className="h-8 w-8" strokeWidth={1.5} />
              </div>
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">
                    Public Verification
                  </p>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${verification.badgeClass}`}>
                    {verification.badgeLabel}
                  </span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  {owner}
                </h1>
                <p className="mt-2 text-sm text-muted">@{handle}</p>
                <p className="mt-2 text-sm text-muted">{repo}</p>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
                  {verification.summary}
                </p>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-background/75 px-6 py-5 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                Score
              </p>
              <p className="mt-2 text-5xl font-black text-foreground">{overall}</p>
              <p className="mt-2 text-sm font-semibold text-accent">
                {overall >= 90 ? "S-Tier" : overall >= 80 ? "A-Tier" : overall >= 70 ? "B-Tier" : "C-Tier"}
              </p>
            </div>
          </div>
        </header>

        <PublicCertificateTools
          certificateId={certificate.id}
          verificationUrl={certificate.verification_url}
          recordHrefBase={recordHrefBase}
        />

        <VerificationStatusLegend compact />

        <section className="grid gap-4 lg:grid-cols-3">
          {recruiterSignals.map((signal) => (
            <article
              key={signal.label}
              className="rounded-[1.6rem] border border-border/80 bg-surface/45 p-5 shadow-sm backdrop-blur-md"
            >
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted">
                {signal.label}
              </p>
              <p className="mt-2 text-lg font-bold text-foreground">{signal.value}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{signal.note}</p>
            </article>
          ))}
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {statCards.map((stat, i) => {
                const icons = [Code2, Award, GitCommit, Activity];
                const Icon = icons[i % icons.length];

                return (
                  <article
                    key={stat.label}
                    className="group relative overflow-hidden rounded-[2rem] border border-border/80 bg-surface/50 p-6 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-accent/40 hover:bg-surface/80 hover:shadow-xl"
                  >
                    <div className="absolute right-0 top-0 -mr-6 -mt-6 h-32 w-32 rounded-full bg-accent/5 blur-3xl transition-all duration-500 group-hover:bg-accent/15" />
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/50 bg-background/80 text-muted shadow-sm transition-colors duration-300 group-hover:text-accent">
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className="mt-5 text-xs font-bold uppercase tracking-widest text-muted transition-colors group-hover:text-foreground/80">
                      {stat.label}
                    </p>
                    <p className="mt-1.5 text-3xl font-black tracking-tight text-foreground drop-shadow-sm">
                      {stat.value}
                    </p>
                    <p className="mt-2 text-xs font-medium leading-relaxed text-muted/70">{stat.note}</p>
                  </article>
                );
              })}
            </div>

            <section className="rounded-[2rem] border border-border/80 bg-surface/50 p-6 shadow-sm backdrop-blur-md">
              <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground">
                <Activity className="h-5 w-5 text-accent" />
                Score Breakdown
              </h2>
              <div className="space-y-7">
                {skillBreakdown.map((skill) => (
                  <div key={skill.label} className="group cursor-default">
                    <div className="mb-3 flex items-end justify-between">
                      <p className="text-sm font-bold tracking-wide text-foreground/90 transition-colors group-hover:text-accent">
                        {skill.label}
                      </p>
                      <p className="text-xl font-extrabold text-foreground">
                        {skill.value}
                        <span className="ml-0.5 text-sm font-bold text-muted">%</span>
                      </p>
                    </div>
                    <div className="relative h-3 w-full overflow-hidden rounded-full bg-border/40 shadow-inner">
                      <div
                        className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-accent/80 to-accent shadow-[0_0_12px_rgba(52,211,153,0.5)] transition-all duration-1000 ease-out"
                        style={{ width: `${skill.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-[2rem] border border-border/80 bg-surface/50 p-6 shadow-sm backdrop-blur-md">
              <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground">
                <Fingerprint className="h-5 w-5 text-accent" />
                Verification Summary
              </h2>
              <div className="space-y-5 text-sm">
                <div className="rounded-2xl border border-border/60 bg-background/60 p-4.5 shadow-sm">
                  <p className="mb-1.5 text-[11px] font-extrabold uppercase tracking-widest text-muted">
                    Network Status
                  </p>
                  <p className={`flex items-center gap-2 text-sm font-bold ${verification.state === "failed" ? "text-red-300" : isVerified ? "text-accent" : "text-accent-strong"}`}>
                    {verification.state === "failed" ? (
                      <ShieldAlert className="h-4.5 w-4.5" />
                    ) : isVerified ? (
                      <ShieldCheck className="h-4.5 w-4.5" />
                    ) : (
                      <Clock className="h-4.5 w-4.5" />
                    )}
                    {verification.headline}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {verification.recruiterSummary}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-white/80">
                    Why: {verification.reason}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/60 p-4.5 shadow-sm">
                  <p className="mb-2 text-[11px] font-extrabold uppercase tracking-widest text-muted">
                    Integrity Reference
                  </p>
                  <p className="break-all rounded-xl border border-border/40 bg-surface/50 p-2.5 font-mono text-[13px] font-semibold text-foreground/90">
                    {integrityRef}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/60 p-4.5 shadow-sm">
                  <p className="mb-1.5 text-[11px] font-extrabold uppercase tracking-widest text-muted">
                    Issuance Timestamp
                  </p>
                  <p className="text-sm font-bold text-foreground">{formatDate(certificate.created_at)}</p>
                </div>
                <div className="rounded-2xl border border-[#a8f5e9]/25 bg-[#a8f5e9]/8 p-4.5 shadow-sm">
                  <p className="mb-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#a8f5e9]">
                    Proof Checklist
                  </p>
                  <ul className="space-y-2">
                    {verification.checks.map((item, index) => (
                      <li key={`${item.label}-${index}`} className="text-sm font-medium text-foreground/85">
                        <span className="font-semibold text-foreground">
                          {item.label}:
                        </span>{" "}
                        {item.passed ? "Passed" : "Not yet passed"}.
                        {" "}
                        {item.detail}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/60 p-4.5 shadow-sm">
                  <p className="mb-1.5 text-[11px] font-extrabold uppercase tracking-widest text-muted">
                    Stored Rules
                  </p>
                  <ul className="space-y-2">
                    {verificationChecks.map((item, index) => (
                      <li key={`${item}-${index}`} className="text-sm font-medium text-foreground/85">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-border/80 bg-surface/50 p-6 shadow-sm backdrop-blur-md">
              <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground">
                <Trophy className="h-5 w-5 text-accent-strong" />
                Highlights
              </h2>
              <ul className="space-y-4">
                {achievements.length ? (
                  achievements.map((item, i) => (
                    <li key={`${item}-${i}`} className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0 rounded-full border border-accent/20 bg-accent/10 p-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                      </div>
                      <span className="text-sm font-medium leading-relaxed text-muted">
                        {item}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-muted">No milestone items available yet.</li>
                )}
              </ul>
              <hr className="my-6 border-border/60" />
              <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground">
                <TrendingUp className="h-5 w-5 text-blue-400" />
                Timeline Notes
              </h2>
              <ul className="space-y-4">
                {[...strengths.slice(0, 2), ...progress.slice(0, 3), ...risks.slice(0, 1)].map((item, i) => (
                  <li key={`${item}-${i}`} className="flex items-start gap-3">
                    <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
                    <span className="text-sm leading-relaxed text-muted">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <ScoreEvidenceAudit metric={metrics} score={score} compact />

            <section className="rounded-[2rem] border border-border/80 bg-surface/50 p-6 shadow-sm backdrop-blur-md">
              <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground">
                <Code2 className="h-5 w-5 text-accent" />
                Evidence ledger
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                <article className="rounded-2xl border border-border/60 bg-background/60 p-4.5 shadow-sm">
                  <p className="mb-2 text-[11px] font-extrabold uppercase tracking-widest text-muted">
                    Detected signals
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {detectedSignals.length ? (
                      detectedSignals.map((item, index) => (
                        <span
                          key={`${item}-${index}`}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-foreground/85"
                        >
                          {item}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-muted">No explicit signals were saved.</p>
                    )}
                  </div>
                </article>
                <article className="rounded-2xl border border-border/60 bg-background/60 p-4.5 shadow-sm">
                  <p className="mb-2 text-[11px] font-extrabold uppercase tracking-widest text-muted">
                    Frameworks and packages
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[...frameworks, ...packageNames.slice(0, 8)].length ? (
                      [...frameworks, ...packageNames.slice(0, 8)].map((item, index) => (
                        <span
                          key={`${item}-${index}`}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-foreground/85"
                        >
                          {item}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-muted">No package evidence was saved.</p>
                    )}
                  </div>
                </article>
                <article className="rounded-2xl border border-border/60 bg-background/60 p-4.5 shadow-sm">
                  <p className="mb-2 text-[11px] font-extrabold uppercase tracking-widest text-muted">
                    Selected files inspected
                  </p>
                  <ul className="space-y-2">
                    {selectedFiles.length ? (
                      selectedFiles.slice(0, 5).map((file, index) => (
                        <li key={`${file.path}-${index}`} className="rounded-xl border border-white/8 bg-white/5 px-3 py-2 text-xs leading-relaxed text-foreground/80">
                          <span className="font-semibold text-foreground/90">{file.kind}:</span> {file.path}
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-muted">No inspected file list was saved.</li>
                    )}
                  </ul>
                </article>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
