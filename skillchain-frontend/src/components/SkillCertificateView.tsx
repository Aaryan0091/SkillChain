import {
  BookOpenText,
  Award,
  BadgeCheck,
  CalendarDays,
  ExternalLink,
  Fingerprint,
  Globe,
  Layers3,
  Link2,
  Medal,
  Shield,
  ShieldCheck,
  ShieldEllipsis,
  Sparkles,
} from "lucide-react";
import PublicCertificateTools from "./PublicCertificateTools";
import type {
  CertificateWithProjectRecord,
  ProjectRecord,
  ScoreRecord,
} from "@/lib/dashboard-data";

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

function ownerName(project: ProjectRecord | null) {
  const user = asSingle(project?.users);
  const email = user?.email;

  if (!email) return "Verified Developer";

  return email
    .split("@")[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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

function tier(score: number) {
  if (score >= 90) return "S-Tier";
  if (score >= 80) return "A-Tier";
  if (score >= 70) return "B-Tier";
  return "C-Tier";
}

function skillRows(score: ScoreRecord | null) {
  return [
    { label: "Backend", value: score?.backend_score ?? 0 },
    { label: "Architecture", value: score?.architecture_score ?? 0 },
    { label: "Documentation", value: score?.documentation_score ?? 0 },
    { label: "Confidence", value: score?.confidence_score ?? 0 },
  ];
}

function verificationChecks(certificate: CertificateWithProjectRecord) {
  return (
    certificate.certificate_payload?.verificationBasis?.checks || [
      "This certificate is tied to one saved project record.",
      "Its score summary comes from the repository analysis stored for that project.",
      "Its public verification link and integrity hash point to the same certificate record.",
    ]
  );
}

function statValue(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return "0";
  return String(value);
}

export default function SkillCertificateView({
  certificate,
}: {
  certificate: CertificateWithProjectRecord;
}) {
  const project = asSingle(certificate.projects);
  const metrics = project?.metrics?.[0] ?? null;
  const score = project?.scores?.[0] ?? null;
  const overall = averageScore(score);
  const owner = ownerName(project);
  const verificationState = certificate.verification_status || certificate.status || "pending";
  const verified = verificationState === "verified";
  const strengths = score?.score_breakdown_json?.strengths?.slice(0, 3) || [];
  const frameworks = metrics?.raw_metrics_json?.frameworks?.slice(0, 3) || [];
  const checks = verificationChecks(certificate);
  const fileStats = metrics?.raw_metrics_json?.fileStats;
  const summary =
    certificate.certificate_payload?.summary?.explanation ||
    score?.explanation ||
    metrics?.raw_metrics_json?.summary ||
    "This certificate is backed by a saved repository analysis record inside SkillChain.";
  const repoFacts = [
    {
      label: "Repository",
      value: project?.repo_name || "Unknown Repository",
      icon: Layers3,
    },
    {
      label: "Branch",
      value: project?.default_branch || "default branch",
      icon: Link2,
    },
    {
      label: "Issued",
      value: formatDate(certificate.created_at),
      icon: CalendarDays,
    },
  ];
  const trustFacts = [
    {
      label: "Files analyzed",
      value: statValue(fileStats?.totalFiles ?? metrics?.files ?? 0),
    },
    {
      label: "Source files",
      value: statValue(fileStats?.sourceFiles ?? 0),
    },
    {
      label: "Test ratio",
      value: `${Math.round(metrics?.test_ratio ?? 0)}%`,
    },
    {
      label: "Signal tags",
      value: statValue([...strengths, ...frameworks].length),
    },
  ];

  return (
    <section className="overflow-hidden rounded-[2.8rem] border border-white/70 bg-[linear-gradient(158deg,rgba(255,255,255,0.99),rgba(250,252,252,0.98)_52%,rgba(242,251,248,0.98))] text-slate-900 shadow-[0_36px_110px_rgba(15,23,42,0.18)]">
      <div className="relative border-b border-slate-200/80 px-6 py-6 sm:px-8 sm:py-7 lg:px-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,245,233,0.28),transparent_24%),radial-gradient(circle_at_left,rgba(226,232,240,0.42),transparent_30%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.24em] text-emerald-700">
                <Sparkles className="h-3.5 w-3.5" />
                Project Certificate
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                <Fingerprint className="h-3.5 w-3.5 text-slate-400" />
                ID {certificate.id.slice(0, 8)}
              </div>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
                Verified Project Work
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                {owner}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                {summary}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:w-[360px] lg:grid-cols-1">
            <div className="rounded-[1.8rem] border border-slate-200/80 bg-white/85 p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                Verification Status
              </p>
              <div className="mt-3 flex items-start gap-3">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                    verified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {verified ? (
                    <ShieldCheck className="h-5 w-5" />
                  ) : (
                    <ShieldEllipsis className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-950">
                    {verified ? "Verified" : titleCase(verificationState)}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">
                    {verified ? "Public proof confirmed and ready to share." : "Issued, but still waiting for final proof confirmation."}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.8rem] bg-[linear-gradient(180deg,#0f172a,#111c2d)] px-6 py-5 text-white shadow-[0_20px_50px_rgba(15,23,42,0.16)]">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/55">
                Skill Score
              </p>
              <div className="mt-3 flex items-end justify-between gap-4">
                <div>
                  <p className="text-5xl font-black leading-none">{overall}</p>
                  <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-emerald-300">
                    <Medal className="h-4 w-4" />
                    {tier(overall)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">
                    Analysis
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white/85">
                    {titleCase(project?.analysis_status || "pending")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 sm:px-8 lg:px-10">
        <div className="grid gap-4 md:grid-cols-3">
          {repoFacts.map((fact) => {
            const Icon = fact.icon;
            return (
              <article
                key={fact.label}
                className="rounded-[1.6rem] border border-slate-200/80 bg-white/80 px-5 py-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                      {fact.label}
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold text-slate-950">
                      {fact.value}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-6">
          <PublicCertificateTools
            certificateId={certificate.id}
            verificationUrl={certificate.verification_url}
            recordHrefBase="/dashboard/verify"
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <section className="rounded-[2rem] border border-slate-200/80 bg-white/88 p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-emerald-700" />
                <h2 className="text-lg font-semibold text-slate-950">Score Breakdown</h2>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {skillRows(score).map((item, index) => (
                  <div
                    key={item.label}
                    className="rounded-[1.4rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f7faf9)] px-4 py-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-semibold text-slate-700">{item.label}</p>
                      <p className="text-lg font-black text-slate-950">{item.value}</p>
                    </div>
                    <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full ${
                          index % 4 === 0
                            ? "bg-gradient-to-r from-emerald-500 to-[#a8f5e9]"
                            : index % 4 === 1
                              ? "bg-gradient-to-r from-sky-600 to-cyan-400"
                              : index % 4 === 2
                                ? "bg-gradient-to-r from-slate-700 to-slate-500"
                                : "bg-gradient-to-r from-amber-500 to-orange-400"
                        }`}
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200/80 bg-white/88 p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <BookOpenText className="h-5 w-5 text-slate-700" />
                <h2 className="text-lg font-semibold text-slate-950">Trust Snapshot</h2>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {trustFacts.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[1.3rem] border border-slate-200 bg-slate-50 px-4 py-4"
                  >
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                      {item.label}
                    </p>
                    <p className="mt-2 text-2xl font-black text-slate-950">{item.value}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-[2rem] border border-[#a8f5e9]/40 bg-[linear-gradient(180deg,rgba(168,245,233,0.14),rgba(255,255,255,0.96))] p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-slate-700" />
                <h2 className="text-lg font-semibold text-slate-950">What This Verifies</h2>
              </div>
              <ul className="mt-4 space-y-3">
                {checks.map((item, index) => (
                  <li key={`${item}-${index}`} className="flex items-start gap-3 text-sm leading-relaxed text-slate-700">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/80 text-[11px] font-black text-slate-700 shadow-sm">
                      {index + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-[2rem] border border-slate-200/80 bg-white/88 p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-sky-700" />
                <h2 className="text-lg font-semibold text-slate-950">Signals</h2>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {[...strengths, ...frameworks].length ? (
                  [...strengths, ...frameworks].map((item, index) => (
                    <span
                      key={`${item}-${index}`}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700"
                    >
                      {item}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-slate-600">No extra signal tags saved yet.</p>
                )}
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200/80 bg-white/88 p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-emerald-700" />
                <h2 className="text-lg font-semibold text-slate-950">Share & Inspect</h2>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Use the public record for proof sharing and the repository link for direct project inspection.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {project?.repo_url ? (
                  <a
                    href={project.repo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-900 transition-colors hover:bg-slate-100"
                  >
                    Repository
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ) : null}
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}
