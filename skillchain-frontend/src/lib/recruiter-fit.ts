import { averageNumbers, titleCase } from "@/lib/formatting";
import { resolveCertificateVerification } from "@/lib/certificate-verification";
import type { ProjectRecord } from "@/lib/dashboard-data";

export type RecruiterRolePreset = {
  id: string;
  label: string;
  summary: string;
  recommendedUseCase: string;
  requiredSignals: string[];
  preferredSignals: string[];
  scoreWeights: {
    backend: number;
    frontend: number;
    architecture: number;
    confidence: number;
  };
};

export type RoleProjectFit = {
  project: ProjectRecord;
  score: number;
  matchedSignals: string[];
  missingSignals: string[];
  requiredMatches: string[];
  preferredMatches: string[];
  recommendation: "Strong fit" | "Possible fit" | "Weak fit";
};

export type RoleAssessment = {
  role: RecruiterRolePreset;
  overallScore: number;
  recommendation: "Strong fit" | "Possible fit" | "Weak fit";
  recommendationNote: string;
  matchedSignals: string[];
  missingSignals: string[];
  verifiedProjectCount: number;
  bestProjects: RoleProjectFit[];
  strengths: string[];
  risks: string[];
  recommendedUseCase: string;
  evidenceSummary: string[];
  nextChecks: string[];
};

export const recruiterRolePresets: RecruiterRolePreset[] = [
  {
    id: "backend-engineer",
    label: "Backend Engineer",
    summary: "Strong server, API, data, and systems implementation focus.",
    recommendedUseCase:
      "Best for backend/API teams, data-heavy product work, and service ownership roles.",
    requiredSignals: [
      "backend",
      "api",
      "server",
      "auth",
      "database",
      "supabase",
      "node",
    ],
    preferredSignals: [
      "security",
      "architecture",
      "postgres",
      "express",
      "service",
      "testing",
    ],
    scoreWeights: {
      backend: 0.4,
      frontend: 0.1,
      architecture: 0.25,
      confidence: 0.25,
    },
  },
  {
    id: "frontend-engineer",
    label: "Frontend Engineer",
    summary: "UI delivery, client architecture, and product-facing interaction work.",
    recommendedUseCase:
      "Best for product UI teams, fast-moving frontend work, and customer-facing feature delivery.",
    requiredSignals: [
      "frontend",
      "ui",
      "react",
      "next",
      "component",
      "tailwind",
    ],
    preferredSignals: [
      "accessibility",
      "design",
      "typescript",
      "state",
      "responsive",
      "animation",
    ],
    scoreWeights: {
      backend: 0.1,
      frontend: 0.45,
      architecture: 0.2,
      confidence: 0.25,
    },
  },
  {
    id: "full-stack-engineer",
    label: "Full-Stack Engineer",
    summary: "Balanced ownership across frontend, backend, and product architecture.",
    recommendedUseCase:
      "Best for startup/generalist roles where one person may own product flow end to end.",
    requiredSignals: [
      "frontend",
      "backend",
      "api",
      "react",
      "database",
      "auth",
    ],
    preferredSignals: [
      "architecture",
      "typescript",
      "supabase",
      "deployment",
      "testing",
      "integration",
    ],
    scoreWeights: {
      backend: 0.28,
      frontend: 0.28,
      architecture: 0.22,
      confidence: 0.22,
    },
  },
  {
    id: "platform-devops",
    label: "Platform / DevOps",
    summary: "Reliability, deployment, environment setup, and system health signals.",
    recommendedUseCase:
      "Best for platform, deployment, internal tools, or reliability-focused engineering roles.",
    requiredSignals: [
      "deployment",
      "security",
      "infrastructure",
      "architecture",
      "ci",
      "monitoring",
    ],
    preferredSignals: [
      "docker",
      "automation",
      "testing",
      "service",
      "performance",
      "auth",
    ],
    scoreWeights: {
      backend: 0.3,
      frontend: 0.05,
      architecture: 0.35,
      confidence: 0.3,
    },
  },
];

const customRoleStopWords = new Set([
  "and",
  "the",
  "for",
  "with",
  "into",
  "from",
  "role",
  "engineer",
  "developer",
  "senior",
  "junior",
  "mid",
  "level",
  "looking",
  "need",
  "needs",
  "someone",
  "who",
  "can",
  "build",
  "using",
  "experience",
  "strong",
]);

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9+#.\s/-]/g, " ");
}

function tokenize(values: string[]) {
  return Array.from(
    new Set(
      values
        .flatMap((value) => normalizeText(value).split(/[\s/._-]+/))
        .map((token) => token.trim())
        .filter(Boolean)
    )
  );
}

function collectEvidence(project: ProjectRecord) {
  const score = project.scores?.[0];
  const metric = project.metrics?.[0];

  return [
    project.repo_name || "",
    project.repo_url || "",
    score?.explanation || "",
    metric?.raw_metrics_json?.summary || "",
    ...(metric?.raw_metrics_json?.frameworks || []),
    ...(score?.score_breakdown_json?.skillEvidence || []),
    ...(score?.score_breakdown_json?.strengths || []),
    ...(score?.score_breakdown_json?.risks || []),
  ].filter(Boolean);
}

function projectNumericFit(project: ProjectRecord, role: RecruiterRolePreset) {
  const score = project.scores?.[0];

  const backend = score?.backend_score ?? 0;
  const frontend = score?.score_breakdown_json?.frontend ?? 0;
  const architecture = score?.architecture_score ?? 0;
  const confidence = score?.confidence_score ?? 0;

  return Math.round(
    backend * role.scoreWeights.backend +
      frontend * role.scoreWeights.frontend +
      architecture * role.scoreWeights.architecture +
      confidence * role.scoreWeights.confidence
  );
}

function findMatchedSignals(tokens: string[], signals: string[]) {
  return signals.filter((signal) => {
    const normalized = normalizeText(signal).trim();
    if (!normalized) return false;
    if (tokens.includes(normalized)) return true;
    return tokens.some((token) => normalized.includes(token) || token.includes(normalized));
  });
}

function recommendationFromScore(score: number): RoleProjectFit["recommendation"] {
  if (score >= 75) return "Strong fit";
  if (score >= 50) return "Possible fit";
  return "Weak fit";
}

function projectFitForRole(project: ProjectRecord, role: RecruiterRolePreset): RoleProjectFit {
  const evidence = collectEvidence(project);
  const tokens = tokenize(evidence);
  const requiredMatches = findMatchedSignals(tokens, role.requiredSignals);
  const preferredMatches = findMatchedSignals(tokens, role.preferredSignals);
  const numericFit = projectNumericFit(project, role);
  const requiredCoverage = role.requiredSignals.length
    ? (requiredMatches.length / role.requiredSignals.length) * 100
    : 0;
  const preferredCoverage = role.preferredSignals.length
    ? (preferredMatches.length / role.preferredSignals.length) * 100
    : 0;
  const verificationBoost =
    project.certificates?.some(
      (certificate) => resolveCertificateVerification(certificate, project).state === "verified"
    )
      ? 8
      : 0;

  const score = Math.min(
    100,
    Math.round(numericFit * 0.65 + requiredCoverage * 0.22 + preferredCoverage * 0.13) +
      verificationBoost
  );

  const matchedSignals = [...requiredMatches, ...preferredMatches];
  const missingSignals = role.requiredSignals.filter(
    (signal) => !requiredMatches.includes(signal)
  );

  return {
    project,
    score,
    matchedSignals,
    missingSignals,
    requiredMatches,
    preferredMatches,
    recommendation: recommendationFromScore(score),
  };
}

export function assessRoleFit(
  projects: ProjectRecord[],
  role: RecruiterRolePreset
): RoleAssessment {
  const projectFits = projects
    .map((project) => projectFitForRole(project, role))
    .sort((a, b) => b.score - a.score);

  const bestProjects = projectFits.slice(0, 3);
  const overallScore = averageNumbers(bestProjects.map((item) => item.score)) ?? 0;
  const matchedSignals = aggregateUnique(
    bestProjects.flatMap((item) => item.matchedSignals)
  ).slice(0, 8);
  const missingSignals = aggregateUnique(
    bestProjects
      .flatMap((item) => item.missingSignals)
      .filter((signal) => !matchedSignals.includes(signal))
  ).slice(0, 5);
  const verifiedProjectCount = projects.filter((project) =>
    (project.certificates || []).some(
      (certificate) => resolveCertificateVerification(certificate, project).state === "verified"
    )
  ).length;
  const strengths = aggregateUnique(
    bestProjects.flatMap((item) => item.project.scores?.[0]?.score_breakdown_json?.strengths || [])
  ).slice(0, 4);
  const risks = aggregateUnique(
    bestProjects.flatMap((item) => item.project.scores?.[0]?.score_breakdown_json?.risks || [])
  ).slice(0, 4);

  const recommendation = recommendationFromScore(overallScore);
  const recommendationNote =
    recommendation === "Strong fit"
      ? `The saved work repeatedly supports ${role.label.toLowerCase()} expectations.`
      : recommendation === "Possible fit"
        ? `There is useful overlap with ${role.label.toLowerCase()} work, but the proof is still mixed.`
        : `The current saved proof does not strongly support a ${role.label.toLowerCase()} decision yet.`;

  const evidenceSummary = [
    matchedSignals.length
      ? `Repeated saved evidence matches ${matchedSignals.slice(0, 4).join(", ")} for this role.`
      : `Very little repeated saved evidence directly matches this role yet.`,
    verifiedProjectCount
      ? `${verifiedProjectCount} saved project certificate${verifiedProjectCount === 1 ? "" : "s"} are fully verified.`
      : `No saved project certificate is fully verified yet, so trust should stay cautious.`,
    strengths.length
      ? `Top supporting strengths: ${strengths.slice(0, 3).join(", ")}.`
      : `There are not enough repeated saved strengths yet to make a strong call.`,
  ];

  const nextChecks = [
    ...missingSignals.slice(0, 3).map(
      (signal) => `Look for clearer proof of ${signal.toLowerCase()} in future saved work.`
    ),
    ...(risks.slice(0, 2).map((risk) => `Review risk: ${risk}`) || []),
  ].slice(0, 4);

  return {
    role,
    overallScore,
    recommendation,
    recommendationNote,
    matchedSignals: matchedSignals.map(titleCase),
    missingSignals: missingSignals.map(titleCase),
    verifiedProjectCount,
    bestProjects,
    strengths,
    risks,
    recommendedUseCase: role.recommendedUseCase,
    evidenceSummary,
    nextChecks,
  };
}

function aggregateUnique(items: string[]) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
}

function inferScoreWeights(tokens: string[]) {
  const backendHints = ["backend", "api", "server", "database", "auth", "service", "node"];
  const frontendHints = ["frontend", "react", "next", "ui", "design", "component", "tailwind"];
  const architectureHints = [
    "architecture",
    "platform",
    "infrastructure",
    "deployment",
    "system",
    "devops",
  ];

  const backendCount = tokens.filter((token) => backendHints.includes(token)).length;
  const frontendCount = tokens.filter((token) => frontendHints.includes(token)).length;
  const architectureCount = tokens.filter((token) => architectureHints.includes(token)).length;

  if (backendCount >= frontendCount && backendCount >= architectureCount) {
    return {
      backend: 0.38,
      frontend: 0.14,
      architecture: 0.24,
      confidence: 0.24,
    };
  }

  if (frontendCount >= backendCount && frontendCount >= architectureCount) {
    return {
      backend: 0.12,
      frontend: 0.42,
      architecture: 0.21,
      confidence: 0.25,
    };
  }

  if (architectureCount > 0) {
    return {
      backend: 0.26,
      frontend: 0.1,
      architecture: 0.38,
      confidence: 0.26,
    };
  }

  return {
    backend: 0.27,
    frontend: 0.23,
    architecture: 0.25,
    confidence: 0.25,
  };
}

export function createCustomRecruiterRole(description: string): RecruiterRolePreset | null {
  const trimmed = description.trim();
  if (!trimmed) return null;

  const normalizedTokens = tokenize([trimmed]).filter(
    (token) => token.length > 2 && !customRoleStopWords.has(token)
  );

  if (!normalizedTokens.length) return null;

  const uniqueTokens = aggregateUnique(normalizedTokens);
  const requiredSignals = uniqueTokens.slice(0, 6);
  const preferredSignals = uniqueTokens.slice(6, 12);

  return {
    id: "custom-role",
    label: "Custom Role",
    summary: trimmed,
    recommendedUseCase:
      "Best used when a recruiter wants to compare saved proof against a custom hiring brief instead of a preset role.",
    requiredSignals,
    preferredSignals,
    scoreWeights: inferScoreWeights(uniqueTokens),
  };
}
