import Link from "next/link";
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
  const summary =
    certificate.certificate_payload?.summary?.explanation ||
    score?.explanation ||
    metrics?.raw_metrics_json?.summary ||
    "This certificate is backed by a saved repository analysis record inside SkillChain.";

  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-border/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(247,250,252,0.94))] text-slate-900 shadow-[0_30px_90px_rgba(15,23,42,0.2)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.18),transparent_28%),radial-gradient(circle_at_85%_15%,rgba(14,165,233,0.12),transparent_22%),linear-gradient(180deg,rgba(15,23,42,0.04),transparent_45%)]" />
      <div className="absolute inset-x-8 top-7 h-px bg-gradient-to-r from-transparent via-slate-300/80 to-transparent" />
      <div className="absolute inset-x-8 bottom-7 h-px bg-gradient-to-r from-transparent via-slate-300/80 to-transparent" />

      <div className="relative flex flex-col gap-8 p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" />
              SkillChain Verified Credential
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">
                Certificate of Repository Skill Proof
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-[2.8rem]">
                {owner}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
                {summary}
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white/80 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              Verification State
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                  verified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                }`}
              >
                {verified ? <ShieldCheck className="h-6 w-6" /> : <ShieldEllipsis className="h-6 w-6" />}
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-950">
                  {verified ? "Verified" : titleCase(verificationState)}
                </p>
                <p className="text-sm text-slate-500">
                  {verified ? "Public proof record is confirmed." : "Certificate is saved and awaiting final verification."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white/75 p-6 shadow-sm">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                    Repository Evaluated
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                    {project?.repo_name || "Unknown Repository"}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Branch: {project?.default_branch || "default branch"}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      Issued
                    </p>
                    <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <CalendarDays className="h-4 w-4 text-emerald-700" />
                      {formatDate(certificate.created_at)}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      Certificate ID
                    </p>
                    <p className="mt-2 break-all text-sm font-semibold text-slate-900">
                      {certificate.id}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex min-w-[220px] flex-col items-center rounded-[2rem] border border-slate-200 bg-slate-950 px-6 py-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">
                  Composite Score
                </p>
                <p className="mt-3 text-6xl font-black tracking-tight">{overall}</p>
                <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-emerald-300">
                  <Award className="h-4 w-4" />
                  {tier(overall)}
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {skillRows(score).map((item) => (
                <div key={item.label} className="rounded-[1.5rem] border border-slate-200 bg-white px-4 py-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-700">{item.label}</p>
                    <p className="text-xl font-bold text-slate-950">{item.value}</p>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-sky-400"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[2rem] border border-slate-200 bg-white/75 p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-950">
                <BadgeCheck className="h-5 w-5 text-emerald-700" />
                Proof Summary
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
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white/75 p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-950">
                <Fingerprint className="h-5 w-5 text-slate-700" />
                Verification Metadata
              </h2>
              <div className="mt-4 space-y-4 text-sm">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Hash / Reference</p>
                  <p className="mt-2 break-all rounded-[1rem] border border-slate-200 bg-slate-50 px-3 py-3 font-mono text-[12px] text-slate-700">
                    {certificate.blockchain_tx || certificate.certificate_hash || "Pending reference"}
                  </p>
                </div>
                {certificate.chain_id ? (
                  <p className="text-slate-600">
                    Chain ID: <span className="font-semibold text-slate-950">{certificate.chain_id}</span>
                  </p>
                ) : null}
                {certificate.contract_address ? (
                  <p className="break-all text-slate-600">
                    Contract:{" "}
                    <span className="font-semibold text-slate-950">{certificate.contract_address}</span>
                  </p>
                ) : null}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white/75 p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-950">
                <Globe className="h-5 w-5 text-sky-700" />
                Signals Captured
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
            </div>
          </div>
        </div>

        <footer className="flex flex-col gap-4 border-t border-slate-200 pt-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-slate-950">Issued by SkillChain</p>
            <p>Developer skills verified from repository evidence and saved project analysis.</p>
          </div>

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
            <Link
              href={`/verify/${certificate.id}`}
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Public Verify Page
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </footer>
      </div>
    </section>
  );
}
