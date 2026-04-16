import Link from "next/link";

const demoCertificates = [
  {
    id: "SC-2026-001",
    repo: "user/nextjs-saas",
    score: 88,
    status: "Verified on Polygon",
    issuedAt: "April 10, 2026",
    badgeClass: "bg-accent/10 text-accent border-accent/20",
  },
  {
    id: "SC-2026-002",
    repo: "user/python-api",
    score: 74,
    status: "Verification Pending",
    issuedAt: "April 8, 2026",
    badgeClass: "bg-accent-strong/10 text-accent-strong border-accent-strong/20",
  },
  {
    id: "SC-2026-003",
    repo: "user/solidity-vault",
    score: 91,
    status: "Verified on Polygon",
    issuedAt: "April 6, 2026",
    badgeClass: "bg-accent/10 text-accent border-accent/20",
  },
];

export default function CertificatesPage() {
  return (
    <main className="w-full p-6 pt-4 sm:p-8 sm:pt-4 lg:p-10 lg:pt-4 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="mb-10 space-y-3">
        <p className="inline-flex items-center rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-accent">
          Demo Certificates
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Certificate Showcase
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted">
          This is a demo certificate area for the dashboard. Later, real minted certificates
          will load here from Supabase and the verification service.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[2rem] border border-border/70 bg-surface/50 p-6 shadow-sm backdrop-blur-xl">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Issued Certificates</h2>
              <p className="mt-1 text-sm text-muted">
                Sample entries showing how certificate records will appear.
              </p>
            </div>
            <Link
              href="/submit"
              className="rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-strong"
            >
              Analyze New Repo
            </Link>
          </div>

          <div className="space-y-4">
            {demoCertificates.map((certificate) => (
              <article
                key={certificate.id}
                className="rounded-[1.5rem] border border-border/60 bg-background/70 p-5 shadow-sm transition-transform duration-300 hover:-translate-y-0.5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                      {certificate.id}
                    </p>
                    <h3 className="text-lg font-semibold text-foreground">{certificate.repo}</h3>
                    <p className="text-sm text-muted">Issued on {certificate.issuedAt}</p>
                  </div>

                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${certificate.badgeClass}`}
                  >
                    {certificate.status}
                  </span>
                </div>

                <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-muted">Skill Score</p>
                    <p className="text-3xl font-bold tracking-tight text-foreground">
                      {certificate.score}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      href={`/verify/${certificate.id}`}
                      className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent/90"
                    >
                      Open Verify Page
                    </Link>
                    <button
                      type="button"
                      className="rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-strong"
                    >
                      Download Demo
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="rounded-[2rem] border border-border/70 bg-surface/40 p-6 shadow-sm backdrop-blur-xl">
          <h2 className="text-xl font-semibold tracking-tight">What This Area Will Hold</h2>
          <div className="mt-5 space-y-4 text-sm leading-relaxed text-muted">
            <p>Real certificate cards pulled from the backend and linked to verification ids.</p>
            <p>QR code previews, certificate status, blockchain transaction references, and share actions.</p>
            <p>
              The public verification route is now available as a demo and will later be wired to
              live backend and blockchain data.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
