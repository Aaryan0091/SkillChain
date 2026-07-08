const express = require("express");
const { analyzeRepository } = require("../services/repo-analyzer.service");
const { resolveAuthenticatedUser } = require("../services/auth-context.service");
const {
  createAnalysisJob,
  createProjectRecord,
  fetchProjectById,
  fetchProjectsForUser,
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

    if (certificateId) {
      await finalizeCertificateVerification(certificateId);
    }

    const storedProject = await fetchProjectById(project.id, user.id);

    return res.status(200).json({
      success: true,
      message: "Repository analyzed and stored in Supabase.",
      data: {
        project: storedProject,
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
