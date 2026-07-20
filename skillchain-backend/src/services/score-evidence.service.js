function titleSignal(signal) {
  return signal
    .replace(/^has/, "")
    .replace(/^uses/, "")
    .replace(/([A-Z])/g, " $1")
    .trim();
}

function activeSignalNames(signals, names) {
  return names
    .filter((name) => Boolean(signals?.[name]))
    .map((name) => titleSignal(name));
}

function matchingFiles(selectedFiles, matchers) {
  return (selectedFiles || [])
    .filter((file) => {
      const value = `${file.kind || ""} ${file.path || ""}`.toLowerCase();
      return matchers.some((matcher) => value.includes(matcher));
    })
    .slice(0, 12)
    .map((file) => ({
      path: file.path,
      kind: file.kind,
      size: file.size,
    }));
}

function buildScoreEvidenceDetails(analysis) {
  const signals = analysis.deterministic?.signals || {};
  const frameworks = analysis.deterministic?.frameworks || [];
  const readme = analysis.deterministic?.readme || {};
  const fileStats = analysis.basis?.fileStats || {};
  const selectedFiles = analysis.basis?.selectedFiles || [];
  const frameworkSignal = frameworks.length
    ? [`Detected frameworks: ${frameworks.slice(0, 8).join(", ")}`]
    : [];

  return {
    backend: {
      signals: activeSignalNames(signals, [
        "hasBackend",
        "hasApiRoutes",
        "hasDatabase",
        "hasAuth",
        "hasValidation",
        "hasErrorHandling",
      ]),
      files: matchingFiles(selectedFiles, [
        "backend",
        "server",
        "api",
        "route",
        "service",
        "controller",
        "database",
        "supabase",
      ]),
      notes: [
        "Backend score uses backend, API, database, auth, validation, and error-handling signals.",
        `Backend files detected: ${fileStats.backendFiles || 0}.`,
      ],
    },
    frontend: {
      signals: activeSignalNames(signals, [
        "hasFrontend",
        "usesTypeScript",
        "hasValidation",
        "hasTests",
      ]),
      files: matchingFiles(selectedFiles, [
        "frontend",
        "component",
        "page",
        "app/",
        "src/",
        "style",
        "css",
      ]),
      notes: [
        ...frameworkSignal,
        "Frontend score uses UI, TypeScript, frontend files, validation, and test signals.",
        `Frontend files detected: ${fileStats.frontendFiles || 0}.`,
      ],
    },
    architecture: {
      signals: activeSignalNames(signals, [
        "hasFrontend",
        "hasBackend",
        "hasDatabase",
        "hasEnvConfig",
        "hasCiOrDeployment",
        "usesTypeScript",
      ]),
      files: matchingFiles(selectedFiles, [
        "package",
        "config",
        "middleware",
        "next.config",
        "vite",
        "docker",
        "workflow",
      ]),
      notes: [
        analysis.nlp?.architectureSummary || "Architecture summary was not saved.",
        "Architecture score uses directory count, source-file count, stack separation, database, config, deployment, and TypeScript signals.",
      ],
    },
    documentation: {
      signals: activeSignalNames(signals, ["hasDocs"]),
      files: matchingFiles(selectedFiles, ["readme", "docs", ".md"]),
      notes: [
        `README score: ${readme.score ?? 0}.`,
        `README words: ${readme.words ?? 0}, lines: ${readme.lines ?? 0}.`,
        "Documentation score uses README quality, docs presence, and setup instructions.",
      ],
    },
    codeQuality: {
      signals: activeSignalNames(signals, [
        "usesTypeScript",
        "hasTests",
        "hasErrorHandling",
        "hasValidation",
        "hasCiOrDeployment",
      ]),
      files: matchingFiles(selectedFiles, [
        "src",
        "test",
        "spec",
        "validation",
        "schema",
        "workflow",
      ]),
      notes: [
        `Source files detected: ${fileStats.sourceFiles || 0}. Test files detected: ${fileStats.testFiles || 0}.`,
        "Code quality score uses source volume, TypeScript, tests, error handling, validation, and CI/deployment signals.",
      ],
    },
    security: {
      signals: activeSignalNames(signals, [
        "hasAuth",
        "hasEnvConfig",
        "hasValidation",
        "hasErrorHandling",
        "hasCiOrDeployment",
        "hasBackend",
      ]),
      files: matchingFiles(selectedFiles, [
        "auth",
        "middleware",
        "env",
        "security",
        "validation",
        "schema",
        "api",
      ]),
      notes: [
        "Security score uses auth, environment config, validation, error handling, deployment, and backend signals.",
      ],
    },
    confidence: {
      signals: activeSignalNames(signals, ["hasTests"]),
      files: selectedFiles.slice(0, 12),
      notes: [
        "Confidence score uses total file count, inspected file count, README depth, test presence, and repository-size penalties.",
        `Total files: ${fileStats.totalFiles || 0}. Inspected files: ${selectedFiles.length}.`,
        analysis.basis?.treeTruncated
          ? "GitHub tree was truncated, so confidence was reduced."
          : "GitHub tree was not marked as truncated.",
      ],
    },
  };
}

module.exports = {
  buildScoreEvidenceDetails,
};
