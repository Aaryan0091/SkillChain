import Link from "next/link";
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

const overviewStats = [
  {
    label: "Repositories analyzed",
    value: "12",
    detail: "+2 this week",
    accent: "from-emerald-400/35 to-transparent",
  },
  {
    label: "Certificates minted",
    value: "8",
    detail: "7 verified on Polygon",
    accent: "from-amber-400/35 to-transparent",
  },
  {
    label: "Active queue",
    value: "1",
    detail: "1 scan in progress",
    accent: "from-sky-400/35 to-transparent",
  },
];

const capabilityBands = [
  { name: "Architecture", score: 91 },
  { name: "Backend", score: 84 },
  { name: "Documentation", score: 72 },
  { name: "Security", score: 78 },
];

const liveProjects = [
  {
    repo: "nextjs-saas-platform",
    branch: "main",
    status: "Stable",
    score: 88,
    summary: "Strong modular frontend shell with consistent route boundaries and clean deployment setup.",
  },
  {
    repo: "python-api-service",
    branch: "staging",
    status: "Ready for cert",
    score: 74,
    summary: "Backend structure is solid, but tests and validation coverage still leave confidence on the table.",
  },
  {
    repo: "defi-smart-contracts",
    branch: "audit-pass-2",
    status: "Analyzing",
    score: null,
    summary: "Current run is extracting contract structure, deployment traces, and documentation evidence.",
  },
];

const queue = [
  {
    step: "Metadata sync",
    state: "Complete",
    note: "Repo tree, languages, and branch details were pulled successfully.",
  },
  {
    step: "Signal extraction",
    state: "Running",
    note: "Selected files are being scored for architecture, docs, tests, and implementation strength.",
  },
  {
    step: "Certificate prep",
    state: "Waiting",
    note: "Certificate payload generation will unlock when this run clears scoring.",
  },
];

const recentCertificates = [
  {
    id: "SC-2026-001",
    repo: "nextjs-saas-platform",
    status: "Verified",
    issuedAt: "10 Apr 2026",
  },
  {
    id: "SC-2026-002",
    repo: "python-api-service",
    status: "Pending",
    issuedAt: "08 Apr 2026",
  },
];

export default function DashboardPage() {
  return (
    <main className="w-full px-6 pb-16 pt-4 sm:px-8 lg:px-10">
      <section className="relative overflow-hidden rounded-[2.5rem] border border-border/70 bg-surface/50 shadow-[0_24px_70px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.16),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(245,158,11,0.16),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.03),transparent_58%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <div className="relative grid gap-8 px-6 py-7 sm:px-8 xl:grid-cols-[1.45fr_0.9fr]">
          <div className="space-y-8">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-accent">
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Command Deck
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-muted">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Certificate system online
              </span>
            </div>

            <div className="max-w-3xl space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Your repo intelligence, arranged like a real control room.
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-muted">
                Track what is cert-ready, what still needs stronger evidence, and where the current scan queue is spending its time.
              </p>
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
                      <span className="text-4xl font-semibold tracking-tight text-white">{stat.value}</span>
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
                  defi-smart-contracts
                </h2>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
                <Clock3 className="h-3.5 w-3.5" />
                Analyzing
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
                  Contract structure and deployment scripts look strong already. The current pass is mostly deciding how much confidence to assign to test evidence and docs quality.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-[1.3fr_0.9fr]">
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
              {liveProjects.map((project) => (
                <article
                  key={project.repo}
                  className="grid gap-5 px-6 py-5 md:grid-cols-[1.2fr_0.7fr_160px]"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">{project.repo}</h3>
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
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                        project.status === "Stable"
                          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                          : project.status === "Ready for cert"
                            ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
                            : "border-sky-400/20 bg-sky-400/10 text-sky-300"
                      }`}
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
              ))}
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
                  <div key={item.step} className="rounded-[1.35rem] border border-white/8 bg-background/40 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-medium text-white">{item.step}</p>
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
                  <p className="mt-3 text-3xl font-semibold tracking-tight text-white">A-</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    The current portfolio reads as coherent rather than scattered, which is exactly what recruiters notice first.
                  </p>
                </div>
                <div className="rounded-[1.4rem] border border-white/8 bg-background/40 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <Award className="h-4 w-4 text-amber-300" />
                    Verification readiness
                  </div>
                  <p className="mt-3 text-3xl font-semibold tracking-tight text-white">82%</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    Strong enough to showcase publicly, but still improved by more tests and crisper docs in the current queue.
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
              {[
                "Run one more scan after the DeFi repo docs update lands.",
                "Generate the next certificate once current queue clears scoring.",
                "Push a stronger testing story into the API service repo.",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.3rem] border border-white/8 bg-background/35 px-4 py-3 text-sm leading-relaxed text-muted"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-border/70 bg-surface/40 p-6 shadow-sm backdrop-blur-xl">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Code2 className="h-4 w-4 text-amber-300" />
              Recent certificates
            </div>
            <div className="mt-5 space-y-4">
              {recentCertificates.map((certificate) => (
                <div
                  key={certificate.id}
                  className="rounded-[1.4rem] border border-white/8 bg-background/40 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted">{certificate.id}</p>
                      <p className="mt-1 font-medium text-white">{certificate.repo}</p>
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
              ))}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
