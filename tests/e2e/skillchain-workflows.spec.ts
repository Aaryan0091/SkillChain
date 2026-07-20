import { expect, test, type Page } from "@playwright/test";

const project = {
  id: "e2e-project-001",
  repo_name: "e2e-user/skillchain-proof",
  repo_url: "https://github.com/e2e-user/skillchain-proof",
  analysis_status: "completed",
  default_branch: "main",
  created_at: "2026-07-18T10:00:00.000Z",
  last_analyzed_at: "2026-07-18T10:04:00.000Z",
  analysis_error: null,
  users: { email: "e2e.recruiter@skillchain.test" },
  metrics: [
    {
      files: 128,
      test_ratio: 42,
      raw_metrics_json: {
        fileStats: {
          totalFiles: 128,
          sourceFiles: 74,
          testFiles: 31,
          docsFiles: 8,
          backendFiles: 28,
          frontendFiles: 46,
        },
        frameworks: ["Next.js", "Supabase", "Express"],
        packageNames: ["next", "@supabase/supabase-js", "express"],
        signals: {
          hasTests: true,
          hasReadme: true,
          hasBackend: true,
          hasFrontend: true,
        },
        selectedFiles: [
          { path: "src/app/dashboard/page.tsx", kind: "frontend", size: 4200 },
          {
            path: "src/services/project-store.service.js",
            kind: "backend",
            size: 8200,
          },
          { path: "README.md", kind: "docs", size: 1800 },
        ],
        summary: "Full-stack proof project with saved scoring and verification evidence.",
      },
    },
  ],
  scores: [
    {
      backend_score: 88,
      architecture_score: 84,
      documentation_score: 79,
      confidence_score: 91,
      explanation:
        "Strong full-stack implementation with visible backend storage, project evidence, and verification flow.",
      score_breakdown_json: {
        frontend: 86,
        codeQuality: 83,
        security: 81,
        strengths: ["Supabase-backed persistence", "Clear certificate proof flow"],
        risks: ["Needs final production monitoring"],
        skillEvidence: ["Next.js", "Supabase", "Express", "Blockchain verification"],
        projectType: "Full-stack developer proof platform",
        architectureSummary:
          "Next.js frontend backed by an Express API, Supabase records, and blockchain certificate anchoring.",
        scoreEvidenceDetails: {
          backend: {
            signals: ["API route coverage", "Supabase persistence"],
            files: [
              {
                path: "src/services/project-store.service.js",
                kind: "backend",
                size: 8200,
              },
            ],
            notes: ["Project, score, and certificate records are persisted."],
          },
        },
      },
    },
  ],
  certificates: [
    {
      id: "e2e-certificate-001",
      status: "issued",
      created_at: "2026-07-18T10:05:00.000Z",
      verification_status: "verified",
      verification_url: "/verify/e2e-certificate-001",
      certificate_hash:
        "0xe2e0000000000000000000000000000000000000000000000000000000000001",
      blockchain_tx:
        "0xe2e1111111111111111111111111111111111111111111111111111111111111",
      contract_address: "0xe2e2222222222222222222222222222222222222",
      chain_id: "80002",
      certificate_payload: {
        summary: {
          explanation:
            "Verification passed. The certificate payload, stored hash, and blockchain reference all match.",
        },
        verificationBasis: {
          scope: "project",
          basisVersion: "e2e-test",
          projectBinding: {
            projectId: "e2e-project-001",
            repoUrl: "https://github.com/e2e-user/skillchain-proof",
            repoName: "e2e-user/skillchain-proof",
            defaultBranch: "main",
          },
          checks: ["payload_hash_match", "chain_hash_match", "project_binding_match"],
        },
      },
    },
  ],
  analysis_jobs: [
    {
      id: "e2e-job-001",
      job_type: "analysis",
      status: "completed",
      started_at: "2026-07-18T10:00:00.000Z",
      finished_at: "2026-07-18T10:04:00.000Z",
      error_message: null,
    },
  ],
};

const certificate = {
  ...project.certificates[0],
  projects: project,
};

const candidates = [
  {
    id: "e2e-user-001",
    email: "e2e.recruiter@skillchain.test",
    handle: "e2e-recruiter",
    label: "E2E Recruiter",
    projectCount: 1,
    verifiedCertificateCount: 1,
    primaryCertificateId: "e2e-certificate-001",
    isCurrentUser: true,
  },
  {
    id: "e2e-candidate-002",
    email: "candidate@skillchain.test",
    handle: "candidate-dev",
    label: "Candidate Dev",
    projectCount: 1,
    verifiedCertificateCount: 1,
    primaryCertificateId: "e2e-certificate-001",
    isCurrentUser: false,
  },
];

const analysis = {
  analysisVersion: "e2e-test",
  repo: {
    fullName: "e2e-user/skillchain-proof",
    htmlUrl: "https://github.com/e2e-user/skillchain-proof",
    branch: "main",
  },
  basis: {
    fileStats: project.metrics[0].raw_metrics_json.fileStats,
    selectedFiles: project.metrics[0].raw_metrics_json.selectedFiles,
  },
  deterministic: {
    frameworks: ["Next.js", "Supabase", "Express"],
    readme: {
      exists: true,
      lines: 40,
      words: 620,
      score: 84,
      note: "README contains setup and project explanation.",
    },
    signals: project.metrics[0].raw_metrics_json.signals,
  },
  nlp: {
    projectType: "Full-stack developer proof platform",
    skillEvidence: ["Next.js", "Supabase", "Express", "Blockchain verification"],
    architectureSummary:
      "Next.js frontend backed by an Express API, Supabase records, and blockchain certificate anchoring.",
    strengths: ["Supabase-backed persistence", "Clear certificate proof flow"],
    risks: ["Needs final production monitoring"],
  },
  scores: {
    backend: 88,
    architecture: 84,
    documentation: 79,
    confidence: 91,
    overall: 86,
  },
  summary:
    "Strong full-stack implementation with saved scoring, evidence, and certificate verification.",
};

async function mockSkillChainApi(page: Page) {
  await page.route("http://127.0.0.1:4000/api/v1/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const pathname = url.pathname;
    const method = request.method();

    if (method === "POST" && pathname.endsWith("/projects")) {
      await route.fulfill({
        json: {
          success: true,
          data: {
            project,
            analysis,
            ownership: {
              mode: "owner",
              repoOwner: "e2e-user",
              githubUsername: "e2e-recruiter",
              message: "Owner check passed for this E2E repository.",
            },
          },
        },
      });
      return;
    }

    if (method === "POST" && pathname.endsWith("/projects/preview")) {
      await route.fulfill({
        json: {
          success: true,
          data: {
            analysis,
            ownership: {
              mode: "unclaimed_public_analysis",
              message: "Public-only analysis was not saved to a profile.",
            },
          },
        },
      });
      return;
    }

    if (method === "GET" && pathname.endsWith("/projects/recruiter/candidates")) {
      await route.fulfill({ json: { success: true, data: candidates } });
      return;
    }

    if (
      method === "GET" &&
      pathname.endsWith("/projects/recruiter/candidates/e2e-user-001/projects")
    ) {
      await route.fulfill({
        json: { success: true, data: { candidate: candidates[0], projects: [project] } },
      });
      return;
    }

    if (method === "GET" && pathname.endsWith("/projects")) {
      await route.fulfill({ json: { success: true, data: [project] } });
      return;
    }

    if (method === "GET" && pathname.endsWith(`/projects/${project.id}`)) {
      await route.fulfill({ json: { success: true, data: project } });
      return;
    }

    if (method === "GET" && pathname.endsWith(`/verify/${certificate.id}`)) {
      await route.fulfill({ json: { success: true, data: certificate } });
      return;
    }

    if (method === "GET" && pathname.endsWith("/auth/account-export")) {
      await route.fulfill({
        json: {
          success: true,
          data: {
            user: { email: "e2e.recruiter@skillchain.test" },
            projects: [project],
          },
        },
      });
      return;
    }

    await route.fulfill({
      status: 404,
      json: { success: false, message: `Unhandled E2E route: ${method} ${pathname}` },
    });
  });
}

test.beforeEach(async ({ page }) => {
  await mockSkillChainApi(page);
});

test("login page stays available as the auth entry point", async ({ page }) => {
  await page.goto("/login?logged_out=1");

  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  await expect(page.getByText("GitHub", { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/login\?logged_out=1$/);
});

test("dashboard shows saved project proof summary", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page.getByRole("link", { name: "Overview" })).toHaveAttribute(
    "aria-current",
    "page"
  );
  await expect(
    page.getByRole("heading", { name: "e2e-user/skillchain-proof" })
  ).toBeVisible();
  await expect(page.getByText("Repositories Analyzed")).toBeVisible();
});

test("submit repo can analyze and save a profile-linked repo", async ({ page }) => {
  await page.goto("/dashboard/submit");

  await page
    .getByPlaceholder("https://github.com/username/project")
    .fill("https://github.com/e2e-user/skillchain-proof");
  await page.getByPlaceholder("main").fill("main");
  await page.getByRole("button", { name: "Analyze and Save" }).click();

  await expect(page.getByText("Repository analysis complete")).toBeVisible();
  await expect(page.getByText("What Was Analyzed")).toBeVisible();
  await expect(page.getByText("Next.js", { exact: true })).toBeVisible();
});

test("certificates page lists issued certificates and opens detail page", async ({
  page,
}) => {
  await page.goto("/dashboard/certificates");

  await expect(page.getByRole("link", { name: "Certificates" })).toHaveAttribute(
    "aria-current",
    "page"
  );
  await expect(page.getByText("Issued Project Certificates")).toBeVisible();
  await expect(page.getByText("e2e-user/skillchain-proof")).toBeVisible();

  await page.getByRole("link", { name: "View Certificate" }).click();
  await expect(page).toHaveURL(/\/dashboard\/certificates\/e2e-certificate-001$/);
  await expect(page.getByText("Verification passed").first()).toBeVisible();
});

test("public verify opens a certificate record", async ({ page }) => {
  await page.goto("/dashboard/verify");

  await expect(page.getByRole("link", { name: "Verify", exact: true })).toHaveAttribute(
    "aria-current",
    "page"
  );
  await page.getByPlaceholder("Paste a public certificate ID").fill(certificate.id);
  await page.getByRole("button", { name: "Open Public Record" }).click();

  await expect(page).toHaveURL(/\/dashboard\/verify\/e2e-certificate-001$/);
  await expect(page.getByText("Verified").first()).toBeVisible();
  await expect(page.getByText("Repository proof")).toBeVisible();
  await expect(page.getByText("e2e-user/skillchain-proof").first()).toBeVisible();
});

test("recruiter search and candidate review show role-fit signals", async ({
  page,
}) => {
  await page.goto("/dashboard/recruiter/search");

  await expect(
    page.getByRole("link", { name: "Recruiter", exact: true })
  ).toHaveAttribute(
    "aria-current",
    "page"
  );
  await page.getByPlaceholder("aaryangupta2005, email, or profile handle").fill("e2e");
  await expect(page.getByText("E2E Recruiter")).toBeVisible();

  await page.getByRole("button", { name: "Open profile" }).first().click();
  await expect(page).toHaveURL(/\/dashboard\/recruiter\/candidate\?id=e2e-user-001$/);
  await expect(page.getByText("Hiring Decision Support")).toBeVisible();
  await expect(page.getByText("Match score")).toBeVisible();
  await expect(page.getByText("e2e-user/skillchain-proof").first()).toBeVisible();
});

test("settings save, export, and delete guard behave safely", async ({ page }) => {
  await page.goto("/dashboard/settings");

  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  await page.getByLabel("Preferred role").fill("Full-stack Engineer");
  await page.getByRole("button", { name: "Save preferences" }).click();
  await expect(page.getByText("Profile preferences saved")).toBeVisible();

  await page.getByRole("button", { name: "Export JSON" }).click();
  await expect(page.getByText("Account export downloaded as a JSON file.")).toBeVisible();

  await page.getByPlaceholder("DELETE MY ACCOUNT").fill("DELETE MY ACCOUN");
  await expect(page.getByRole("button", { name: "Permanently delete account" })).toBeDisabled();
});
