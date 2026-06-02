import { createClient } from "@/utils/supabase/server";

export type MetricRecord = {
  files: number | null;
  test_ratio: number | null;
  raw_metrics_json?: {
    fileStats?: {
      totalFiles?: number;
      sourceFiles?: number;
      testFiles?: number;
      docsFiles?: number;
      backendFiles?: number;
      frontendFiles?: number;
    };
    summary?: string;
  } | null;
};

export type ScoreRecord = {
  backend_score: number | null;
  architecture_score: number | null;
  documentation_score: number | null;
  confidence_score: number | null;
  explanation: string | null;
};

export type CertificateRecord = {
  id: string;
  status: string | null;
  created_at: string | null;
};

export type AnalysisJobRecord = {
  id: string;
  job_type: string;
  status: string;
  started_at: string | null;
  finished_at: string | null;
  error_message: string | null;
};

export type ProjectRecord = {
  id: string;
  repo_name: string;
  repo_url: string;
  analysis_status: string;
  default_branch: string | null;
  created_at: string;
  last_analyzed_at: string | null;
  analysis_error: string | null;
  metrics?: MetricRecord[];
  scores?: ScoreRecord[];
  certificates?: CertificateRecord[];
  analysis_jobs?: AnalysisJobRecord[];
};

export async function fetchDashboardProjects() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(
      `
      id,
      repo_name,
      repo_url,
      analysis_status,
      default_branch,
      created_at,
      last_analyzed_at,
      analysis_error,
      metrics (
        files,
        test_ratio,
        raw_metrics_json
      ),
      scores (
        backend_score,
        architecture_score,
        documentation_score,
        confidence_score,
        explanation
      ),
      certificates (
        id,
        status,
        created_at
      ),
      analysis_jobs (
        id,
        job_type,
        status,
        started_at,
        finished_at,
        error_message
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Could not load dashboard projects.");
  }

  return (data || []) as ProjectRecord[];
}
