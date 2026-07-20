const express = require("express");

const {
  extractGitHubIdentity,
  resolveAuthenticatedUser,
} = require("../services/auth-context.service");
const {
  deleteAccountRecords,
  fetchProjectsForUser,
} = require("../services/project-store.service");

const router = express.Router();

router.get("/providers", (_req, res) => {
  res.json({
    success: true,
    providers: ["email", "github", "google", "magic_link"],
    message: "Supabase auth providers will be connected here.",
  });
});

router.get("/account-export", async (req, res) => {
  try {
    const user = await resolveAuthenticatedUser(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Sign in to export your account data.",
      });
    }

    const projects = await fetchProjectsForUser(user.id);

    return res.json({
      success: true,
      data: {
        exportedAt: new Date().toISOString(),
        account: {
          id: user.id,
          email: user.email || null,
          created_at: user.created_at || null,
          last_sign_in_at: user.last_sign_in_at || null,
          app_metadata: user.app_metadata || {},
          user_metadata: user.user_metadata || {},
          github: extractGitHubIdentity(user),
        },
        projects,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to export account data.",
    });
  }
});

router.delete("/account", async (req, res) => {
  try {
    const user = await resolveAuthenticatedUser(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Sign in to delete your account.",
      });
    }

    if (req.body?.confirmation !== "DELETE MY ACCOUNT") {
      return res.status(400).json({
        success: false,
        message: "Type DELETE MY ACCOUNT to confirm permanent account deletion.",
      });
    }

    const result = await deleteAccountRecords(user.id);

    return res.json({
      success: true,
      message: "Your account and saved SkillChain records were deleted.",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete account.",
    });
  }
});

module.exports = router;
