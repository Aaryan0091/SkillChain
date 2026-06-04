const crypto = require("node:crypto");
const { getSupabaseAdminClient } = require("../lib/supabase");

function buildMetricsPayload(analysis) {
  const { basis, deterministic } = analysis;
  const { fileStats } = basis;

  return {
    lines_of_code: 0,
    files: fileStats.totalFiles,
    commits: 0,
    complexity_score: analysis.scores.architecture,
    tech_score: analysis.scores.frontend,
    docs_score: analysis.scores.documentation,
    test_ratio:
      fileStats.totalFiles > 0
        ? Number(((fileStats.testFiles / fileStats.totalFiles) * 100).toFixed(2))
        : 0,
    raw_metrics_json: {
      analysisVersion: analysis.analysisVersion,
      githubLanguages: basis.githubLanguages,
      fileStats,
      frameworks: deterministic.frameworks,
      packageNames: deterministic.packageNames,
      signals: deterministic.signals,
      selectedFiles: basis.selectedFiles,
      summary: analysis.summary,
    },
  };
}

function buildScoresPayload(analysis) {
  return {
    backend_score: analysis.scores.backend,
    architecture_score: analysis.scores.architecture,
    documentation_score: analysis.scores.documentation,
    confidence_score: analysis.scores.confidence,
    scoring_version: "v1",
    explanation: analysis.summary,
    score_breakdown_json: {
      analysisVersion: analysis.analysisVersion,
      frontend: analysis.scores.frontend,
      codeQuality: analysis.scores.codeQuality,
      security: analysis.scores.security,
      strengths: analysis.nlp.strengths,
      risks: analysis.nlp.risks,
      skillEvidence: analysis.nlp.skillEvidence,
    },
  };
}

function buildCertificatePayload({ projectId, userId, analysis, frontendUrl }) {
  const certificateId = crypto.randomUUID();
  const issuedAt = new Date().toISOString();
  const verificationUrl = frontendUrl
    ? `${frontendUrl.replace(/\/$/, "")}/verify/${certificateId}`
    : null;

  const payload = {
    certificateId,
    projectId,
    userId,
    repoUrl: analysis.repo.htmlUrl,
    repoName: analysis.repo.fullName,
    analysisVersion: "v1",
    scoringVersion: "v1",
    certificatePayloadVersion: "v1",
    issuedAt,
    scores: {
      backendScore: analysis.scores.backend,
      architectureScore: analysis.scores.architecture,
      documentationScore: analysis.scores.documentation,
      confidenceScore: analysis.scores.confidence,
    },
    summary: {
      explanation: analysis.summary,
    },
    verification: {
      verificationUrl,
    },
  };

  const certificateHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");

  return {
    id: certificateId,
    certificate_payload: payload,
    certificate_payload_version: "v1",
    certificate_hash: certificateHash,
    verification_url: verificationUrl,
    status: "pending",
    verification_status: "pending",
    chain_id: null,
    blockchain_tx: null,
    contract_address: null,
    qr_code_url: null,
    certificate_url: null,
  };
}

async function createProjectRecord({ userId, repoUrl, analysisVersion }) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: userId,
      repo_url: repoUrl,
      repo_name: "",
      analysis_status: "processing",
      analysis_version: analysisVersion,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create project record: ${error.message}`);
  }

  return data;
}

async function createAnalysisJob({ projectId, analysisVersion }) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("analysis_jobs")
    .insert({
      project_id: projectId,
      job_type: "repository_analysis",
      status: "running",
      analysis_version: analysisVersion,
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create analysis job: ${error.message}`);
  }

  return data;
}

async function markAnalysisJob(jobId, values) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("analysis_jobs")
    .update(values)
    .eq("id", jobId);

  if (error) {
    throw new Error(`Failed to update analysis job: ${error.message}`);
  }
}

async function updateProjectRecord(projectId, values) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("projects").update(values).eq("id", projectId);

  if (error) {
    throw new Error(`Failed to update project record: ${error.message}`);
  }
}

async function replaceProjectArtifacts({ projectId, userId, analysis, frontendUrl }) {
  const supabase = getSupabaseAdminClient();

  const { error: deleteMetricsError } = await supabase
    .from("metrics")
    .delete()
    .eq("project_id", projectId);
  if (deleteMetricsError) {
    throw new Error(`Failed to clear prior metrics: ${deleteMetricsError.message}`);
  }

  const { error: deleteScoresError } = await supabase
    .from("scores")
    .delete()
    .eq("project_id", projectId);
  if (deleteScoresError) {
    throw new Error(`Failed to clear prior scores: ${deleteScoresError.message}`);
  }

  const { error: deleteCertificatesError } = await supabase
    .from("certificates")
    .delete()
    .eq("project_id", projectId);
  if (deleteCertificatesError) {
    throw new Error(`Failed to clear prior certificates: ${deleteCertificatesError.message}`);
  }

  const metricsPayload = buildMetricsPayload(analysis);
  const scoresPayload = buildScoresPayload(analysis);
  const certificatePayload = buildCertificatePayload({
    projectId,
    userId,
    analysis,
    frontendUrl,
  });

  const { error: metricsError } = await supabase.from("metrics").insert({
    project_id: projectId,
    analysis_version: "v1",
    ...metricsPayload,
  });
  if (metricsError) {
    throw new Error(`Failed to store metrics: ${metricsError.message}`);
  }

  const { error: scoresError } = await supabase.from("scores").insert({
    project_id: projectId,
    ...scoresPayload,
  });
  if (scoresError) {
    throw new Error(`Failed to store scores: ${scoresError.message}`);
  }

  const { error: certificateError } = await supabase.from("certificates").insert({
    project_id: projectId,
    ...certificatePayload,
  });
  if (certificateError) {
    throw new Error(`Failed to store certificate placeholder: ${certificateError.message}`);
  }
}

async function fetchProjectsForUser(userId) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("projects")
    .select(
      `
      id,
      user_id,
      repo_url,
      repo_name,
      analysis_status,
      analysis_version,
      github_repo_id,
      default_branch,
      created_at,
      last_analyzed_at,
      analysis_error,
      metrics (
        id,
        project_id,
        analysis_version,
        files,
        test_ratio,
        raw_metrics_json
      ),
      scores (
        id,
        project_id,
        backend_score,
        architecture_score,
        documentation_score,
        confidence_score,
        explanation
      ),
      certificates (
        id,
        project_id,
        status,
        created_at
      ),
      analysis_jobs (
        id,
        project_id,
        job_type,
        status,
        started_at,
        finished_at,
        error_message
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load projects: ${error.message}`);
  }

  return data;
}

async function fetchProjectById(projectId, userId) {
  const supabase = getSupabaseAdminClient();
  const query = supabase
    .from("projects")
    .select(
      `
      *,
      metrics (*),
      scores (*),
      certificates (*),
      analysis_jobs (*)
    `
    )
    .eq("id", projectId);

  if (userId) {
    query.eq("user_id", userId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(`Failed to load project: ${error.message}`);
  }

  return data;
}

async function fetchPublicCertificates(limit = 4) {
  const supabase = getSupabaseAdminClient();
  const safeLimit = Math.min(Math.max(limit, 1), 12);

  const { data, error } = await supabase
    .from("certificates")
    .select(
      `
      id,
      status,
      created_at
    `
    )
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (error) {
    throw new Error(`Failed to load public certificates: ${error.message}`);
  }

  return data;
}

async function fetchPublicCertificateById(certificateId) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("certificates")
    .select(
      `
      id,
      status,
      created_at,
      certificate_payload,
      certificate_hash,
      blockchain_tx,
      chain_id,
      contract_address,
      projects (
        id,
        repo_name,
        repo_url,
        default_branch,
        analysis_status,
        created_at,
        last_analyzed_at,
        metrics (*),
        scores (*),
        analysis_jobs (*),
        users (
          email
        )
      )
    `
    )
    .eq("id", certificateId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load public certificate: ${error.message}`);
  }

  return data;
}

module.exports = {
  createAnalysisJob,
  createProjectRecord,
  fetchProjectById,
  fetchProjectsForUser,
  fetchPublicCertificateById,
  fetchPublicCertificates,
  markAnalysisJob,
  replaceProjectArtifacts,
  updateProjectRecord,
};
