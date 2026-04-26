const { fetchBlobText, fetchRepositorySnapshot } = require("./github.service");

const MAX_FILES_TO_READ = 18;
const MAX_FILE_BYTES = 120_000;
const MAX_TOTAL_CHARS = 180_000;

const IGNORED_PATH_PARTS = new Set([
  ".git",
  ".next",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "out",
  "target",
  "vendor",
]);

const TEXT_EXTENSIONS = new Set([
  ".c",
  ".cpp",
  ".cs",
  ".css",
  ".go",
  ".html",
  ".java",
  ".js",
  ".jsx",
  ".json",
  ".md",
  ".mjs",
  ".py",
  ".rb",
  ".rs",
  ".scss",
  ".sol",
  ".sql",
  ".ts",
  ".tsx",
  ".txt",
  ".yml",
  ".yaml",
]);

const EXTENSION_LANGUAGE_MAP = {
  ".c": "C",
  ".cpp": "C++",
  ".cs": "C#",
  ".css": "CSS",
  ".go": "Go",
  ".html": "HTML",
  ".java": "Java",
  ".js": "JavaScript",
  ".jsx": "JavaScript",
  ".mjs": "JavaScript",
  ".py": "Python",
  ".rb": "Ruby",
  ".rs": "Rust",
  ".sol": "Solidity",
  ".sql": "SQL",
  ".ts": "TypeScript",
  ".tsx": "TypeScript",
};

const FRAMEWORK_PATTERNS = [
  ["Next.js", ["next"]],
  ["React", ["react"]],
  ["Express", ["express"]],
  ["Supabase", ["@supabase/supabase-js", "@supabase/ssr", "supabase"]],
  ["Tailwind CSS", ["tailwindcss", "@tailwindcss/postcss"]],
  ["Three.js", ["three"]],
  ["Framer Motion", ["framer-motion"]],
  ["Django", ["django"]],
  ["FastAPI", ["fastapi"]],
  ["Flask", ["flask"]],
  ["Prisma", ["prisma", "@prisma/client"]],
  ["Hardhat", ["hardhat"]],
  ["Ethers", ["ethers"]],
  ["OpenAI", ["openai"]],
];

const SKILL_KEYWORDS = {
  "API design": ["router", "route", "controller", "middleware", "endpoint", "api"],
  Authentication: ["auth", "oauth", "jwt", "session", "login", "signup"],
  "Database design": ["schema", "migration", "supabase", "prisma", "sql", "model"],
  "Frontend UI": ["component", "page", "layout", "button", "form", "react"],
  Testing: ["test", "spec", "jest", "vitest", "playwright", "cypress"],
  Security: ["cors", "helmet", "csrf", "sanitize", "validate", "permission"],
  Deployment: ["docker", "vercel", "netlify", "render", "deploy", "ci"],
  "AI/ML": ["model", "embedding", "nlp", "classification", "openai", "tensorflow"],
  Blockchain: ["solidity", "contract", "polygon", "ethers", "web3", "wallet"],
};

function getExtension(path) {
  const match = path.toLowerCase().match(/\.[a-z0-9]+$/);
  return match ? match[0] : "";
}

function isIgnoredPath(path) {
  return path
    .split("/")
    .some((part) => IGNORED_PATH_PARTS.has(part.toLowerCase()));
}

function isTextFile(path) {
  const lowerPath = path.toLowerCase();

  if (
    lowerPath === "dockerfile" ||
    lowerPath.endsWith("readme") ||
    lowerPath.endsWith(".env.example")
  ) {
    return true;
  }

  return TEXT_EXTENSIONS.has(getExtension(path));
}

function classifyFile(path) {
  const lowerPath = path.toLowerCase();

  if (/(^|\/)readme(\.[a-z0-9]+)?$/.test(lowerPath)) return "readme";
  if (/(^|\/)(test|tests|__tests__|spec)\//.test(lowerPath) || /\.(test|spec)\.[a-z]+$/.test(lowerPath)) return "test";
  if (/(^|\/)(docs|documentation)\//.test(lowerPath) || lowerPath.endsWith(".md")) return "docs";
  if (/(package\.json|requirements\.txt|pyproject\.toml|pom\.xml|cargo\.toml|go\.mod)$/.test(lowerPath)) return "manifest";
  if (/(schema|migration|migrations|prisma|supabase|\.sql$)/.test(lowerPath)) return "database";
  if (/(route|routes|controller|api|server|middleware)/.test(lowerPath)) return "backend";
  if (/(component|components|page|pages|app\/|src\/app|styles?)/.test(lowerPath)) return "frontend";
  if (/(config|dockerfile|\.yml$|\.yaml$|\.env\.example$)/.test(lowerPath)) return "config";

  return "source";
}

function selectFilesForContent(files) {
  const weighted = files
    .filter((file) => file.type === "blob")
    .filter((file) => !isIgnoredPath(file.path))
    .filter((file) => isTextFile(file.path))
    .filter((file) => !file.size || file.size <= MAX_FILE_BYTES)
    .map((file) => {
      const kind = classifyFile(file.path);
      const depth = file.path.split("/").length - 1;
      const lowerPath = file.path.toLowerCase();
      const rootBoost = depth === 0 ? 35 : 0;
      const appBoost = /^(src|app|pages|routes|server|api)\//.test(lowerPath) ? 10 : 0;
      const weights = {
        readme: 100,
        manifest: 95,
        backend: 85,
        database: 82,
        frontend: 72,
        test: 68,
        config: 62,
        docs: 58,
        source: 45,
      };

      return {
        ...file,
        kind,
        weight: (weights[kind] || 40) + rootBoost + appBoost - depth,
      };
    });

  return weighted
    .sort((a, b) => b.weight - a.weight || a.path.localeCompare(b.path))
    .slice(0, MAX_FILES_TO_READ);
}

async function fetchSelectedContents(snapshot, selectedFiles) {
  let totalChars = 0;
  const results = [];

  for (const file of selectedFiles) {
    if (totalChars >= MAX_TOTAL_CHARS) break;

    try {
      const content = await fetchBlobText(snapshot.owner, snapshot.repo, file.sha);
      const trimmed = content.slice(0, MAX_TOTAL_CHARS - totalChars);
      totalChars += trimmed.length;
      results.push({
        path: file.path,
        kind: file.kind,
        size: file.size || trimmed.length,
        content: trimmed,
      });
    } catch (_error) {
      results.push({
        path: file.path,
        kind: file.kind,
        size: file.size || 0,
        content: "",
      });
    }
  }

  return results;
}

function countBy(items, mapper) {
  return items.reduce((counts, item) => {
    const key = mapper(item);
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
}

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function extractPackageNames(fileContents) {
  const packages = new Set();

  for (const file of fileContents) {
    const lowerPath = file.path.toLowerCase();

    if (lowerPath.endsWith("package.json")) {
      try {
        const parsed = JSON.parse(file.content);
        const groups = [
          parsed.dependencies,
          parsed.devDependencies,
          parsed.peerDependencies,
          parsed.optionalDependencies,
        ];

        for (const group of groups) {
          if (!group) continue;
          Object.keys(group).forEach((name) => packages.add(name.toLowerCase()));
        }
      } catch (_error) {
        continue;
      }
    }

    if (lowerPath.endsWith("requirements.txt")) {
      file.content
        .split(/\r?\n/)
        .map((line) => line.trim().split(/[=<>~! ]/)[0])
        .filter(Boolean)
        .forEach((name) => packages.add(name.toLowerCase()));
    }

    if (lowerPath.endsWith("pyproject.toml")) {
      const matches = file.content.match(/[A-Za-z0-9_.-]+(?=[<>=~!])/g) || [];
      matches.forEach((name) => packages.add(name.toLowerCase()));
    }
  }

  return [...packages].sort();
}

function detectFrameworks(packageNames, allText, paths) {
  const frameworks = new Set();
  const lowerText = allText.toLowerCase();
  const lowerPaths = paths.map((path) => path.toLowerCase());

  for (const [framework, patterns] of FRAMEWORK_PATTERNS) {
    if (
      patterns.some((pattern) => packageNames.includes(pattern)) ||
      patterns.some((pattern) => lowerText.includes(pattern))
    ) {
      frameworks.add(framework);
    }
  }

  if (lowerPaths.some((path) => path.includes("next.config"))) frameworks.add("Next.js");
  if (lowerPaths.some((path) => path.includes("tailwind.config"))) frameworks.add("Tailwind CSS");
  if (lowerPaths.some((path) => path.endsWith(".sol"))) frameworks.add("Solidity");

  return [...frameworks].sort();
}

function analyzeReadme(fileContents) {
  const readme = fileContents.find((file) => file.kind === "readme");

  if (!readme || !readme.content.trim()) {
    return {
      exists: false,
      lines: 0,
      words: 0,
      hasSetupInstructions: false,
      hasUsageSection: false,
      hasArchitectureNotes: false,
      score: 0,
      note: "No README content was found.",
    };
  }

  const content = readme.content.trim();
  const lines = content.split(/\r?\n/).filter((line) => line.trim()).length;
  const words = content.split(/\s+/).filter(Boolean).length;
  const lower = content.toLowerCase();
  const headings = (content.match(/^#{1,6}\s+/gm) || []).length;
  const codeBlocks = (content.match(/```/g) || []).length / 2;
  const hasSetupInstructions = /(install|setup|getting started|npm install|pip install|run locally)/.test(lower);
  const hasUsageSection = /(usage|example|demo|features?)/.test(lower);
  const hasArchitectureNotes = /(architecture|stack|design|database|api|workflow)/.test(lower);

  const score = clampScore(
    Math.min(words / 5, 28) +
      Math.min(lines * 2, 20) +
      headings * 5 +
      codeBlocks * 4 +
      (hasSetupInstructions ? 16 : 0) +
      (hasUsageSection ? 12 : 0) +
      (hasArchitectureNotes ? 14 : 0)
  );

  return {
    exists: true,
    lines,
    words,
    hasSetupInstructions,
    hasUsageSection,
    hasArchitectureNotes,
    score,
    note:
      lines <= 2
        ? "README is extremely short, so documentation score is intentionally limited."
        : "README provides usable project context.",
  };
}

function detectSignals(paths, allText, packageNames) {
  const lowerText = allText.toLowerCase();
  const lowerPaths = paths.map((path) => path.toLowerCase());
  const hasPath = (patterns) => lowerPaths.some((path) => patterns.some((pattern) => pattern.test(path)));
  const hasText = (patterns) => patterns.some((pattern) => pattern.test(lowerText));

  return {
    hasReadme: lowerPaths.some((path) => /(^|\/)readme/.test(path)),
    hasTests: hasPath([/(^|\/)(test|tests|__tests__|spec)\//, /\.(test|spec)\.[a-z]+$/]),
    hasDocs: hasPath([/(^|\/)(docs|documentation)\//]) || lowerPaths.filter((path) => path.endsWith(".md")).length > 1,
    hasApiRoutes: hasPath([/(^|\/)(api|routes|controllers?)\//, /route\.[jt]s$/, /server\.[jt]s$/]) || hasText([/express\(/, /router\./, /app\.(get|post|put|delete)/]),
    hasDatabase: hasPath([/schema\.sql$/, /prisma\//, /migrations?\//, /supabase\//]) || hasText([/create table/, /from\(["'`]/, /select\(/, /insert\(/]),
    hasAuth: hasPath([/auth/]) || hasText([/oauth/, /jwt/, /session/, /signin|sign in|login|logout/]),
    hasEnvConfig: hasPath([/\.env\.example$/, /config\/.*env/, /config\./]) || lowerText.includes("process.env"),
    hasValidation: hasText([/zod/, /joi/, /yup/, /validate/, /validation/, /required/]),
    hasErrorHandling: hasText([/try\s*{/, /catch\s*\(/, /throw new error/, /status\(4\d\d\)/, /status\(5\d\d\)/]),
    hasCiOrDeployment: hasPath([/\.github\/workflows\//, /dockerfile$/, /vercel\.json$/, /netlify\.toml$/]),
    usesTypeScript: packageNames.includes("typescript") || hasPath([/\.ts$/, /\.tsx$/]),
    hasFrontend: hasPath([/(^|\/)(components|pages|app)\//, /\.tsx$/, /\.jsx$/]) || packageNames.includes("react"),
    hasBackend: hasPath([/(^|\/)(routes|controllers|server|api)\//]) || packageNames.includes("express") || packageNames.includes("fastapi"),
    hasBlockchain: hasPath([/\.sol$/]) || hasText([/solidity/, /contract/, /ethers/, /polygon/, /wallet/]),
    hasAiMl: hasText([/openai/, /embedding/, /nlp/, /tensorflow/, /pytorch/, /model/]),
  };
}

function detectSkillEvidence(allText, signals, frameworks) {
  const lowerText = allText.toLowerCase();
  const evidence = new Set(frameworks);

  for (const [skill, keywords] of Object.entries(SKILL_KEYWORDS)) {
    if (keywords.some((keyword) => lowerText.includes(keyword))) {
      evidence.add(skill);
    }
  }

  if (signals.hasFrontend) evidence.add("Frontend development");
  if (signals.hasBackend) evidence.add("Backend development");
  if (signals.hasDatabase) evidence.add("Database integration");
  if (signals.hasAuth) evidence.add("Authentication flows");
  if (signals.hasTests) evidence.add("Testing practices");

  return [...evidence].sort();
}

function classifyProjectType(signals, frameworks) {
  if (signals.hasBlockchain) return "blockchain project";
  if (signals.hasAiMl) return "AI/ML project";
  if (signals.hasFrontend && signals.hasBackend) return "full-stack web app";
  if (signals.hasBackend) return "backend/API project";
  if (signals.hasFrontend) return "frontend web app";
  if (frameworks.length > 0) return "software project";
  return "general code repository";
}

function buildInterpretation({ signals, frameworks, readme, fileStats, allText }) {
  const projectType = classifyProjectType(signals, frameworks);
  const skillEvidence = detectSkillEvidence(allText, signals, frameworks);
  const strengths = [];
  const risks = [];

  if (signals.hasFrontend && signals.hasBackend) strengths.push("Contains both frontend and backend implementation signals.");
  if (signals.hasDatabase) strengths.push("Includes database or persistence-layer evidence.");
  if (signals.hasAuth) strengths.push("Shows authentication or identity-flow evidence.");
  if (signals.hasTests) strengths.push("Includes test files or testing framework usage.");
  if (signals.usesTypeScript) strengths.push("Uses TypeScript or typed source files.");
  if (signals.hasCiOrDeployment) strengths.push("Includes deployment or CI configuration.");
  if (readme.lines <= 2) risks.push("README is too small to explain the project well.");
  if (!signals.hasTests) risks.push("No clear test files were detected.");
  if (!signals.hasValidation && signals.hasBackend) risks.push("Backend validation evidence is limited.");
  if (!signals.hasErrorHandling && signals.hasBackend) risks.push("Error-handling evidence is limited.");
  if (fileStats.sourceFiles < 4) risks.push("Repository has limited source-file evidence.");

  return {
    projectType,
    skillEvidence,
    architectureSummary: buildArchitectureSummary(projectType, signals, frameworks),
    strengths,
    risks,
  };
}

function buildArchitectureSummary(projectType, signals, frameworks) {
  const stack = frameworks.length ? ` using ${frameworks.slice(0, 5).join(", ")}` : "";

  if (signals.hasFrontend && signals.hasBackend && signals.hasDatabase) {
    return `A ${projectType}${stack} with visible UI, API, and persistence layers.`;
  }

  if (signals.hasFrontend && signals.hasBackend) {
    return `A ${projectType}${stack} with separate UI and server/API signals.`;
  }

  if (signals.hasBackend) {
    return `A ${projectType}${stack} with backend route or service-layer signals.`;
  }

  if (signals.hasFrontend) {
    return `A ${projectType}${stack} with component/page-based frontend structure.`;
  }

  return `A ${projectType}${stack}; more source evidence would improve classification.`;
}

function computeScores({ signals, readme, fileStats, selectedFileCount, treeTruncated }) {
  const documentation = clampScore(
    readme.score + (signals.hasDocs ? 12 : 0) + (readme.hasSetupInstructions ? 4 : 0)
  );

  const backend = clampScore(
    (signals.hasBackend ? 25 : 0) +
      (signals.hasApiRoutes ? 22 : 0) +
      (signals.hasDatabase ? 18 : 0) +
      (signals.hasAuth ? 14 : 0) +
      (signals.hasValidation ? 10 : 0) +
      (signals.hasErrorHandling ? 11 : 0)
  );

  const frontend = clampScore(
    (signals.hasFrontend ? 34 : 0) +
      (signals.usesTypeScript ? 14 : 0) +
      (fileStats.frontendFiles > 0 ? 18 : 0) +
      (signals.hasValidation ? 8 : 0) +
      (signals.hasTests ? 12 : 0)
  );

  const architecture = clampScore(
    Math.min(fileStats.directories * 3, 18) +
      Math.min(fileStats.sourceFiles * 2, 24) +
      (signals.hasFrontend && signals.hasBackend ? 20 : 0) +
      (signals.hasDatabase ? 12 : 0) +
      (signals.hasEnvConfig ? 8 : 0) +
      (signals.hasCiOrDeployment ? 8 : 0) +
      (signals.usesTypeScript ? 10 : 0)
  );

  const codeQuality = clampScore(
    Math.min(fileStats.sourceFiles * 2, 24) +
      (signals.usesTypeScript ? 18 : 0) +
      (signals.hasTests ? 22 : 0) +
      (signals.hasErrorHandling ? 14 : 0) +
      (signals.hasValidation ? 12 : 0) +
      (signals.hasCiOrDeployment ? 10 : 0)
  );

  const security = clampScore(
    (signals.hasAuth ? 24 : 0) +
      (signals.hasEnvConfig ? 20 : 0) +
      (signals.hasValidation ? 22 : 0) +
      (signals.hasErrorHandling ? 12 : 0) +
      (signals.hasCiOrDeployment ? 8 : 0) +
      (signals.hasBackend ? 6 : 0)
  );

  const confidence = clampScore(
    Math.min(fileStats.totalFiles, 80) * 0.35 +
      Math.min(selectedFileCount, MAX_FILES_TO_READ) * 0.55 +
      Math.min(readme.words / 6, 18) +
      (signals.hasTests ? 10 : 0) +
      (treeTruncated ? -12 : 0) +
      (fileStats.sourceFiles < 4 ? -12 : 0)
  );

  return {
    backend,
    frontend,
    architecture,
    documentation,
    codeQuality,
    security,
    confidence,
  };
}

function buildSummary({ readme, signals, interpretation, scores }) {
  const parts = [
    `This looks like a ${interpretation.projectType}.`,
    interpretation.architectureSummary,
  ];

  if (readme.lines <= 2) {
    parts.push("Documentation is weak because the README has very little content, but the analyzer still used code, structure, dependencies, and config files.");
  }

  if (signals.hasTests) {
    parts.push("Test evidence improves the code-quality confidence.");
  } else {
    parts.push("No clear tests were detected, so code-quality confidence is reduced.");
  }

  parts.push(
    `Top scores are architecture ${scores.architecture}, backend ${scores.backend}, frontend ${scores.frontend}, and documentation ${scores.documentation}.`
  );

  return parts.join(" ");
}

function buildFileStats(snapshot) {
  const files = snapshot.tree.filter((item) => item.type === "blob" && !isIgnoredPath(item.path));
  const directories = new Set();

  for (const file of files) {
    const parts = file.path.split("/");
    parts.pop();
    parts.forEach((part, index) => {
      directories.add(parts.slice(0, index + 1).join("/"));
    });
  }

  const extensionCounts = countBy(
    files.filter((file) => getExtension(file.path)),
    (file) => getExtension(file.path)
  );
  const languageCounts = {};

  for (const [extension, count] of Object.entries(extensionCounts)) {
    const language = EXTENSION_LANGUAGE_MAP[extension];
    if (language) languageCounts[language] = (languageCounts[language] || 0) + count;
  }

  return {
    totalFiles: files.length,
    sourceFiles: files.filter((file) => isTextFile(file.path) && classifyFile(file.path) === "source").length,
    testFiles: files.filter((file) => classifyFile(file.path) === "test").length,
    docsFiles: files.filter((file) => ["docs", "readme"].includes(classifyFile(file.path))).length,
    configFiles: files.filter((file) => classifyFile(file.path) === "config").length,
    backendFiles: files.filter((file) => classifyFile(file.path) === "backend").length,
    frontendFiles: files.filter((file) => classifyFile(file.path) === "frontend").length,
    directories: [...directories].filter(Boolean).length,
    languageCounts,
  };
}

async function analyzeRepository(repoUrl, branch) {
  const snapshot = await fetchRepositorySnapshot(repoUrl, branch);
  const fileStats = buildFileStats(snapshot);
  const selectedFiles = selectFilesForContent(snapshot.tree);
  const fileContents = await fetchSelectedContents(snapshot, selectedFiles);
  const allText = fileContents.map((file) => `\n--- ${file.path} ---\n${file.content}`).join("\n");
  const paths = snapshot.tree.map((item) => item.path);
  const packageNames = extractPackageNames(fileContents);
  const frameworks = detectFrameworks(packageNames, allText, paths);
  const readme = analyzeReadme(fileContents);
  const signals = detectSignals(paths, allText, packageNames);
  const interpretation = buildInterpretation({
    signals,
    frameworks,
    readme,
    fileStats,
    allText,
  });
  const scores = computeScores({
    signals,
    readme,
    fileStats,
    selectedFileCount: fileContents.length,
    treeTruncated: snapshot.truncated,
  });

  return {
    analysisVersion: "hybrid-nlp-v1",
    repo: {
      ...snapshot.metadata,
      owner: snapshot.owner,
      repo: snapshot.repo,
      branch: snapshot.branch,
    },
    basis: {
      metadata: snapshot.metadata,
      githubLanguages: snapshot.languages,
      fileStats,
      selectedFiles: fileContents.map((file) => ({
        path: file.path,
        kind: file.kind,
        size: file.size,
      })),
      treeTruncated: snapshot.truncated,
    },
    deterministic: {
      packageNames,
      frameworks,
      readme,
      signals,
    },
    nlp: interpretation,
    scores,
    summary: buildSummary({ readme, signals, interpretation, scores }),
  };
}

module.exports = {
  analyzeRepository,
};
