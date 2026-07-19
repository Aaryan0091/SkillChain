const crypto = require("node:crypto");
const { getSupabaseAdminClient } = require("../lib/supabase");
const {
  anchorCertificateHash,
  isBlockchainConfigured,
  readAnchoredHash,
} = require("./blockchain.service");

function hashCertificatePayload(payload) {
  return crypto
    .createHash("sha256")
    .update(stableStringify(payload))
    .digest("hex");
}

function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(
        ([key, nestedValue]) =>
          `${JSON.stringify(key)}:${stableStringify(nestedValue)}`
      );

    return `{${entries.join(",")}}`;
  }

  return JSON.stringify(value);
}

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
    verificationBasis: {
      scope: "project",
      basisVersion: "v1",
      projectBinding: {
        projectId,
        repoUrl: analysis.repo.htmlUrl,
        repoName: analysis.repo.fullName,
        defaultBranch: analysis.repo.defaultBranch || analysis.repo.branch || null,
      },
      checks: [
        "This certificate is tied to one saved project record.",
        "Its score summary comes from the repository analysis saved for that project.",
        "Its public verification link points to the same certificate payload and hash.",
        "Blockchain verification status is tracked separately from certificate issuance.",
      ],
    },
    verification: {
      verificationUrl,
      blockchainMode: isBlockchainConfigured()
        ? "configured"
        : "not_configured",
    },
  };

  const certificateHash = hashCertificatePayload(payload);

  return {
    id: certificateId,
    certificate_payload: payload,
    certificate_payload_version: "v1",
    certificate_hash: certificateHash,
    verification_url: verificationUrl,
    status: "issued",
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

async function updateCertificateRecord(certificateId, values) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("certificates").update(values).eq("id", certificateId);

  if (error) {
    throw new Error(`Failed to update certificate record: ${error.message}`);
  }
}

async function fetchOwnedCertificateById(certificateId, userId) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("certificates")
    .select(
      `
      id,
      project_id,
      projects!inner (
        id,
        user_id
      )
    `
    )
    .eq("id", certificateId)
    .eq("projects.user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load owned certificate: ${error.message}`);
  }

  return data;
}

async function deleteCertificateRecord(certificateId) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("certificates").delete().eq("id", certificateId);

  if (error) {
    throw new Error(`Failed to delete certificate: ${error.message}`);
  }
}

async function deleteProjectRecord(projectId) {
  const supabase = getSupabaseAdminClient();

  const { error: jobsError } = await supabase
    .from("analysis_jobs")
    .delete()
    .eq("project_id", projectId);
  if (jobsError) {
    throw new Error(`Failed to delete analysis jobs: ${jobsError.message}`);
  }

  const { error: metricsError } = await supabase
    .from("metrics")
    .delete()
    .eq("project_id", projectId);
  if (metricsError) {
    throw new Error(`Failed to delete metrics: ${metricsError.message}`);
  }

  const { error: scoresError } = await supabase
    .from("scores")
    .delete()
    .eq("project_id", projectId);
  if (scoresError) {
    throw new Error(`Failed to delete scores: ${scoresError.message}`);
  }

  const { error: certificatesError } = await supabase
    .from("certificates")
    .delete()
    .eq("project_id", projectId);
  if (certificatesError) {
    throw new Error(`Failed to delete certificates: ${certificatesError.message}`);
  }

  const { error: projectError } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);
  if (projectError) {
    throw new Error(`Failed to delete project: ${projectError.message}`);
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
  const certificateRecord = buildCertificatePayload({
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
    ...certificateRecord,
  });
  if (certificateError) {
    throw new Error(`Failed to store certificate: ${certificateError.message}`);
  }

  return certificateRecord.id;
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
        created_at,
        verification_status
      ),
      analysis_jobs (
        id,
        project_id,
        job_type,
        status,
        started_at,
        finished_at,
        error_message
      ),
      users (
        email
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load projects: ${error.message}`);
  }

  const projects = data || [];

  for (const project of projects) {
    if (!Array.isArray(project.certificates) || !project.certificates.length) continue;

    const refreshedCertificates = await Promise.all(
      project.certificates.map(async (certificate) => {
        if (!certificate?.id) return certificate;

        if (
          certificate.verification_status === "verified" ||
          certificate.status === "verified"
        ) {
          return certificate;
        }

        try {
          const refreshed = await finalizeCertificateVerification(certificate.id);
          if (!refreshed) return certificate;

          return {
            ...certificate,
            status: refreshed.status ?? certificate.status,
            verification_status:
              refreshed.verification_status ?? certificate.verification_status,
          };
        } catch {
          return certificate;
        }
      })
    );

    project.certificates = refreshedCertificates;
  }

  return projects;
}

function titleCase(value) {
  return value
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildCandidateSummary(userRecord, viewerId = null) {
  const email = userRecord?.email || null;
  const isViewer = Boolean(viewerId && userRecord?.id === viewerId);
  const publicHandle = `candidate-${String(userRecord?.id || "").slice(0, 8)}`;
  const handle = isViewer && email ? email.split("@")[0] : publicHandle;
  const label = isViewer && email ? titleCase(email.split("@")[0]) : titleCase(publicHandle);
  const projects = Array.isArray(userRecord?.projects) ? userRecord.projects : [];
  const allCertificates = projects.flatMap((project) => project?.certificates || []);
  const sortedCertificates = [...allCertificates].sort((a, b) => {
    const aTime = new Date(a?.created_at || 0).getTime();
    const bTime = new Date(b?.created_at || 0).getTime();
    return bTime - aTime;
  });
  const primaryCertificate =
    sortedCertificates.find(
      (certificate) =>
        certificate?.verification_status === "verified" ||
        certificate?.status === "verified"
    ) || sortedCertificates[0] || null;
  const verifiedCertificateCount = projects.reduce(
    (count, project) =>
      count +
      ((project?.certificates || []).filter(
        (certificate) =>
          certificate?.verification_status === "verified" ||
          certificate?.status === "verified"
      ).length || 0),
    0
  );

  return {
    id: userRecord.id,
    email: isViewer ? email : null,
    handle,
    label,
    projectCount: projects.length,
    verifiedCertificateCount,
    primaryCertificateId: primaryCertificate?.id || null,
  };
}

async function searchRecruiterCandidates(searchTerm = "", limit = 8, viewerId = null) {
  const supabase = getSupabaseAdminClient();
  const safeLimit = Math.min(Math.max(limit, 1), 12);
  const normalizedSearch = searchTerm.trim();

  let query = supabase
    .from("users")
    .select(
      `
      id,
      email,
      projects!inner (
        id,
        certificates (
          id,
          status,
          verification_status
        )
      )
    `
    )
    .limit(safeLimit);

  if (normalizedSearch) {
    query = query.ilike("email", `%${normalizedSearch}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to search recruiter candidates: ${error.message}`);
  }

  return (data || [])
    .map((item) => buildCandidateSummary(item, viewerId))
    .sort((a, b) => {
      if (b.projectCount !== a.projectCount) {
        return b.projectCount - a.projectCount;
      }

      return b.verifiedCertificateCount - a.verifiedCertificateCount;
    });
}

async function fetchRecruiterCandidateWorkspace(userId, viewerId = null) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("users")
    .select(
      `
      id,
      email,
      projects!inner (
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
          explanation,
          score_breakdown_json
        ),
        certificates (
          id,
          project_id,
          status,
          created_at,
          verification_status
        ),
        analysis_jobs (
          id,
          project_id,
          job_type,
          status,
          started_at,
          finished_at,
          error_message
        ),
        users (
          email
        )
      )
    `
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load recruiter candidate workspace: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const projects = Array.isArray(data.projects) ? data.projects : [];

  for (const project of projects) {
    if (!Array.isArray(project.certificates) || !project.certificates.length) continue;

    const refreshedCertificates = await Promise.all(
      project.certificates.map(async (certificate) => {
        if (!certificate?.id) return certificate;

        if (
          certificate.verification_status === "verified" ||
          certificate.status === "verified"
        ) {
          return certificate;
        }

        try {
          const refreshed = await finalizeCertificateVerification(certificate.id);
          if (!refreshed) return certificate;

          return {
            ...certificate,
            status: refreshed.status ?? certificate.status,
            verification_status:
              refreshed.verification_status ?? certificate.verification_status,
          };
        } catch {
          return certificate;
        }
      })
    );

    project.certificates = refreshedCertificates;
  }

  return {
    candidate: buildCandidateSummary(data, viewerId),
    projects: projects.sort((a, b) => {
      const aTime = new Date(a.created_at || 0).getTime();
      const bTime = new Date(b.created_at || 0).getTime();
      return bTime - aTime;
    }),
  };
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

  if (data?.certificates?.length) {
    data.certificates = await Promise.all(
      data.certificates.map(async (certificate) => {
        if (!certificate?.id) return certificate;

        if (
          certificate.verification_status === "verified" ||
          certificate.status === "verified"
        ) {
          return certificate;
        }

        try {
          return (await finalizeCertificateVerification(certificate.id)) || certificate;
        } catch {
          return certificate;
        }
      })
    );
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
      created_at,
      verification_status
    `
    )
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (error) {
    throw new Error(`Failed to load public certificates: ${error.message}`);
  }

  const certificates = data || [];

  return Promise.all(
    certificates.map(async (certificate) => {
      if (!certificate?.id) return certificate;

      if (
        certificate.verification_status === "verified" ||
        certificate.status === "verified"
      ) {
        return certificate;
      }

      try {
        const refreshed = await finalizeCertificateVerification(certificate.id);
        if (!refreshed) return certificate;

        return {
          ...certificate,
          status: refreshed.status ?? certificate.status,
          verification_status:
            refreshed.verification_status ?? certificate.verification_status,
        };
      } catch {
        return certificate;
      }
    })
  );
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
      verification_status,
      verification_url,
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

function decorateCertificateVerification(certificate, runtimeReason = null) {
  if (!certificate) {
    return null;
  }

  const project = Array.isArray(certificate.projects)
    ? certificate.projects[0] ?? null
    : certificate.projects ?? null;
  const payload = certificate.certificate_payload || null;
  const expectedHash = payload ? hashCertificatePayload(payload) : null;
  let currentHash = certificate.certificate_hash || null;
  let hasMatchingHash =
    Boolean(expectedHash) && Boolean(currentHash) && expectedHash === currentHash;
  const hasVerificationUrl = Boolean(certificate.verification_url);
  const projectCompleted = project?.analysis_status === "completed";
  const hasChainReference = Boolean(
    certificate.blockchain_tx || certificate.contract_address
  );

  let verificationReason = runtimeReason;

  if (!verificationReason) {
    if (!payload || !currentHash || !expectedHash) {
      verificationReason =
        "The certificate payload or integrity hash is missing, so verification cannot finish.";
    } else if (!hasMatchingHash) {
      verificationReason =
        "The stored certificate hash does not match the regenerated certificate hash.";
    } else if (!projectCompleted) {
      verificationReason =
        "Repository analysis is not completed yet, so the certificate cannot be finalized.";
    } else if (!hasVerificationUrl) {
      verificationReason =
        "The public verification link is missing from this certificate record.";
    } else if (
      certificate.verification_status === "failed" ||
      certificate.status === "failed"
    ) {
      verificationReason = hasChainReference
        ? "Blockchain verification did not pass for this certificate."
        : "The blockchain anchor could not be written or confirmed for this certificate.";
    } else if (
      certificate.verification_status === "verified" ||
      certificate.status === "verified"
    ) {
      verificationReason =
        "The certificate payload, stored hash, and blockchain reference all match.";
    } else {
      verificationReason =
        "The certificate exists, but the final verification step has not completed yet.";
    }
  }

  return {
    ...certificate,
    verification_reason: verificationReason,
  };
}

function resolveBlockchainFailureState(error, hasBlockchainReference) {
  const message =
    error instanceof Error
      ? error.message
      : "Blockchain verification failed while anchoring this certificate.";

  const normalized = message.toLowerCase();
  const looksTemporary =
    normalized.includes("no anchored certificate hash was found") ||
    normalized.includes("transaction was sent but no receipt was returned") ||
    normalized.includes("transaction could not be found") ||
    normalized.includes("timeout") ||
    normalized.includes("network") ||
    normalized.includes("nonce") ||
    normalized.includes("replacement fee too low") ||
    normalized.includes("underpriced") ||
    normalized.includes("connection");

  if (looksTemporary) {
    return {
      verificationStatus: "pending",
      status: "issued",
      runtimeReason: hasBlockchainReference
        ? "The blockchain anchor was created, but final confirmation/readback is still settling. Try opening the verification record again in a moment."
        : "The blockchain step started, but the final anchor confirmation has not completed yet. Try again in a moment.",
    };
  }

  return {
    verificationStatus: "failed",
    status: "failed",
    runtimeReason: message,
  };
}

async function finalizeCertificateVerification(certificateId) {
  const certificate = await fetchPublicCertificateById(certificateId);

  if (!certificate) {
    return null;
  }

  const project = Array.isArray(certificate.projects)
    ? certificate.projects[0] ?? null
    : certificate.projects ?? null;

  const payload = certificate.certificate_payload || null;
  const expectedHash = payload ? hashCertificatePayload(payload) : null;
  let currentHash = certificate.certificate_hash || null;
  const hasVerificationUrl = Boolean(certificate.verification_url);
  const projectCompleted = project?.analysis_status === "completed";

  let verificationStatus = certificate.verification_status || "pending";
  let status = certificate.status || "issued";
  let blockchainTx = certificate.blockchain_tx || null;
  let chainId = certificate.chain_id || null;
  let contractAddress = certificate.contract_address || null;
  let runtimeReason = null;

  if (!payload || !currentHash || !expectedHash) {
    verificationStatus = "failed";
    status = "failed";
  } else {
    if (currentHash !== expectedHash) {
      currentHash = expectedHash;
      await updateCertificateRecord(certificateId, {
        certificate_hash: expectedHash,
      });
      runtimeReason =
        "The certificate hash was refreshed to the canonical payload hash before final verification.";
    }

    if (status === "failed" || verificationStatus === "failed") {
      status = "issued";
      verificationStatus = "pending";
    }

    if (!projectCompleted) {
      verificationStatus = "pending";
      status = "issued";
    } else if (!hasVerificationUrl) {
      verificationStatus = "failed";
      status = "failed";
    } else if (isBlockchainConfigured()) {
      try {
        let anchored = null;
        let shouldReanchor = !blockchainTx;

        if (blockchainTx) {
          try {
            anchored = await readAnchoredHash({
              certificateId: certificate.id,
              transactionHash: blockchainTx,
            });

            if (anchored.anchoredHash !== expectedHash) {
              shouldReanchor = true;
              runtimeReason =
                "The existing blockchain anchor did not match the saved certificate hash, so a fresh anchor attempt was started.";
            }
          } catch (readError) {
            const message =
              readError instanceof Error ? readError.message.toLowerCase() : "";
            const isRetryableReadIssue =
              message.includes("no anchored certificate hash was found") ||
              message.includes("transaction could not be found") ||
              message.includes("transaction was sent but no receipt was returned");

            if (!isRetryableReadIssue) {
              throw readError;
            }

            shouldReanchor = true;
          }
        }

        if (shouldReanchor) {
          const anchor = await anchorCertificateHash({
            certificateId: certificate.id,
            certificateHash: expectedHash,
          });

          blockchainTx = anchor.transactionHash;
          chainId = anchor.chainId;
          contractAddress = anchor.anchorAddress;

          anchored = await readAnchoredHash({
            certificateId: certificate.id,
            transactionHash: blockchainTx,
          });
        }

        if (!anchored) {
          throw new Error(
            "Blockchain verification could not read back the anchored certificate hash."
          );
        }

        verificationStatus =
          anchored.anchoredHash === expectedHash ? "verified" : "failed";
        status = verificationStatus === "verified" ? "verified" : "failed";
      } catch (error) {
        const failureState = resolveBlockchainFailureState(
          error,
          Boolean(blockchainTx || contractAddress)
        );
        verificationStatus = failureState.verificationStatus;
        status = failureState.status;
        runtimeReason = failureState.runtimeReason;
      }
    } else {
      verificationStatus = "failed";
      status = "failed";
      runtimeReason =
        "Blockchain verification is not configured on the backend, so this certificate cannot be finalized.";
    }
  }

  await updateCertificateRecord(certificateId, {
    status,
    verification_status: verificationStatus,
    blockchain_tx: blockchainTx,
    chain_id: chainId,
    contract_address: contractAddress,
  });

  const updatedCertificate = await fetchPublicCertificateById(certificateId);
  return decorateCertificateVerification(updatedCertificate, runtimeReason);
}

module.exports = {
  createAnalysisJob,
  createProjectRecord,
  deleteCertificateRecord,
  fetchProjectById,
  fetchRecruiterCandidateWorkspace,
  fetchProjectsForUser,
  fetchOwnedCertificateById,
  fetchPublicCertificateById,
  fetchPublicCertificates,
  finalizeCertificateVerification,
  markAnalysisJob,
  replaceProjectArtifacts,
  searchRecruiterCandidates,
  deleteProjectRecord,
  updateCertificateRecord,
  updateProjectRecord,
};
