import {
  Award,
  BadgeCheck,
  CalendarDays,
  ExternalLink,
  Fingerprint,
  Globe,
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
  const summary =
    certificate.certificate_payload?.summary?.explanation ||
    score?.explanation ||
    metrics?.raw_metrics_json?.summary ||
    "This certificate is backed by a saved repository analysis record inside SkillChain.";

  return (
    <section className="overflow-hidden rounded-[2.5rem] border border-border/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.97),rgba(248,250,252,0.96))] text-slate-900 shadow-[0_30px_90px_rgba(15,23,42,0.18)]">
      <div className="flex flex-col gap-6 p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" />
              Project Certificate
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Verified Project Work
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                {owner}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
                {summary}
              </p>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Verification Status
            </p>
            <div className="mt-2 flex items-center gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                  verified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                }`}
              >
                {verified ? <ShieldCheck className="h-5 w-5" /> : <ShieldEllipsis className="h-5 w-5" />}
              </div>
              <div>
                <p className="text-base font-semibold text-slate-950">
                  {verified ? "Verified" : titleCase(verificationState)}
                </p>
                <p className="text-sm text-slate-500">
                  {verified ? "Public proof confirmed." : "Awaiting final verification."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <PublicCertificateTools
          certificateId={certificate.id}
          verificationUrl={certificate.verification_url}
        />

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Repository
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                    {project?.repo_name || "Unknown Repository"}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Branch: {project?.default_branch || "default branch"}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Issued: {formatDate(certificate.created_at)}
                  </p>
                </div>

                <div className="rounded-[1.75rem] bg-slate-950 px-6 py-5 text-center text-white">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">
                    Skill Score
                  </p>
                  <p className="mt-2 text-5xl font-black">{overall}</p>
                  <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-emerald-300">
                    <Award className="h-4 w-4" />
                    {tier(overall)}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-950">
                <BadgeCheck className="h-5 w-5 text-emerald-700" />
                Score Breakdown
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {skillRows(score).map((item) => (
                  <div key={item.label} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-700">{item.label}</p>
                      <p className="text-lg font-bold text-slate-950">{item.value}</p>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-400"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-950">
                <CalendarDays className="h-5 w-5 text-emerald-700" />
                Summary
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
                <p>
                  Files analyzed:{" "}
                  <span className="font-semibold text-slate-950">
                    {metrics?.raw_metrics_json?.fileStats?.totalFiles ?? metrics?.files ?? 0}
                  </span>
                </p>
                <p>
                  Test ratio:{" "}
                  <span className="font-semibold text-slate-950">
                    {Math.round(metrics?.test_ratio ?? 0)}%
                  </span>
                </p>
                <p>
                  Analysis status:{" "}
                  <span className="font-semibold text-slate-950">
                    {titleCase(project?.analysis_status || "pending")}
                  </span>
                </p>
              </div>
            </section>

            <section className="rounded-[2rem] border border-[#a8f5e9]/35 bg-[#a8f5e9]/10 p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-950">
                <Fingerprint className="h-5 w-5 text-slate-700" />
                What This Verifies
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700">
                {checks.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-950">
                <Globe className="h-5 w-5 text-sky-700" />
                Signals
              </h2>
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

            <div className="flex flex-wrap gap-3">
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
          </div>
        </div>
      </div>
    </section>
  );
}
