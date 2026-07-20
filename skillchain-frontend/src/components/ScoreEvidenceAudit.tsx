import {
  Activity,
  Code2,
  FileSearch,
  Layers3,
  LockKeyhole,
  ServerCog,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { titleCase } from "@/lib/formatting";

type EvidenceFile = {
  path?: string;
  kind?: string;
  size?: number;
};

type ScoreEvidence = {
  signals?: string[];
  files?: EvidenceFile[];
  notes?: string[];
};

type MetricLike = {
  files?: number | null;
  test_ratio?: number | null;
  raw_metrics_json?: {
    fileStats?: {
      totalFiles?: number;
      sourceFiles?: number;
      testFiles?: number;
      docsFiles?: number;
      backendFiles?: number;
      frontendFiles?: number;
    };
    frameworks?: string[];
    packageNames?: string[];
    signals?: Record<string, boolean>;
    selectedFiles?: EvidenceFile[];
    readme?: {
      score?: number;
      words?: number;
      lines?: number;
      hasSetupInstructions?: boolean;
    };
    treeTruncated?: boolean;
    summary?: string;
  } | null;
};

type ScoreLike = {
  backend_score?: number | null;
  architecture_score?: number | null;
  documentation_score?: number | null;
  confidence_score?: number | null;
  score_breakdown_json?: {
    frontend?: number;
    codeQuality?: number;
    security?: number;
    strengths?: string[];
    risks?: string[];
    skillEvidence?: string[];
    projectType?: string;
    architectureSummary?: string;
    scoreEvidenceDetails?: Record<string, ScoreEvidence>;
  } | null;
};

type ScoreEvidenceAuditProps = {
  metric?: MetricLike | null;
  score?: ScoreLike | null;
  compact?: boolean;
};

const SCORE_META = [
  {
    key: "backend",
    label: "Backend",
    icon: ServerCog,
    getScore: (score?: ScoreLike | null) => score?.backend_score ?? null,
  },
  {
    key: "frontend",
    label: "Frontend",
    icon: Layers3,
    getScore: (score?: ScoreLike | null) => score?.score_breakdown_json?.frontend ?? null,
  },
  {
    key: "architecture",
    label: "Architecture",
    icon: Activity,
    getScore: (score?: ScoreLike | null) => score?.architecture_score ?? null,
  },
  {
    key: "documentation",
    label: "Documentation",
    icon: FileSearch,
    getScore: (score?: ScoreLike | null) => score?.documentation_score ?? null,
  },
  {
    key: "codeQuality",
    label: "Code Quality",
    icon: Code2,
    getScore: (score?: ScoreLike | null) => score?.score_breakdown_json?.codeQuality ?? null,
  },
  {
    key: "security",
    label: "Security",
    icon: LockKeyhole,
    getScore: (score?: ScoreLike | null) => score?.score_breakdown_json?.security ?? null,
  },
  {
    key: "confidence",
    label: "Confidence",
    icon: ShieldCheck,
    getScore: (score?: ScoreLike | null) => score?.confidence_score ?? null,
  },
];

function formatSignal(signal: string) {
  return titleCase(
    signal
      .replace(/^has/, "")
      .replace(/^uses/, "")
      .replace(/([A-Z])/g, " $1")
      .trim()
  );
}

function activeSignals(metric?: MetricLike | null) {
  return Object.entries(metric?.raw_metrics_json?.signals || {})
    .filter(([, value]) => Boolean(value))
    .map(([key]) => formatSignal(key));
}

function fallbackEvidence(
  metric?: MetricLike | null,
  score?: ScoreLike | null
): Record<string, ScoreEvidence> {
  const raw = metric?.raw_metrics_json;
  const files = raw?.selectedFiles || [];
  const signals = activeSignals(metric);
  const frameworks = raw?.frameworks || [];
  const fileStats = raw?.fileStats || {};
  const readme = raw?.readme || {};

  return {
    backend: {
      signals: signals.filter((item) =>
        /backend|api|database|auth|validation|error/i.test(item)
      ),
      files: files.filter((file) =>
        /backend|server|api|route|service|controller|database|supabase/i.test(
          `${file.kind || ""} ${file.path || ""}`
        )
      ),
      notes: [
        `Backend file count: ${fileStats.backendFiles ?? 0}.`,
        "Older records may only contain general signals, not exact per-score file mapping.",
      ],
    },
    frontend: {
      signals: signals.filter((item) => /frontend|type script|test|validation/i.test(item)),
      files: files.filter((file) =>
        /frontend|component|page|app\/|src\/|style|css/i.test(`${file.kind || ""} ${file.path || ""}`)
      ),
      notes: [
        frameworks.length
          ? `Detected frameworks: ${frameworks.slice(0, 8).join(", ")}.`
          : "No framework list was saved.",
        `Frontend file count: ${fileStats.frontendFiles ?? 0}.`,
      ],
    },
    architecture: {
      signals,
      files: files.filter((file) =>
        /package|config|middleware|next\.config|vite|docker|workflow/i.test(`${file.kind || ""} ${file.path || ""}`)
      ),
      notes: [
        score?.score_breakdown_json?.architectureSummary ||
          "Architecture was scored from source structure, stack separation, config, deployment, and typed-code signals.",
      ],
    },
    documentation: {
      signals: signals.filter((item) => /docs/i.test(item)),
      files: files.filter((file) => /readme|docs|\.md/i.test(`${file.kind || ""} ${file.path || ""}`)),
      notes: [
        `README score: ${readme.score ?? 0}.`,
        `README words: ${readme.words ?? 0}, lines: ${readme.lines ?? 0}.`,
      ],
    },
    codeQuality: {
      signals: signals.filter((item) => /type script|test|error|validation|ci|deployment/i.test(item)),
      files: files.filter((file) => /src|test|spec|validation|schema|workflow/i.test(`${file.kind || ""} ${file.path || ""}`)),
      notes: [
        `Source files: ${fileStats.sourceFiles ?? 0}. Test files: ${fileStats.testFiles ?? 0}.`,
      ],
    },
    security: {
      signals: signals.filter((item) => /auth|env|validation|error|deployment|backend/i.test(item)),
      files: files.filter((file) => /auth|middleware|env|security|validation|schema|api/i.test(`${file.kind || ""} ${file.path || ""}`)),
      notes: ["Security is scored from auth, env config, validation, error handling, deployment, and backend signals."],
    },
    confidence: {
      signals: signals.filter((item) => /test/i.test(item)),
      files: files.slice(0, 12),
      notes: [
        `Total files: ${fileStats.totalFiles ?? metric?.files ?? 0}. Inspected files: ${files.length}.`,
        raw?.treeTruncated
          ? "Repository tree was truncated, so confidence was reduced."
          : "Repository tree was not marked as truncated.",
      ],
    },
  };
}

export default function ScoreEvidenceAudit({
  metric,
  score,
  compact = false,
}: ScoreEvidenceAuditProps) {
  const storedEvidence = score?.score_breakdown_json?.scoreEvidenceDetails || {};
  const fallback = fallbackEvidence(metric, score);
  const hasStoredAudit = Object.keys(storedEvidence).length > 0;

  return (
    <section className="rounded-[2rem] border border-[#a8f5e9]/20 bg-[linear-gradient(135deg,rgba(168,245,233,0.10),rgba(15,23,42,0.42)_42%,rgba(2,6,23,0.72))] p-5 shadow-sm backdrop-blur-xl sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#a8f5e9]/25 bg-[#a8f5e9]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#a8f5e9]">
            <Sparkles className="h-3.5 w-3.5" />
            Score Evidence Audit
          </p>
          <h2 className="mt-3 text-xl font-semibold tracking-tight text-white">
            Files and signals behind each score
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
            This shows the saved evidence used by the analyzer. New analyses include
            per-score file and signal mapping; older records may show only the evidence
            that was saved at the time.
          </p>
        </div>
        <span className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80">
          {hasStoredAudit ? "Per-score audit saved" : "Fallback audit view"}
        </span>
      </div>

      <div className={`mt-5 grid gap-4 ${compact ? "lg:grid-cols-2" : "xl:grid-cols-2"}`}>
        {SCORE_META.map((item) => {
          const Icon = item.icon;
          const evidence = storedEvidence[item.key] || fallback[item.key];
          const scoreValue = item.getScore(score);
          const signals = evidence?.signals || [];
          const files = evidence?.files || [];
          const notes = evidence?.notes || [];

          return (
            <article
              key={item.key}
              className="rounded-[1.4rem] border border-white/10 bg-background/50 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#a8f5e9]/20 bg-[#a8f5e9]/10 text-[#a8f5e9]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-white">{item.label}</h3>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted">
                      Saved score input
                    </p>
                  </div>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-bold text-white">
                  {scoreValue ?? "N/A"}
                </span>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
                    Signals
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {signals.length ? (
                      signals.slice(0, 8).map((signal, index) => (
                        <span
                          key={`${item.key}-signal-${signal}-${index}`}
                          className="rounded-full border border-[#a8f5e9]/20 bg-[#a8f5e9]/10 px-2.5 py-1 text-xs font-medium text-[#d8fff9]"
                        >
                          {signal}
                        </span>
                      ))
                    ) : (
                      <p className="text-xs leading-relaxed text-muted">
                        No specific signal was saved for this score.
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
                    Files
                  </p>
                  <ul className="mt-2 max-h-36 space-y-2 overflow-y-auto pr-1">
                    {files.length ? (
                      files.slice(0, 8).map((file, index) => (
                        <li
                          key={`${item.key}-file-${file.path}-${index}`}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs leading-relaxed text-white/80"
                        >
                          {file.kind ? (
                            <span className="font-semibold text-white/90">{file.kind}: </span>
                          ) : null}
                          <span className="break-all">{file.path || "Unknown file"}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-xs leading-relaxed text-muted">
                        No file-level evidence was saved for this score.
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
                  Why this affected the score
                </p>
                <ul className="mt-2 space-y-1.5">
                  {notes.length ? (
                    notes.slice(0, 4).map((note, index) => (
                      <li key={`${item.key}-note-${index}`} className="text-xs leading-relaxed text-white/75">
                        {note}
                      </li>
                    ))
                  ) : (
                    <li className="text-xs leading-relaxed text-muted">
                      No scoring note was saved for this score.
                    </li>
                  )}
                </ul>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
