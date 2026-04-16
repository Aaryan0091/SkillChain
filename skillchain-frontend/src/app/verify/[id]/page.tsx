import Link from "next/link";
import BackButton from "@/components/BackButton";

type VerifyPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const demoCertificateMap: Record<
  string,
  {
    owner: string;
    username: string;
    repo: string;
    score: number;
    skills: {
      label: string;
      value: number;
    }[];
    stats: {
      label: string;
      value: string;
      note: string;
    }[];
    status: "VERIFIED ON POLYGON" | "VERIFICATION PENDING";
    tx: string;
    issuedAt: string;
    summary: string;
    progress: string[];
    achievements: string[];
  }
> = {
  "SC-2026-001": {
    owner: "Aaryan Gupta",
    username: "aaryan",
    repo: "user/nextjs-saas",
    score: 88,
    skills: [
      { label: "Frontend Systems", value: 92 },
      { label: "Architecture", value: 89 },
      { label: "Documentation", value: 84 },
      { label: "Backend Readiness", value: 81 },
    ],
    stats: [
      { label: "Repositories Analyzed", value: "12", note: "Full-stack and frontend project set" },
      { label: "Certificates Issued", value: "8", note: "7 already verified on Polygon" },
      { label: "Commits Reviewed", value: "1,426", note: "Across scanned repositories" },
      { label: "Skill Consistency", value: "91%", note: "Stable performance across recent scans" },
    ],
    status: "VERIFIED ON POLYGON",
    tx: "0x8d31...9fc2",
    issuedAt: "April 10, 2026",
    summary:
      "This certificate is a demo record showing how SkillChain AI will verify score data against a Polygon hash.",
    progress: [
      "12 repositories analyzed across full-stack and frontend projects",
      "Architecture score improved steadily over the last 3 scan cycles",
      "Documentation quality moved from acceptable to recruiter-ready",
    ],
    achievements: [
      "Verified Polygon-backed certificate issued",
      "High-signal repository structure and modular frontend patterns",
      "Consistent project delivery across multiple demo repositories",
    ],
  },
  "SC-2026-002": {
    owner: "Demo Candidate",
    username: "demo-candidate",
    repo: "user/python-api",
    score: 74,
    skills: [
      { label: "Backend APIs", value: 82 },
      { label: "Architecture", value: 72 },
      { label: "Documentation", value: 68 },
      { label: "Testing", value: 64 },
    ],
    stats: [
      { label: "Repositories Analyzed", value: "6", note: "Mostly backend service work" },
      { label: "Certificates Issued", value: "3", note: "1 awaiting on-chain anchoring" },
      { label: "Commits Reviewed", value: "684", note: "API and service-layer activity" },
      { label: "Skill Consistency", value: "76%", note: "Good backend strength, moderate docs/test variance" },
    ],
    status: "VERIFICATION PENDING",
    tx: "Awaiting blockchain write",
    issuedAt: "April 8, 2026",
    summary:
      "This demo record represents a certificate that has been issued in the app but has not yet been anchored on-chain.",
    progress: [
      "Backend API analysis completed successfully",
      "Testing signals were detected but need deeper coverage",
      "Documentation and deployment readiness are improving",
    ],
    achievements: [
      "API design competency recognized in repository analysis",
      "Certificate issued and awaiting final on-chain anchoring",
      "Demonstrated maintainable service-layer structure",
    ],
  },
  "SC-2026-003": {
    owner: "Demo Builder",
    username: "demo-builder",
    repo: "user/solidity-vault",
    score: 91,
    skills: [
      { label: "Smart Contracts", value: 95 },
      { label: "System Design", value: 90 },
      { label: "Backend Logic", value: 88 },
      { label: "Documentation", value: 79 },
    ],
    stats: [
      { label: "Repositories Analyzed", value: "15", note: "Blockchain and systems-heavy portfolio" },
      { label: "Certificates Issued", value: "11", note: "All public records verified" },
      { label: "Commits Reviewed", value: "2,038", note: "Strong build velocity across projects" },
      { label: "Skill Consistency", value: "94%", note: "High performance maintained across categories" },
    ],
    status: "VERIFIED ON POLYGON",
    tx: "0x4ab2...cc10",
    issuedAt: "April 6, 2026",
    summary:
      "This certificate demonstrates the recruiter-facing legitimacy check for a strong verified repository analysis result.",
    progress: [
      "Strong full-stack and smart contract scoring across recent submissions",
      "Repository complexity and architecture consistency are both high",
      "Skill profile is stable across blockchain and backend work",
    ],
    achievements: [
      "Top demo score among currently exposed public certificates",
      "Verified blockchain reference already available",
      "Clear evidence of contract and systems engineering depth",
    ],
  },
};

const aliasMap: Record<string, string> = {
  aaryan: "SC-2026-001",
  "demo-candidate": "SC-2026-002",
  "demo-builder": "SC-2026-003",
};

export default async function VerifyCertificatePage({ params }: VerifyPageProps) {
  const { id } = await params;
  const normalizedId = aliasMap[id.toLowerCase()] ?? id;
  const certificate = demoCertificateMap[normalizedId];

  if (!certificate) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-6 py-20 text-center">
        <BackButton href="/verify" text="Back to Verify" />
        <p className="rounded-full border border-accent-strong/20 bg-accent-strong/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-accent-strong">
          Certificate Not Found
        </p>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight">No certificate matches this ID</h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
          This public verification area is live, but the provided certificate ID is not present in
          the current demo dataset.
        </p>
        <Link
          href="/verify"
          className="mt-8 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent/90"
        >
          Open Verify Hub
        </Link>
      </main>
    );
  }

  const isVerified = certificate.status === "VERIFIED ON POLYGON";

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-16 sm:px-10 lg:px-12">
      <BackButton href="/verify" text="Back to Verify" />
      <div className="mx-auto max-w-4xl rounded-[2.5rem] border border-border/70 bg-surface/60 p-8 shadow-xl backdrop-blur-2xl sm:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
              Public Skill Dashboard
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {certificate.owner}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
              This public dashboard shows the verified skill profile, progress, achievements, and
              certificate status for the searched developer.
            </p>
          </div>

          <span
            className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${
              isVerified
                ? "border-accent/20 bg-accent/10 text-accent"
                : "border-accent-strong/20 bg-accent-strong/10 text-accent-strong"
            }`}
          >
            {certificate.status}
          </span>
        </div>

        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <article className="rounded-[2rem] border border-border/60 bg-background/70 p-6">
            <h2 className="text-lg font-semibold tracking-tight">Profile Summary</h2>
            <div className="mt-5 space-y-4 text-sm text-muted">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Owner</p>
                <p className="mt-1 text-base font-medium text-foreground">{certificate.owner}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Username</p>
                <p className="mt-1 text-base font-medium text-foreground">{certificate.username}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Certificate ID</p>
                <p className="mt-1 text-base font-medium text-foreground">{normalizedId}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Repository</p>
                <p className="mt-1 text-base font-medium text-foreground">{certificate.repo}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Issued</p>
                <p className="mt-1 text-base font-medium text-foreground">{certificate.issuedAt}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Skill Score</p>
                <p className="mt-1 text-4xl font-bold tracking-tight text-foreground">
                  {certificate.score}
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-[2rem] border border-border/60 bg-background/70 p-6">
            <h2 className="text-lg font-semibold tracking-tight">Verification Result</h2>
            <div className="mt-5 space-y-4 text-sm leading-relaxed text-muted">
              <p>{certificate.summary}</p>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Polygon Reference</p>
                <p className="mt-1 break-all font-medium text-foreground">{certificate.tx}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Current Check</p>
                <p className="mt-1 font-medium text-foreground">
                  {isVerified
                    ? "The demo certificate data matches the stored verification state."
                    : "This demo certificate has not completed blockchain anchoring yet."}
                </p>
              </div>
            </div>
          </article>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {certificate.stats.map((stat) => (
            <article
              key={stat.label}
              className="rounded-[1.5rem] border border-border/60 bg-background/70 p-5"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-muted">{stat.label}</p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">{stat.value}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{stat.note}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-[2rem] border border-border/60 bg-background/60 p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Skill Overview</h2>
              <p className="mt-1 text-sm text-muted">
                Public skill breakdown extracted from this developer&apos;s repository work.
              </p>
            </div>
            <p className="text-sm font-semibold text-accent">Overall score: {certificate.score}</p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {certificate.skills.map((skill) => (
              <article
                key={skill.label}
                className="rounded-[1.5rem] border border-border/50 bg-surface/60 p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-foreground">{skill.label}</p>
                  <p className="text-2xl font-bold tracking-tight text-foreground">{skill.value}</p>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-border/50">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent to-accent-strong"
                    style={{ width: `${skill.value}%` }}
                  />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <article className="rounded-[2rem] border border-border/60 bg-background/60 p-6">
            <h2 className="text-lg font-semibold tracking-tight">Progress</h2>
            <div className="mt-4 space-y-3">
              {certificate.progress.map((item) => (
                <p key={item} className="rounded-2xl border border-border/50 bg-surface/60 p-4 text-sm leading-relaxed text-muted">
                  {item}
                </p>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] border border-border/60 bg-background/60 p-6">
            <h2 className="text-lg font-semibold tracking-tight">Achievements</h2>
            <div className="mt-4 space-y-3">
              {certificate.achievements.map((item) => (
                <p key={item} className="rounded-2xl border border-border/50 bg-surface/60 p-4 text-sm leading-relaxed text-muted">
                  {item}
                </p>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-8 rounded-[2rem] border border-border/60 bg-background/60 p-6">
          <h2 className="text-lg font-semibold tracking-tight">Try Another Demo Profile Or ID</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/verify/SC-2026-001"
              className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-strong"
            >
              SC-2026-001
            </Link>
            <Link
              href="/verify/SC-2026-002"
              className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-strong"
            >
              SC-2026-002
            </Link>
            <Link
              href="/verify/SC-2026-003"
              className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-strong"
            >
              SC-2026-003
            </Link>
            <Link
              href="/verify/aaryan"
              className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-strong"
            >
              aaryan
            </Link>
            <Link
              href="/verify/demo-candidate"
              className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-strong"
            >
              demo-candidate
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
