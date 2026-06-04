import Link from "next/link";
import BackButton from "@/components/BackButton";
import {
  Activity,
  Award,
  CheckCircle2,
  Clock,
  Code2,
  ExternalLink,
  Fingerprint,
  GitCommit,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Trophy,
  User,
} from "lucide-react";
import { buildSkillchainApiUrl } from "@/lib/skillchain-api";

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
  } | null;
  certificate_hash?: string | null;
  blockchain_tx?: string | null;
  chain_id?: string | null;
  contract_address?: string | null;
  projects?: ProjectRelation | ProjectRelation[];
};

type VerifyPageProps = {
  params: Promise<{
    id: string;
  }>;
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

function verificationText(certificate: CertificateRecord) {
  if (certificate.verification_status === "verified") {
    return "Secured on Polygon";
  }

  if (certificate.status === "verified") {
    return "Secured on Polygon";
  }

  if (certificate.status === "failed" || certificate.verification_status === "failed") {
    return "Verification Failed";
  }

  return "Awaiting Block Finality";
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
  const response = await fetch(buildSkillchainApiUrl(`/verify/${certificateId}`), {
    next: { revalidate: 60 },
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

export default async function VerifyCertificatePage({ params }: VerifyPageProps) {
  const { id } = await params;

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
        <div className="absolute left-10 top-10">
          <BackButton href="/verify" text="Back to Verify" />
        </div>
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
            "This public verification area is active, but the provided certificate ID could not be found in our network."}
        </p>
        <Link
          href="/verify"
          className="mt-10 rounded-full bg-foreground px-8 py-4 text-sm font-bold text-background shadow-xl transition-all hover:scale-105 hover:bg-foreground/90"
        >
          Return to Verify Hub
        </Link>
      </main>
    );
  }

  const project = asSingle(certificate.projects);
  const metrics = project?.metrics?.[0] ?? null;
  const score = project?.scores?.[0] ?? null;
  const jobs = project?.analysis_jobs || [];

  const skillBreakdown = [
    { label: "Backend", value: score?.backend_score ?? 0 },
    { label: "Architecture", value: score?.architecture_score ?? 0 },
    { label: "Documentation", value: score?.documentation_score ?? 0 },
    { label: "Confidence", value: score?.confidence_score ?? 0 },
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

  const strengths = score?.score_breakdown_json?.strengths || [];
  const risks = score?.score_breakdown_json?.risks || [];
  const frameworks = metrics?.raw_metrics_json?.frameworks || [];

  const achievements = [
    ...(score?.score_breakdown_json?.skillEvidence || []).slice(0, 3),
    ...frameworks.slice(0, 2),
  ].filter(Boolean);

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

  const isVerified =
    certificate.verification_status === "verified" ||
    certificate.status === "verified";
  const overall = overallScore(score);
  const owner = ownerName(project);
  const handle = username(project);
  const repo = repoLabel(project);
  const integrityRef =
    certificate.blockchain_tx || certificate.certificate_hash || "Pending chain/hash reference";

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
      <div className="mb-6">
        <BackButton href="/verify" text="Back to Search" />
      </div>

      <div className="flex flex-col gap-6 lg:gap-8">
        <header className="relative flex flex-col gap-6 overflow-hidden rounded-[2rem] border border-border/70 bg-surface/50 p-5 shadow-2xl backdrop-blur-2xl sm:gap-8 sm:rounded-[2.5rem] sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10">
          <div className="absolute right-0 top-0 -z-10 h-full w-2/3 rounded-r-[2.5rem] bg-gradient-to-l from-accent/5 to-transparent blur-3xl" />
          <div className="absolute -left-20 -top-20 -z-10 h-60 w-60 rounded-full bg-surface-strong/50 blur-3xl" />

          <div className="z-10 flex items-center gap-4 sm:gap-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.75rem] border border-accent/30 bg-gradient-to-br from-accent/30 to-accent/5 text-accent shadow-inner">
              <User className="h-10 w-10" strokeWidth={1.5} />
            </div>
            <div>
              <div className="mb-2 flex items-center gap-3">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent drop-shadow-sm">
                  Verified Profile
                </p>
                {isVerified ? (
                  <span className="flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/15 px-3 py-1 text-xs font-semibold text-accent shadow-[0_0_15px_rgba(52,211,153,0.2)]">
                    <ShieldCheck className="h-3.5 w-3.5" /> On-Chain Record
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 rounded-full border border-accent-strong/30 bg-accent-strong/15 px-3 py-1 text-xs font-semibold text-accent-strong shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                    <ShieldAlert className="h-3.5 w-3.5" /> Pending Finality
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground drop-shadow-md sm:text-4xl lg:text-5xl">
                {owner}
              </h1>
              <p className="mt-3 flex items-center gap-2 text-sm font-medium text-muted">
                {certificate.id} <span className="mx-1 text-xs opacity-40">●</span>
                <span className="text-foreground/80">@{handle}</span>
              </p>
              <p className="mt-2 text-sm text-muted">{repo}</p>
              {project?.repo_url ? (
                <a
                  href={project.repo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent/80"
                >
                  View repository
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          </div>

          <div className="z-10 flex shrink-0 items-center justify-center gap-4 rounded-[1.5rem] border border-border/80 bg-background/80 p-4 shadow-xl backdrop-blur-xl transition-transform duration-300 hover:scale-[1.02] sm:gap-6 sm:rounded-[2rem] sm:p-6">
            <div className="relative flex h-28 w-28 items-center justify-center">
              <svg className="h-full w-full -rotate-90 transform drop-shadow-lg" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" className="stroke-border/40" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  className="stroke-accent drop-shadow-[0_0_12px_rgba(52,211,153,0.6)]"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(overall / 100) * 264} 264`}
                  style={{ transition: "stroke-dasharray 1.5s ease-out" }}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-foreground drop-shadow-md">{overall}</span>
              </div>
            </div>
            <div className="flex flex-col justify-center pr-2">
              <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted">
                <Trophy className="h-3.5 w-3.5 text-accent" /> Developer Rank
              </p>
              <p className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-3xl font-extrabold text-transparent drop-shadow-sm">
                {overall >= 90 ? "S-Tier" : overall >= 80 ? "A-Tier" : overall >= 70 ? "B-Tier" : "C-Tier"}
              </p>
              <p className="mt-1 max-w-[130px] text-xs font-medium leading-snug text-muted/80">
                Saved score profile across the analyzed repository
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12 lg:gap-8">
          <div className="flex flex-col gap-6 md:col-span-8 lg:gap-8">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
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

            <section className="rounded-[2rem] border border-border/80 bg-surface/50 p-8 shadow-xl backdrop-blur-md">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="flex items-center gap-2.5 text-2xl font-extrabold tracking-tight text-foreground">
                    <Activity className="h-6 w-6 text-accent" /> Skill Topography
                  </h2>
                  <p className="mt-2 text-sm font-medium text-muted">
                    Saved technical scoring pulled from the repository analysis record.
                  </p>
                </div>
              </div>

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

          <div className="flex flex-col gap-6 md:col-span-4 lg:gap-8">
            <section className="group relative overflow-hidden rounded-[2rem] border border-border/80 bg-surface/50 p-7 shadow-xl backdrop-blur-md transition-colors duration-300 hover:border-accent/30">
              <div className="absolute right-0 top-0 h-40 w-40 translate-x-1/3 -translate-y-1/3 rounded-full bg-accent/10 blur-[50px] transition-colors duration-500 group-hover:bg-accent/20" />
              <h2 className="mb-6 flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-foreground">
                <Fingerprint className="h-6 w-6 text-muted transition-colors group-hover:text-accent" /> Source Integrity
              </h2>
              <div className="space-y-5 text-sm">
                <div className="rounded-2xl border border-border/60 bg-background/60 p-4.5 shadow-sm">
                  <p className="mb-1.5 text-[11px] font-extrabold uppercase tracking-widest text-muted">
                    Network Status
                  </p>
                  <p className={`flex items-center gap-2 text-sm font-bold ${isVerified ? "text-accent" : "text-accent-strong"}`}>
                    {isVerified ? <ShieldCheck className="h-4.5 w-4.5" /> : <Clock className="h-4.5 w-4.5" />}
                    {verificationText(certificate)}
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
              </div>
            </section>

            <section className="flex-1 rounded-[2rem] border border-border/80 bg-surface/50 p-7 shadow-xl backdrop-blur-md">
              <h2 className="mb-6 flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-foreground">
                <Trophy className="h-6 w-6 text-accent-strong drop-shadow-sm" /> Milestones
              </h2>
              <ul className="space-y-4.5">
                {achievements.length ? (
                  achievements.map((item, i) => (
                    <li key={`${item}-${i}`} className="group flex items-start gap-3.5">
                      <div className="mt-0.5 shrink-0 rounded-full border border-accent/20 bg-accent/10 p-1 transition-transform group-hover:scale-110">
                        <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                      </div>
                      <span className="text-sm font-medium leading-relaxed text-muted transition-colors group-hover:text-foreground/90">
                        {item}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-muted">No milestone items available yet.</li>
                )}
              </ul>

              <hr className="my-7 border-border/60" />

              <h2 className="mb-6 flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-foreground">
                <TrendingUp className="h-6 w-6 text-blue-400 drop-shadow-sm" /> Growth Trajectory
              </h2>
              <ul className="space-y-4.5">
                {[...strengths.slice(0, 2), ...progress.slice(0, 3), ...risks.slice(0, 1)].map((item, i) => (
                  <li key={`${item}-${i}`} className="group flex items-start gap-3">
                    <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)] transition-transform group-hover:scale-150" />
                    <span className="text-sm font-medium leading-relaxed text-muted transition-colors group-hover:text-foreground/90">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        <section className="mt-4 flex flex-col items-center justify-center rounded-[2.5rem] border border-border/70 bg-gradient-to-b from-surface/30 to-surface/50 p-10 text-center shadow-lg backdrop-blur-xl">
          <p className="mb-6 text-sm font-extrabold uppercase tracking-[0.25em] text-muted">
            Explore Directory
          </p>
          <div className="flex max-w-2xl flex-wrap justify-center gap-3.5">
            {certificate.verification_url ? (
              <a
                href={certificate.verification_url}
                className="rounded-full border border-border/80 bg-background/60 px-6 py-2.5 text-xs font-bold text-foreground transition-all duration-300 hover:scale-105 hover:border-accent hover:bg-surface hover:text-accent hover:shadow-[0_0_15px_rgba(52,211,153,0.15)]"
              >
                Public Link
              </a>
            ) : null}
            <Link
              href="/verify"
              className="rounded-full border border-border/80 bg-background/60 px-6 py-2.5 text-xs font-bold text-foreground transition-all duration-300 hover:scale-105 hover:border-accent hover:bg-surface hover:text-accent hover:shadow-[0_0_15px_rgba(52,211,153,0.15)]"
            >
              Back to Search
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
