const express = require("express");
const { analyzeRepository } = require("../services/repo-analyzer.service");
const {
  extractGitHubIdentity,
  resolveAuthenticatedUser,
} = require("../services/auth-context.service");
const {
  fetchRepositoryContributors,
  fetchRepositoryMetadata,
  parseGitHubRepoUrl,
} = require("../services/github.service");
const {
  createAnalysisJob,
  createProjectRecord,
  deleteCertificateRecord,
  deleteProjectRecord,
  fetchProjectById,
  fetchProjectsForUser,
  fetchOwnedCertificateById,
  finalizeCertificateVerification,
  markAnalysisJob,
  replaceProjectArtifacts,
  updateProjectRecord,
} = require("../services/project-store.service");
const { env } = require("../config/env");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const user = await resolveAuthenticatedUser(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Missing Supabase bearer token. Send Authorization: Bearer <access_token> to list projects.",
      });
    }

    const projects = await fetchProjectsForUser(user.id);

    return res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Could not load projects.",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await resolveAuthenticatedUser(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Missing Supabase bearer token. Send Authorization: Bearer <access_token> to fetch a project.",
      });
    }

    const project = await fetchProjectById(req.params.id, user.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    return res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Could not load project.",
    });
  }
});

router.patch("/:id", async (req, res) => {
  const { repoName, defaultBranch } = req.body || {};

  try {
    const user = await resolveAuthenticatedUser(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Missing Supabase bearer token. Send Authorization: Bearer <access_token> to update a project.",
      });
    }

    const project = await fetchProjectById(req.params.id, user.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    const values = {};

    if (typeof repoName === "string") {
      const trimmedRepoName = repoName.trim();
      values.repo_name = trimmedRepoName || project.repo_name;
    }

    if (typeof defaultBranch === "string") {
      const trimmedBranch = defaultBranch.trim();
      values.default_branch = trimmedBranch || null;
    }

    if (!Object.keys(values).length) {
      return res.status(400).json({
        success: false,
        message: "Nothing to update.",
      });
    }

    await updateProjectRecord(req.params.id, values);
    const updatedProject = await fetchProjectById(req.params.id, user.id);

    return res.json({
      success: true,
      message: "Project updated.",
      data: updatedProject,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Could not update project.",
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const user = await resolveAuthenticatedUser(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Missing Supabase bearer token. Send Authorization: Bearer <access_token> to remove a project.",
      });
    }

    const project = await fetchProjectById(req.params.id, user.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    await deleteProjectRecord(req.params.id);

    return res.json({
      success: true,
      message: "Project removed.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Could not remove project.",
    });
  }
});

router.delete("/certificates/:certificateId", async (req, res) => {
  try {
    const user = await resolveAuthenticatedUser(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Missing Supabase bearer token. Send Authorization: Bearer <access_token> to remove a certificate.",
      });
    }

    const certificate = await fetchOwnedCertificateById(req.params.certificateId, user.id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found.",
      });
    }

    await deleteCertificateRecord(req.params.certificateId);

    return res.json({
      success: true,
      message: "Certificate removed.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Could not remove certificate.",
    });
  }
});

router.post("/preview", async (req, res) => {
  const { repoUrl, branch } = req.body || {};

  if (!repoUrl) {
    return res.status(400).json({
      success: false,
      message: "repoUrl is required.",
    });
  }

  try {
    const repoMetadata = await fetchRepositoryMetadata(repoUrl);

    if (repoMetadata.private) {
      return res.status(403).json({
        success: false,
        message:
          "Analyze public repo only accepts public GitHub repositories. Private repositories cannot be analyzed in this mode.",
      });
    }

    const analysis = await analyzeRepository(repoUrl, branch);

    return res.status(200).json({
      success: true,
      message: "Repository analyzed without saving to any profile.",
      data: {
        analysis,
        savedToProfile: false,
        ownershipMode: "unclaimed_public_analysis",
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Repository analysis failed.",
    });
  }
});

router.post("/", async (req, res) => {
  const { repoUrl, branch } = req.body || {};

  if (!repoUrl) {
    return res.status(400).json({
      success: false,
      message: "repoUrl is required.",
    });
  }

  let project;
  let job;

  try {
    const user = await resolveAuthenticatedUser(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Missing Supabase bearer token. Sign in with Supabase and send Authorization: Bearer <access_token> to analyze and store a project.",
      });
    }

    const parsedRepo = parseGitHubRepoUrl(repoUrl);
    const githubIdentity = extractGitHubIdentity(user);
    const githubUsername = githubIdentity.username?.toLowerCase() || null;
    const repoMetadata = await fetchRepositoryMetadata(repoUrl);
    const repoOwner = (repoMetadata.owner.login || parsedRepo.owner).toLowerCase();

    if (!githubUsername) {
      return res.status(403).json({
        success: false,
        message:
          "To add a repository to your profile, sign in with GitHub so SkillChain can verify that the repo belongs to your GitHub account. You can still use 'Analyze public repo only' for any public repository.",
      });
    }

    if (repoMetadata.private) {
      return res.status(403).json({
        success: false,
        message:
          "Private repositories cannot be added to a public SkillChain profile. Make the repository public or use a public repository instead.",
      });
    }

    const contributorLogins = await fetchRepositoryContributors(repoUrl);
    const isRepoOwner = githubUsername === repoOwner;
    const isContributor = contributorLogins.includes(githubUsername);

    if (!isRepoOwner && !isContributor) {
      return res.status(403).json({
        success: false,
        message: `This repository is owned by '${parsedRepo.owner}', and your signed-in GitHub account '${githubUsername}' was not detected as the owner or a listed contributor. Use 'Analyze public repo only' for third-party repositories, or sign in with the GitHub account that owns or contributes to this repository.`,
      });
    }

    if (
      isRepoOwner &&
      githubIdentity.githubUserId &&
      repoMetadata.owner.id &&
      githubIdentity.githubUserId !== repoMetadata.owner.id
    ) {
      console.warn("[SkillChain] GitHub owner username matched but owner id differed", {
        repoOwner,
        repoOwnerId: repoMetadata.owner.id,
        githubUsername,
        githubUserId: githubIdentity.githubUserId,
      });
    }

    project = await createProjectRecord({
      userId: user.id,
      repoUrl,
      analysisVersion: "v1",
    });

    job = await createAnalysisJob({
      projectId: project.id,
      analysisVersion: "v1",
    });

    const analysis = await analyzeRepository(repoUrl, branch);
    const repoName = analysis.repo.fullName || analysis.repo.name || repoUrl;

    const certificateId = await replaceProjectArtifacts({
      projectId: project.id,
      userId: user.id,
      analysis,
      frontendUrl: env.frontendUrl,
    });

    await updateProjectRecord(project.id, {
      repo_name: repoName,
      github_repo_id: analysis.repo.id || null,
      default_branch: analysis.repo.defaultBranch || analysis.repo.branch || null,
      analysis_status: "completed",
      analysis_version: "v1",
      last_analyzed_at: new Date().toISOString(),
      analysis_error: null,
    });

    await markAnalysisJob(job.id, {
      status: "completed",
      finished_at: new Date().toISOString(),
      error_message: null,
    });

    let finalizedCertificate = null;
    if (certificateId) {
      try {
        finalizedCertificate = await finalizeCertificateVerification(certificateId);
      } catch (_verificationError) {
        // Keep the project analysis successful even if the verification step fails.
        // The certificate record can still surface a failed verification state later.
      }
    }

    const storedProject = await fetchProjectById(project.id, user.id);

    return res.status(200).json({
      success: true,
      message: "Repository analyzed and stored in Supabase.",
      data: {
        project: storedProject,
        certificate: finalizedCertificate,
        analysis,
      },
    });
  } catch (error) {
    try {
      if (project?.id) {
        await updateProjectRecord(project.id, {
          analysis_status: "failed",
          analysis_error: error.message || "Repository analysis failed.",
        });
      }

      if (job?.id) {
        await markAnalysisJob(job.id, {
          status: "failed",
          finished_at: new Date().toISOString(),
          error_message: error.message || "Repository analysis failed.",
        });
      }
    } catch (_storageError) {
      // Preserve the original failure response if persistence cleanup also fails.
    }

    return res.status(400).json({
      success: false,
      message: error.message || "Repository analysis failed.",
    });
  }
});

router.post("/:id/finalize-verification", async (req, res) => {
  try {
    const user = await resolveAuthenticatedUser(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Missing Supabase bearer token. Send Authorization: Bearer <access_token> to finalize verification.",
      });
    }

    const project = await fetchProjectById(req.params.id, user.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    const certificateId = project.certificates?.[0]?.id;

    if (!certificateId) {
      return res.status(404).json({
        success: false,
        message: "No certificate found for this project.",
      });
    }

    const certificate = await finalizeCertificateVerification(certificateId);

    return res.json({
      success: true,
      message: "Project certificate verification finalized.",
      data: certificate,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Could not finalize verification.",
    });
  }
});

module.exports = router;
