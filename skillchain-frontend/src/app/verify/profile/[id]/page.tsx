import Link from "next/link";
import BackButton from "@/components/BackButton";
import {
  Activity,
  CheckCircle2,
  ExternalLink,
  Layers3,
  ShieldAlert,
  Sparkles,
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
    skillEvidence?: string[];
  } | null;
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
  users?: { email?: string | null } | Array<{ email?: string | null }>;
};

type CertificateRecord = {
  id: string;
  status: string | null;
  verification_status?: string | null;
  created_at: string | null;
  projects?: ProjectRelation | ProjectRelation[];
};

type PageProps = {
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

function averageScore(score: ScoreRecord | null) {
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

function rank(score: number) {
  if (score >= 90) return "S-Tier";
  if (score >= 80) return "A-Tier";
  if (score >= 70) return "B-Tier";
  return "C-Tier";
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
    throw new Error(result.message || "Could not load profile.");
  }

  return result.data as CertificateRecord;
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { id } = await params;

  let certificate: CertificateRecord | null = null;
  let loadError: string | null = null;

  try {
    certificate = await fetchCertificate(id);
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Could not load profile.";
  }

  if (!certificate) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 sm:py-20">
        <div className="absolute left-10 top-10">
          <BackButton href="/verify" text="Back to Verify" />
        </div>
        <div className="mb-8 mt-8 flex h-20 w-20 items-center justify-center rounded-full bg-accent-strong/10 text-accent-strong">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <p className="rounded-full border border-accent-strong/20 bg-accent-strong/10 px-5 py-2 text-xs font-bold uppercase tracking-[0.25em] text-accent-strong">
          Profile Not Found
        </p>
        <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          No public profile summary found
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
          {loadError || "We could not build a public summary from this certificate ID."}
        </p>
      </main>
    );
  }

  const project = asSingle(certificate.projects);
  const metric = project?.metrics?.[0] ?? null;
  const score = project?.scores?.[0] ?? null;
  const overall = averageScore(score);
  const owner = ownerName(project);
  const handle = username(project);
  const repo = repoLabel(project);
  const strengths = score?.score_breakdown_json?.strengths?.slice(0, 3) || [];
  const evidence = score?.score_breakdown_json?.skillEvidence?.slice(0, 3) || [];
  const frameworks = metric?.raw_metrics_json?.frameworks?.slice(0, 4) || [];
  const isVerified =
    certificate.verification_status === "verified" ||
    certificate.status === "verified";

  const stats = [
    {
      label: "Profile score",
      value: String(overall),
      note: rank(overall),
    },
    {
      label: "Repository files",
      value: String(metric?.raw_metrics_json?.fileStats?.totalFiles ?? metric?.files ?? 0),
      note: "Public project scope",
    },
    {
      label: "Source files",
      value: String(metric?.raw_metrics_json?.fileStats?.sourceFiles ?? 0),
      note: "Implementation inspected",
    },
    {
      label: "Test ratio",
      value: `${Math.round(metric?.test_ratio ?? 0)}%`,
      note: "Saved from analysis",
    },
  ];

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
      <div className="mb-6">
        <BackButton href={`/verify/${id}`} text="Back to Certificate" />
      </div>

      <section className="relative overflow-hidden rounded-[2.5rem] border border-border/70 bg-surface/50 p-6 shadow-2xl backdrop-blur-2xl sm:p-8 lg:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.14),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(168,245,233,0.14),transparent_24%)]" />
        <div className="relative">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] border border-[#a8f5e9]/40 bg-[#a8f5e9]/10 text-[#a8f5e9]">
                <User className="h-10 w-10" strokeWidth={1.5} />
              </div>
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">
                    Public Profile Summary
                  </p>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${isVerified ? "border-accent/30 bg-accent/15 text-accent" : "border-[#a8f5e9]/30 bg-[#a8f5e9]/10 text-[#a8f5e9]"}`}>
                    {isVerified ? "Blockchain Verified" : "Certificate Issued"}
                  </span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {owner}
                </h1>
                <p className="mt-2 text-sm text-muted">@{handle}</p>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
                  A recruiter-friendly summary built from the public certificate record for one analyzed project.
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-border/80 bg-background/75 px-6 py-5 text-center shadow-xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                Overall Signal
              </p>
              <p className="mt-3 text-5xl font-black text-foreground">{overall}</p>
              <p className="mt-2 text-sm font-semibold text-accent">{rank(overall)}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <article
                key={stat.label}
                className="rounded-[1.6rem] border border-white/10 bg-background/45 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-muted">{stat.label}</p>
                <p className="mt-2 text-3xl font-semibold text-white">{stat.value}</p>
                <p className="mt-2 text-xs text-muted">{stat.note}</p>
              </article>
            ))}
          </section>

          <section className="rounded-[2rem] border border-border/70 bg-surface/40 p-6 shadow-sm backdrop-blur-xl">
            <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-white">
              <Sparkles className="h-5 w-5 text-accent" />
              Summary Snapshot
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.4rem] border border-white/8 bg-background/40 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Repository</p>
                <p className="mt-2 text-lg font-semibold text-white">{repo}</p>
                <p className="mt-2 text-sm text-muted">Branch: {project?.default_branch || "default branch"}</p>
              </div>
              <div className="rounded-[1.4rem] border border-white/8 bg-background/40 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Certificate issued</p>
                <p className="mt-2 text-lg font-semibold text-white">{formatDate(certificate.created_at)}</p>
                <p className="mt-2 text-sm text-muted">Status: {titleCase(certificate.verification_status || certificate.status || "pending")}</p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-muted">
              {score?.explanation || "This summary is based on the saved public repository analysis linked to the certificate."}
            </p>
          </section>

          <section className="rounded-[2rem] border border-border/70 bg-surface/40 p-6 shadow-sm backdrop-blur-xl">
            <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-white">
              <CheckCircle2 className="h-5 w-5 text-accent" />
              Top Strengths
            </h2>
            <ul className="mt-5 space-y-3">
              {strengths.length ? strengths.map((item, index) => (
                <li
                  key={`${item}-${index}`}
                  className="rounded-[1.2rem] border border-white/8 bg-background/40 px-4 py-3 text-sm leading-relaxed text-muted"
                >
                  {item}
                </li>
              )) : (
                <li className="text-sm text-muted">No public strength notes available yet.</li>
              )}
            </ul>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-[2rem] border border-border/70 bg-surface/40 p-6 shadow-sm backdrop-blur-xl">
            <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-white">
              <Layers3 className="h-5 w-5 text-[#a8f5e9]" />
              Tech Signals
            </h2>
            <div className="mt-5 flex flex-wrap gap-3">
              {[...evidence, ...frameworks].length ? (
                [...evidence, ...frameworks].map((item, index) => (
                  <span
                    key={`${item}-${index}`}
                    className="rounded-full border border-[#a8f5e9]/30 bg-[#a8f5e9]/10 px-4 py-2 text-sm font-medium text-[#a8f5e9]"
                  >
                    {item}
                  </span>
                ))
              ) : (
                <p className="text-sm text-muted">No public skill tags available yet.</p>
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-border/70 bg-surface/40 p-6 shadow-sm backdrop-blur-xl">
            <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-white">
              <Activity className="h-5 w-5 text-accent" />
              Quick Read
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-relaxed text-muted">
              <p>This profile summary is public-safe and built from the linked project certificate.</p>
              <p>It helps recruiters understand the person behind the repo without opening internal dashboard data.</p>
              <p>For full technical proof, open the certificate verification page.</p>
            </div>
          </section>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/verify/${id}`}
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent/90"
            >
              Open Certificate Record
            </Link>
            {project?.repo_url ? (
              <a
                href={project.repo_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                View Repository
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </aside>
      </section>
    </main>
  );
}
