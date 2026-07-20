import type { User } from "@supabase/supabase-js";
import type { ProjectRecord } from "@/lib/dashboard-data";

export const isE2ETestMode =
  process.env.NEXT_PUBLIC_E2E_TEST_MODE === "true";

export const e2eAccessToken = "skillchain-e2e-access-token";

export const e2eUser = {
  id: "e2e-user-001",
  email: "e2e.recruiter@skillchain.test",
  created_at: "2026-07-01T10:00:00.000Z",
  last_sign_in_at: "2026-07-20T09:00:00.000Z",
  app_metadata: {
    provider: "github",
  },
  user_metadata: {
    full_name: "E2E Recruiter",
    name: "E2E Recruiter",
    user_name: "e2e-recruiter",
    preferred_username: "e2e-recruiter",
    login: "e2e-recruiter",
    preferred_role: "Full-stack Engineer",
    profile_visibility: "public",
    recruiter_contact_preference: "open",
    provider_id: "100200300",
  },
  identities: [
    {
      provider: "github",
      identity_data: {
        user_name: "e2e-recruiter",
        preferred_username: "e2e-recruiter",
        provider_id: "100200300",
      },
    },
  ],
} as unknown as User;

export const e2eProjects: ProjectRecord[] = [
  {
    id: "e2e-project-001",
    repo_name: "e2e-user/skillchain-proof",
    repo_url: "https://github.com/e2e-user/skillchain-proof",
    analysis_status: "completed",
    default_branch: "main",
    created_at: "2026-07-18T10:00:00.000Z",
    last_analyzed_at: "2026-07-18T10:04:00.000Z",
    analysis_error: null,
    users: { email: e2eUser.email },
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
            { path: "src/services/project-store.service.js", kind: "backend", size: 8200 },
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
              files: [{ path: "src/services/project-store.service.js", kind: "backend" }],
              notes: ["Project, score, and certificate records are persisted."],
            },
            frontend: {
              signals: ["Dashboard", "Verify", "Recruiter views"],
              files: [{ path: "src/app/dashboard/DashboardClient.tsx", kind: "frontend" }],
              notes: ["Main user workflows are visible in the UI."],
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
  },
];

export const e2eCandidates = [
  {
    id: e2eUser.id,
    email: e2eUser.email,
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

export function getE2ECertificate(certificateId: string) {
  const project = e2eProjects.find((entry) =>
    entry.certificates?.some((certificate) => certificate.id === certificateId)
  );
  const certificate = project?.certificates?.find(
    (entry) => entry.id === certificateId
  );

  if (!project || !certificate) return null;

  return {
    ...certificate,
    projects: project,
  };
}
