import Link from "next/link";
import { fetchDashboardProjects, type ProjectRecord } from "@/lib/dashboard-data";

function repoLabel(project: ProjectRecord) {
  if (project.repo_name?.trim()) return project.repo_name;

  try {
    const url = new URL(project.repo_url);
    return url.pathname.replace(/^\/+/, "") || project.repo_url;
  } catch {
    return project.repo_url;
  }
}

function certificateStatus(certificate: CertificateRecord) {
  if (certificate.status === "verified") {
    return {
      label: "Verified on Polygon",
      badgeClass: "bg-accent/10 text-accent border-accent/20",
    };
  }

  if (certificate.status === "failed") {
    return {
      label: "Verification Failed",
      badgeClass: "bg-red-500/10 text-red-300 border-red-400/20",
    };
  }

  return {
    label: "Verification Pending",
    badgeClass: "bg-accent-strong/10 text-accent-strong border-accent-strong/20",
  };
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

function projectScore(project: ProjectRecord) {
  const score = project.scores?.[0];
  if (!score) return null;

  const values = [
    score.backend_score,
    score.architecture_score,
    score.documentation_score,
    score.confidence_score,
  ].filter((value): value is number => typeof value === "number");

  if (!values.length) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

async function fetchProjects() {
  return fetchDashboardProjects() as Promise<ProjectRecord[]>;
}

export default async function CertificatesPage() {
  let projects: ProjectRecord[] = [];
  let loadError: string | null = null;

  try {
    projects = await fetchProjects();
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Could not load certificates.";
  }

  const certificates = projects.flatMap((project) =>
    (project.certificates || []).map((certificate) => ({
      ...certificate,
      repo: repoLabel(project),
      score: projectScore(project),
    }))
  );

  return (
    <main className="mb-16 w-full animate-in fade-in slide-in-from-bottom-4 px-4 pt-4 pb-10 duration-500 sm:px-6 sm:pb-14 lg:px-8 lg:pb-16">
      <section className="mb-10 space-y-3">
        <p className="inline-flex items-center rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-accent">
          Live Certificates
        </p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Certificate Showcase
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted">
          Saved certificate records from your analyzed projects are listed here with their current verification state.
        </p>
        {loadError ? (
          <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {loadError}
          </p>
        ) : null}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr] lg:gap-6">
        <div className="rounded-[2rem] border border-border/70 bg-surface/50 p-6 shadow-sm backdrop-blur-xl">
          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Issued Certificates</h2>
              <p className="mt-1 text-sm text-muted">
                These cards reflect the certificate rows saved for your real projects.
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
            {certificates.length ? (
              certificates.map((certificate) => {
                const status = certificateStatus(certificate);

                return (
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
                        <p className="text-sm text-muted">
                          Issued on {formatDate(certificate.created_at)}
                        </p>
                      </div>

                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${status.badgeClass}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-muted">Skill Score</p>
                        <p className="text-3xl font-bold tracking-tight text-foreground">
                          {certificate.score ?? "—"}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Link
                          href={`/verify/${certificate.id}`}
                          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent/90"
                        >
                          Open Verify Page
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="rounded-[1.5rem] border border-border/60 bg-background/70 p-5 text-sm text-muted">
                No certificate records yet. Analyze a repository first to create a saved certificate row.
              </div>
            )}
          </div>
        </div>

        <aside className="rounded-[2rem] border border-border/70 bg-surface/40 p-6 shadow-sm backdrop-blur-xl">
          <h2 className="text-xl font-semibold tracking-tight">What This Area Shows</h2>
          <div className="mt-5 space-y-4 text-sm leading-relaxed text-muted">
            <p>Real certificate cards pulled from saved backend records.</p>
            <p>Current verification state from the certificate row, including pending and verified states.</p>
            <p>
              Direct links into the public verify route so you can inspect the recruiter-facing record.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
