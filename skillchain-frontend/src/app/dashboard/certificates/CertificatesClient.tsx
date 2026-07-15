"use client";

import Link from "next/link";
import { useEffect, useState, startTransition } from "react";
import { Trash2 } from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import EmptyStateCard from "@/components/EmptyStateCard";
import StatePanel from "@/components/StatePanel";
import { formatLongDate } from "@/lib/formatting";
import { buildSkillchainApiUrl } from "@/lib/skillchain-api";
import { resolveCertificateVerification } from "@/lib/certificate-verification";
import { createClient } from "@/utils/supabase/client";

type ScoreRecord = {
  backend_score: number | null;
  architecture_score: number | null;
  documentation_score: number | null;
  confidence_score: number | null;
};

type CertificateRecord = {
  id: string;
  status: string | null;
  created_at: string | null;
  verification_status?: string | null;
};

type ProjectRecord = {
  id: string;
  repo_name: string;
  repo_url: string;
  scores?: ScoreRecord[];
  certificates?: CertificateRecord[];
};

type PendingRemoval = {
  certificateId: string;
  projectId: string;
  repo: string;
} | null;

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
  const verification = resolveCertificateVerification(certificate);
  return {
    label: verification.headline,
    badgeClass: verification.badgeClass,
  };
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

async function fetchProjectsClient() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Please sign in again to load certificates.");
  }

  const response = await fetch(buildSkillchainApiUrl("/projects"), {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Could not load certificates.");
  }

  return (result.data || []) as ProjectRecord[];
}

async function deleteCertificateClient(certificateId: string) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Please sign in again to remove this certificate.");
  }

  const response = await fetch(
    buildSkillchainApiUrl(`/projects/certificates/${certificateId}`),
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Could not remove certificate.");
  }
}

export default function CertificatesClient() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [removingCertificateId, setRemovingCertificateId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingRemoval, setPendingRemoval] = useState<PendingRemoval>(null);

  useEffect(() => {
    let isActive = true;

    fetchProjectsClient()
      .then((data) => {
        if (!isActive) return;
        startTransition(() => {
          setProjects(data);
          setLoadError(null);
          setIsLoading(false);
        });
      })
      .catch((error) => {
        if (!isActive) return;
        startTransition(() => {
          setProjects([]);
          setLoadError(
            error instanceof Error ? error.message : "Could not load certificates."
          );
          setIsLoading(false);
        });
      });

    return () => {
      isActive = false;
    };
  }, []);

  const certificates = projects.flatMap((project) =>
    (project.certificates || []).map((certificate) => ({
      ...certificate,
      projectId: project.id,
      repo: repoLabel(project),
      score: projectScore(project),
    }))
  );

  async function confirmRemoveCertificate() {
    if (!pendingRemoval) return;

    const { certificateId, projectId } = pendingRemoval;
    setRemovingCertificateId(certificateId);
    setActionError(null);

    try {
      await deleteCertificateClient(certificateId);

      startTransition(() => {
        setProjects((currentProjects) =>
          currentProjects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  certificates: (project.certificates || []).filter(
                    (certificate) => certificate.id !== certificateId
                  ),
                }
              : project
          )
        );
        setRemovingCertificateId(null);
        setPendingRemoval(null);
      });
    } catch (error) {
      setRemovingCertificateId(null);
      setActionError(
        error instanceof Error ? error.message : "Could not remove certificate."
      );
    }
  }

  return (
    <main className="mb-16 w-full animate-in fade-in slide-in-from-bottom-4 px-4 pt-4 pb-10 duration-500 sm:px-6 sm:pb-14 lg:px-8 lg:pb-16">
      <section className="mb-10 space-y-3">
        <p className="inline-flex items-center rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-accent">
          Project Credentials
        </p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Project Certificates
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted">
          This is a secondary archive of issued project proof records. The clearest explanation still lives on each project detail page.
        </p>
        {loadError ? (
          <StatePanel
            variant="error"
            title="Could not load certificates"
            message={loadError}
          />
        ) : null}
        {actionError ? (
          <StatePanel
            variant="error"
            title="Certificate action failed"
            message={actionError}
          />
        ) : null}
      </section>

      <ConfirmModal
        open={Boolean(pendingRemoval)}
        title="Remove this certificate?"
        description={
          pendingRemoval
            ? `This will remove the issued certificate for ${pendingRemoval.repo} from your profile certificate list.`
            : ""
        }
        detail="The project record will stay saved, but this certificate row will be deleted."
        confirmLabel="Yes, remove it"
        busy={Boolean(
          pendingRemoval && removingCertificateId === pendingRemoval.certificateId
        )}
        onCancel={() => setPendingRemoval(null)}
        onConfirm={() => void confirmRemoveCertificate()}
      />

      <section className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr] lg:gap-6">
        <div className="rounded-[2rem] border border-border/70 bg-surface/50 p-6 shadow-sm backdrop-blur-xl">
          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Issued Project Certificates</h2>
              <p className="mt-1 text-sm text-muted">
                One certificate row per analyzed project, gathered here for quick access.
              </p>
            </div>
            <Link
              href="/dashboard/submit"
              className="rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-strong"
            >
              Analyze New Repo
            </Link>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-[1.5rem] border border-border/60 bg-background/70 p-5"
                >
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 w-36 rounded-full bg-white/10" />
                    <div className="h-6 w-1/2 rounded-2xl bg-white/10" />
                    <div className="h-4 w-28 rounded-full bg-white/10" />
                    <div className="h-10 rounded-2xl bg-white/8" />
                  </div>
                </div>
              ))
            ) : certificates.length ? (
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
                          Issued on {formatLongDate(certificate.created_at)}
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
                          href={`/dashboard/certificates/${certificate.id}`}
                          className="rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-strong"
                        >
                          View Certificate
                        </Link>
                        <Link
                          href={`/dashboard/projects/${certificate.projectId}`}
                          className="rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-strong"
                        >
                          View Project
                        </Link>
                        <Link
                          href={`/dashboard/verify/${certificate.id}`}
                          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent/90"
                        >
                          Open Verification Record
                        </Link>
                        <button
                          type="button"
                          onClick={() =>
                            setPendingRemoval({
                              certificateId: certificate.id,
                              projectId: certificate.projectId,
                              repo: certificate.repo,
                            })
                          }
                          disabled={removingCertificateId === certificate.id}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm font-semibold text-red-200 transition-colors hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Trash2 className="h-4 w-4" />
                          {removingCertificateId === certificate.id
                            ? "Removing..."
                            : "Remove Certificate"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <EmptyStateCard
                compact
                title="No project certificates yet"
                message="Analyze and save a repository first. Its certificate record will show up here once issued."
                actionHref="/dashboard/submit"
                actionLabel="Analyze a repository"
              />
            )}
          </div>
        </div>

        <aside className="rounded-[2rem] border border-border/70 bg-surface/40 p-6 shadow-sm backdrop-blur-xl">
          <h2 className="text-xl font-semibold tracking-tight">What This Area Shows</h2>
          <div className="mt-5 space-y-4 text-sm leading-relaxed text-muted">
            <p>One certificate record for each analyzed repository.</p>
            <p>Projects remain the primary unit. Certificates are proof attached to those projects.</p>
            <p>Separate certificate issuance and blockchain verification states.</p>
            <p>
              Direct links into the public verification route so you can inspect the recruiter-facing project proof.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
