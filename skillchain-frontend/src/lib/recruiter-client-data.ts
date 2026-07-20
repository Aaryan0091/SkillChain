"use client";

import type { ProjectRecord as DashboardProjectRecord } from "@/lib/dashboard-data";
import { e2eCandidates, e2eProjects, isE2ETestMode } from "@/lib/e2e-fixtures";
import { averageNumbers } from "@/lib/formatting";
import { buildSkillchainApiUrl } from "@/lib/skillchain-api";
import { createClient } from "@/utils/supabase/client";

export type RecruiterCandidate = {
  id: string;
  email: string | null;
  handle: string;
  label: string;
  projectCount: number;
  verifiedCertificateCount: number;
  primaryCertificateId?: string | null;
  isCurrentUser?: boolean;
};

export function repoLabel(project: DashboardProjectRecord) {
  if (project.repo_name?.trim()) return project.repo_name;

  try {
    const url = new URL(project.repo_url);
    return url.pathname.replace(/^\/+/, "") || project.repo_url;
  } catch {
    return project.repo_url;
  }
}

export function scoreAverage(project: DashboardProjectRecord) {
  return (
    averageNumbers([
      project.scores?.[0]?.backend_score,
      project.scores?.[0]?.architecture_score,
      project.scores?.[0]?.documentation_score,
      project.scores?.[0]?.confidence_score,
      project.scores?.[0]?.score_breakdown_json?.frontend ?? null,
      project.scores?.[0]?.score_breakdown_json?.codeQuality ?? null,
      project.scores?.[0]?.score_breakdown_json?.security ?? null,
    ]) ?? 0
  );
}

export function aggregateCounts(items: string[]) {
  const counts = new Map<string, number>();
  for (const item of items) {
    const trimmed = item?.trim();
    if (!trimmed) continue;
    counts.set(trimmed, (counts.get(trimmed) || 0) + 1);
  }
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
}

export function isRecruiterReadyProject(project: DashboardProjectRecord) {
  return (
    project.analysis_status === "completed" ||
    Boolean(project.scores?.length) ||
    Boolean(project.metrics?.length) ||
    Boolean(project.certificates?.length)
  );
}

export async function fetchProjectsClient(candidateId?: string, signal?: AbortSignal) {
  if (isE2ETestMode) {
    const candidate =
      e2eCandidates.find((entry) => entry.id === candidateId) || e2eCandidates[0];

    return {
      candidate,
      projects: e2eProjects,
    };
  }

  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Please sign in again to load recruiter project data.");
  }

  const endpoint = candidateId
    ? `/projects/recruiter/candidates/${candidateId}/projects`
    : "/projects";
  const response = await fetch(buildSkillchainApiUrl(endpoint), {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    cache: "no-store",
    signal,
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Could not load recruiter project data.");
  }

  if (candidateId) {
    return result.data as {
      candidate: RecruiterCandidate;
      projects: DashboardProjectRecord[];
    };
  }

  return {
    candidate: null,
    projects: (result.data || []) as DashboardProjectRecord[],
  };
}

export async function searchCandidatesClient(searchTerm: string, signal?: AbortSignal) {
  if (isE2ETestMode) {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return e2eCandidates.filter((candidate) => {
      if (!normalizedSearch) return true;

      return [candidate.label, candidate.handle, candidate.email]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(normalizedSearch));
    });
  }

  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Please sign in again to search candidate profiles.");
  }

  const params = new URLSearchParams();
  if (searchTerm.trim()) {
    params.set("search", searchTerm.trim());
  }
  params.set("limit", "8");

  const response = await fetch(
    buildSkillchainApiUrl(`/projects/recruiter/candidates?${params.toString()}`),
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      cache: "no-store",
      signal,
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Could not search candidate profiles.");
  }

  return (result.data || []) as RecruiterCandidate[];
}
