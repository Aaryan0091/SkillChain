import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { e2eProjects, isE2ETestMode } from "@/lib/e2e-fixtures";

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
    frameworks?: string[];
    packageNames?: string[];
    signals?: Record<string, boolean>;
    readme?: {
      score?: number;
      words?: number;
      lines?: number;
      hasSetupInstructions?: boolean;
    };
    selectedFiles?: {
      path?: string;
      kind?: string;
      size?: number;
    }[];
    treeTruncated?: boolean;
    summary?: string;
  } | null;
};

export type ScoreRecord = {
  backend_score: number | null;
  architecture_score: number | null;
  documentation_score: number | null;
  confidence_score: number | null;
  explanation: string | null;
  score_breakdown_json?: {
    frontend?: number;
    codeQuality?: number;
    security?: number;
    strengths?: string[];
    risks?: string[];
    skillEvidence?: string[];
    projectType?: string;
    architectureSummary?: string;
    scoreEvidenceDetails?: Record<
      string,
      {
        signals?: string[];
        files?: {
          path?: string;
          kind?: string;
          size?: number;
        }[];
        notes?: string[];
      }
    >;
  } | null;
};

export type CertificateRecord = {
  id: string;
  status: string | null;
  created_at: string | null;
  verification_status?: string | null;
  verification_url?: string | null;
  certificate_hash?: string | null;
  blockchain_tx?: string | null;
  contract_address?: string | null;
  chain_id?: string | null;
  certificate_payload?: {
    summary?: {
      explanation?: string;
    };
    verificationBasis?: {
      scope?: string;
      basisVersion?: string;
      projectBinding?: {
        projectId?: string;
        repoUrl?: string;
        repoName?: string;
        defaultBranch?: string | null;
      };
      checks?: string[];
    };
  } | null;
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
  users?: { email?: string | null } | Array<{ email?: string | null }>;
};

export type CertificateWithProjectRecord = CertificateRecord & {
  projects?: ProjectRecord | ProjectRecord[];
};

export async function fetchDashboardProjects(userId?: string) {
  noStore();

  if (isE2ETestMode) {
    return e2eProjects;
  }

  const supabase = await createClient();
  let query = supabase
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
        explanation,
        score_breakdown_json
      ),
      certificates (
        id,
        status,
        created_at,
        verification_status
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

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message || "Could not load dashboard projects.");
  }

  return (data || []) as ProjectRecord[];
}
