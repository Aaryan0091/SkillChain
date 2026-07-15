"use client";

import Link from "next/link";
import { startTransition, useEffect, useState } from "react";
import {
  ArrowUpRight,
  Clock3,
  ExternalLink,
  Fingerprint,
  GitBranch,
  Radar,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import EmptyStateCard from "@/components/EmptyStateCard";
import StatePanel from "@/components/StatePanel";
import { resolveCertificateVerification } from "@/lib/certificate-verification";
import type { ProjectRecord } from "@/lib/dashboard-data";
import { formatLongDate } from "@/lib/formatting";
import { buildSkillchainApiUrl } from "@/lib/skillchain-api";
import { statusTone } from "@/lib/status";
import { createClient } from "@/utils/supabase/client";

function repoLabel(project: ProjectRecord) {
  if (project.repo_name?.trim()) return project.repo_name;

  try {
    const url = new URL(project.repo_url);
    return url.pathname.replace(/^\/+/, "") || project.repo_url;
  } catch {
    return project.repo_url;
  }
}

function projectStatusLabel(project: ProjectRecord) {
  switch (project.analysis_status) {
    case "completed":
      return project.certificates?.length ? "Certificate ready" : "Stable";
    case "processing":
      return "Analyzing";
    case "failed":
      return "Needs retry";
    default:
      return "Queued";
  }
}

function overallScore(project: ProjectRecord) {
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
    throw new Error("Please sign in again to load projects.");
  }

  const response = await fetch(buildSkillchainApiUrl("/projects"), {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Could not load projects.");
  }

  return (result.data || []) as ProjectRecord[];
}

async function deleteProjectClient(projectId: string) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Please sign in again to remove this project.");
  }

  const response = await fetch(buildSkillchainApiUrl(`/projects/${projectId}`), {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Could not remove project.");
  }
}

export default function ProjectsClient({
  initialProjects = [],
}: {
  initialProjects?: ProjectRecord[];
}) {
  const hasInitialProjects = initialProjects.length > 0;
  const [projects, setProjects] = useState<ProjectRecord[]>(initialProjects);
  const [isLoading, setIsLoading] = useState(!hasInitialProjects);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingRemoval, setPendingRemoval] = useState<{
    projectId: string;
    repo: string;
  } | null>(null);
  const [removingProjectId, setRemovingProjectId] = useState<string | null>(null);

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
          if (!hasInitialProjects) {
            setProjects([]);
          }
          setLoadError(error instanceof Error ? error.message : "Could not load projects.");
          setIsLoading(false);
        });
      });

    return () => {
      isActive = false;
    };
  }, [hasInitialProjects]);

  async function confirmRemoveProject() {
    if (!pendingRemoval) return;

    setRemovingProjectId(pendingRemoval.projectId);
    setActionError(null);

    try {
      await deleteProjectClient(pendingRemoval.projectId);
      startTransition(() => {
        setProjects((current) =>
          current.filter((project) => project.id !== pendingRemoval.projectId)
        );
        setPendingRemoval(null);
        setRemovingProjectId(null);
      });
    } catch (error) {
      setRemovingProjectId(null);
      setActionError(
        error instanceof Error ? error.message : "Could not remove project."
      );
    }
  }

  return (
    <main className="w-full px-4 pb-12 pt-4 sm:px-6 sm:pb-14 lg:px-8 lg:pb-16">
      <ConfirmModal
        open={Boolean(pendingRemoval)}
        title="Remove this saved repository?"
        description={
          pendingRemoval
            ? `This will remove ${pendingRemoval.repo} from your saved projects list.`
            : ""
        }
        detail="Its linked saved metrics, scores, jobs, and certificate records will also be deleted."
        confirmLabel="Yes, remove it"
        busy={Boolean(removingProjectId)}
        onCancel={() => setPendingRemoval(null)}
        onConfirm={() => void confirmRemoveProject()}
      />

      <section className="mb-8 space-y-3">
        <p className="inline-flex items-center rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-accent">
          Saved Repositories
        </p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Projects
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted">
          This page lists all analyzed repositories saved to your account. Open any project for full details, attached certificate proof, and public verification links.
        </p>
        {loadError ? (
          <StatePanel
            variant="error"
            title="Could not load projects"
            message={loadError}
          />
        ) : null}
        {actionError ? (
          <StatePanel
            variant="error"
            title="Project action failed"
            message={actionError}
          />
        ) : null}
      </section>

      <section className="rounded-[2rem] border border-border/70 bg-surface/40 p-5 shadow-sm backdrop-blur-xl sm:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-white">
              All saved projects
            </h2>
            <p className="mt-1 text-sm text-muted">
              Repositories are the primary records. Certificates stay attached to them as proof.
            </p>
          </div>
          <Link
            href="/dashboard/submit"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Analyze new repo
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[1.6rem] border border-white/10 bg-background/45 p-5"
              >
                <div className="animate-pulse space-y-4">
                  <div className="h-4 w-32 rounded-full bg-white/10" />
                  <div className="h-8 w-2/3 rounded-2xl bg-white/10" />
                  <div className="h-5 w-full rounded-full bg-white/8" />
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="h-10 rounded-2xl bg-white/8" />
                    <div className="h-10 rounded-2xl bg-white/8" />
                    <div className="h-10 rounded-2xl bg-white/8" />
                  </div>
                </div>
              </div>
            ))
          ) : projects.length ? (
            projects.map((project) => {
              const score = overallScore(project);
              const certificate = project.certificates?.[0] ?? null;
              const verification = certificate
                ? resolveCertificateVerification(certificate)
                : null;

              return (
                <article
                  key={project.id}
                  className="rounded-[1.6rem] border border-white/10 bg-background/45 p-5"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                          {repoLabel(project)}
                        </p>
                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold ${statusTone(projectStatusLabel(project), {
                            Stable: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
                            "Certificate ready": "border-amber-400/20 bg-amber-400/10 text-amber-300",
                            Analyzing: "border-sky-400/20 bg-sky-400/10 text-sky-300",
                            "Needs retry": "border-red-400/20 bg-red-400/10 text-red-300",
                            Queued: "border-white/10 bg-white/5 text-white/75",
                          })}`}
                        >
                          <Clock3 className="h-3.5 w-3.5" />
                          {projectStatusLabel(project)}
                        </span>
                        {verification ? (
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold ${verification.badgeClass}`}
                          >
                            {verification.badgeLabel}
                          </span>
                        ) : null}
                      </div>

                      <h3 className="mt-3 text-2xl font-semibold text-white">
                        {repoLabel(project)}
                      </h3>
                      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
                        {project.scores?.[0]?.explanation ||
                          project.metrics?.[0]?.raw_metrics_json?.summary ||
                          project.analysis_error ||
                          "This saved project is ready to be explored in more detail."}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                          <GitBranch className="h-4 w-4 text-accent" />
                          {project.default_branch || "default branch"}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                          <Radar className="h-4 w-4 text-accent" />
                          {score ?? "—"} overall score
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                          <Clock3 className="h-4 w-4 text-accent" />
                          Last analyzed {formatLongDate(project.last_analyzed_at || project.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="flex w-full flex-col gap-3 lg:w-auto lg:min-w-[220px]">
                      <Link
                        href={`/dashboard/projects/${project.id}`}
                        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent/90"
                      >
                        Open project
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                      {certificate ? (
                        <Link
                          href={`/dashboard/verify/${certificate.id}`}
                          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent/15"
                        >
                          Open public verify
                          <ShieldCheck className="h-4 w-4" />
                        </Link>
                      ) : null}
                      <a
                        href={project.repo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                      >
                        View repository
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() =>
                          setPendingRemoval({
                            projectId: project.id,
                            repo: repoLabel(project),
                          })
                        }
                        disabled={removingProjectId === project.id}
                        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm font-semibold text-red-200 transition-colors hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Trash2 className="h-4 w-4" />
                        {removingProjectId === project.id ? "Removing..." : "Remove"}
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted">Certificates</p>
                      <p className="mt-2 text-2xl font-semibold text-white">
                        {project.certificates?.length || 0}
                      </p>
                    </div>
                    <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted">Jobs recorded</p>
                      <p className="mt-2 text-2xl font-semibold text-white">
                        {project.analysis_jobs?.length || 0}
                      </p>
                    </div>
                    <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted">Primary certificate ID</p>
                      <p className="mt-2 break-all text-sm font-mono text-white/85">
                        {certificate?.id || "Not issued yet"}
                      </p>
                    </div>
                  </div>

                  {certificate ? (
                    <div className="mt-4 rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                      <div className="flex items-start gap-3">
                        <Fingerprint className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                        <p className="text-sm leading-relaxed text-muted">
                          {verification?.summary}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })
          ) : (
            <EmptyStateCard
              title="No saved projects yet"
              message="Analyze your first repository to start building your project list."
              actionHref="/dashboard/submit"
              actionLabel="Analyze a repository"
            />
          )}
        </div>
      </section>
    </main>
  );
}
