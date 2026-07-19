"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, startTransition } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  BriefcaseBusiness,
  ClipboardList,
  FileSearch,
  FolderKanban,
  GitBranch,
  Search,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import EmptyStateCard from "@/components/EmptyStateCard";
import StatePanel from "@/components/StatePanel";
import { getPublicEnv } from "@/lib/env";
import {
  pushRecruiterRecentSearch,
  type PublicRepoAnalysis,
} from "@/lib/recruiter-public-repos";

type PublicRepoResultClientProps = {
  recruiterId: string;
  initialRepoUrl: string;
  initialBranch: string;
};

function normalizeErrorMessage(message: string) {
  if (message.includes("Private repositories cannot be analyzed")) {
    return "This recruiter path only works for public GitHub repositories.";
  }

  if (message.includes("Repository not found")) {
    return "SkillChain could not read that repository. Recheck the URL and make sure it is public.";
  }

  return message;
}

function scoreLabel(label: string) {
  return label.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}

function signalChips(items: string[], tone: "mint" | "amber" | "sky") {
  const styles =
    tone === "mint"
      ? "border-[#a8f5e9]/20 bg-[#a8f5e9]/10 text-[#a8f5e9]"
      : tone === "amber"
        ? "border-amber-300/20 bg-amber-300/10 text-amber-200"
        : "border-sky-300/20 bg-sky-300/10 text-sky-200";

  if (!items.length) {
    return <p className="text-sm text-white/50">No strong signal detected.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.slice(0, 12).map((item) => (
        <span
          key={item}
          className={`rounded-full border px-3 py-1 text-xs font-medium ${styles}`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export default function PublicRepoResultClient({
  recruiterId,
  initialRepoUrl,
  initialBranch,
}: PublicRepoResultClientProps) {
  const [analysis, setAnalysis] = useState<PublicRepoAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(initialRepoUrl));

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    async function loadAnalysis() {
      if (!initialRepoUrl.trim()) {
        startTransition(() => {
          setAnalysis(null);
          setError(null);
          setIsLoading(false);
        });
        return;
      }

      startTransition(() => {
        setIsLoading(true);
        setError(null);
      });

      try {
        const { apiBaseUrl } = getPublicEnv();
        const baseUrl = apiBaseUrl.replace(/\/$/, "");
        const apiRoot = baseUrl.endsWith("/api/v1")
          ? baseUrl
          : `${baseUrl}/api/v1`;

        const response = await fetch(`${apiRoot}/projects/preview`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          body: JSON.stringify({
            repoUrl: initialRepoUrl,
            branch: initialBranch || undefined,
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Repository analysis failed.");
        }

        if (!isActive) return;

        pushRecruiterRecentSearch(initialRepoUrl, initialBranch, recruiterId);

        startTransition(() => {
          setAnalysis(result.data.analysis as PublicRepoAnalysis);
          setError(null);
          setIsLoading(false);
        });
      } catch (caughtError) {
        if (caughtError instanceof DOMException && caughtError.name === "AbortError") return;
        if (!isActive) return;

        startTransition(() => {
          setAnalysis(null);
          setError(
            caughtError instanceof Error
              ? normalizeErrorMessage(caughtError.message)
              : "Could not load recruiter repo analysis."
          );
          setIsLoading(false);
        });
      }
    }

    void loadAnalysis();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [initialBranch, initialRepoUrl, recruiterId]);

  const scoreEntries = useMemo(
    () => (analysis ? Object.entries(analysis.scores) : []),
    [analysis]
  );

  if (!initialRepoUrl.trim()) {
    return (
      <EmptyStateCard
        title="No public repo selected yet"
        message="Open the recruiter public repo page first, paste a public GitHub repository, and then the screening result will appear here."
        actionHref="/dashboard/recruiter/public-repos"
        actionLabel="Open recruiter repo intake"
      />
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <section className="rounded-[2.3rem] border border-white/10 bg-[linear-gradient(135deg,rgba(10,14,27,0.96),rgba(11,28,37,0.92),rgba(168,245,233,0.08))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-2xl sm:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#a8f5e9]/20 bg-[#a8f5e9]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a8f5e9]">
              <FileSearch className="h-3.5 w-3.5" />
              Recruiter result
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Public repo screening result
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/68 sm:text-base">
                This view analyzes one public repository for recruiter review only. It does not attach the project to a developer profile or create saved profile proof.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-white/75">
                Repo: {initialRepoUrl}
              </span>
              <span className="rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1 text-[11px] font-medium text-sky-200">
                Branch: {initialBranch || "default"}
              </span>
            </div>
          </div>

          <div className="grid gap-3">
            <article className="rounded-[1.6rem] border border-white/10 bg-black/20 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#a8f5e9]/20 bg-[#a8f5e9]/10 text-[#a8f5e9]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                What this confirms
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/65">
                Tech evidence, strengths, risks, and scoring for one public repository in a recruiter-readable layout.
              </p>
            </article>
            <article className="rounded-[1.6rem] border border-white/10 bg-black/20 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-300/20 bg-sky-300/10 text-sky-200">
                <BriefcaseBusiness className="h-5 w-5" />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                Important limit
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/65">
                This is a recruiter screening view, not a saved ownership-backed project certificate.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="flex flex-wrap gap-3">
        <Link
          href="/dashboard/recruiter/public-repos"
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          <Search className="h-4 w-4" />
          Analyze another repo
        </Link>
        <Link
          href="/dashboard/recruiter"
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#a8f5e9]/20 bg-[#a8f5e9]/10 px-4 py-2 text-sm font-semibold text-[#a8f5e9] transition hover:border-[#a8f5e9]/35 hover:bg-[#a8f5e9]/14"
        >
          <FolderKanban className="h-4 w-4" />
          Open recruiter workspace
        </Link>
        {analysis?.repo?.htmlUrl ? (
          <a
            href={analysis.repo.htmlUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/10 px-4 py-2 text-sm font-semibold text-sky-200 transition hover:bg-sky-300/14"
          >
            <ArrowUpRight className="h-4 w-4" />
            View repo on GitHub
          </a>
        ) : null}
      </section>

      {isLoading ? (
        <StatePanel
          variant="loading"
          title="Analyzing public repository"
          message="SkillChain is reading the public repo and preparing the recruiter summary."
        />
      ) : null}

      {error ? (
        <StatePanel
          variant="error"
          title="Recruiter screening could not be loaded"
          message={error}
        />
      ) : null}

      {!isLoading && !error && analysis ? (
        <>
          <section className="rounded-[2rem] border border-white/10 bg-surface/45 p-6 shadow-sm backdrop-blur-xl">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a8f5e9]">
                  Repository summary
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {analysis.repo.fullName}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/65">
                  {analysis.summary}
                </p>
              </div>
              <div className="rounded-[1.2rem] border border-white/10 bg-background/35 px-4 py-3 text-sm text-white/70">
                <span className="font-medium text-white">Analysis branch:</span>{" "}
                {analysis.repo.branch}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
              {scoreEntries.map(([label, score]) => (
                <article
                  key={label}
                  className="rounded-[1.25rem] border border-white/10 bg-background/35 p-4"
                >
                  <p className="text-xs text-white/45">{scoreLabel(label)}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{score}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="grid gap-5 xl:grid-cols-3">
            <article className="rounded-[1.8rem] border border-white/10 bg-surface/45 p-5 shadow-sm backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#a8f5e9]/20 bg-[#a8f5e9]/10 text-[#a8f5e9]">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">What was analyzed</p>
                  <p className="text-xs text-white/45">Repository coverage snapshot</p>
                </div>
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <dt className="text-white/45">Total files</dt>
                <dd className="text-right font-semibold text-white">{analysis.basis.fileStats.totalFiles}</dd>
                <dt className="text-white/45">Source files</dt>
                <dd className="text-right font-semibold text-white">{analysis.basis.fileStats.sourceFiles}</dd>
                <dt className="text-white/45">Test files</dt>
                <dd className="text-right font-semibold text-white">{analysis.basis.fileStats.testFiles}</dd>
                <dt className="text-white/45">Docs files</dt>
                <dd className="text-right font-semibold text-white">{analysis.basis.fileStats.docsFiles}</dd>
                <dt className="text-white/45">Selected files</dt>
                <dd className="text-right font-semibold text-white">{analysis.basis.selectedFiles.length}</dd>
              </dl>
            </article>

            <article className="rounded-[1.8rem] border border-white/10 bg-surface/45 p-5 shadow-sm backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-300/20 bg-sky-300/10 text-sky-200">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Recruiter interpretation</p>
                  <p className="text-xs text-white/45">High-level project reading</p>
                </div>
              </div>
              <p className="mt-5 text-sm font-semibold capitalize text-[#a8f5e9]">
                {analysis.nlp.projectType}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/65">
                {analysis.nlp.architectureSummary}
              </p>
            </article>

            <article className="rounded-[1.8rem] border border-white/10 bg-surface/45 p-5 shadow-sm backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-300/10 text-amber-200">
                  <GitBranch className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">README and stack signals</p>
                  <p className="text-xs text-white/45">Supporting project context</p>
                </div>
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <dt className="text-white/45">README lines</dt>
                <dd className="text-right font-semibold text-white">{analysis.deterministic.readme.lines}</dd>
                <dt className="text-white/45">README words</dt>
                <dd className="text-right font-semibold text-white">{analysis.deterministic.readme.words}</dd>
                <dt className="text-white/45">README score</dt>
                <dd className="text-right font-semibold text-white">{analysis.deterministic.readme.score}</dd>
              </dl>
              <p className="mt-4 text-xs leading-relaxed text-white/50">
                {analysis.deterministic.readme.note}
              </p>
            </article>
          </section>

          <section className="grid gap-5 xl:grid-cols-3">
            <article className="rounded-[1.8rem] border border-white/10 bg-surface/45 p-5 shadow-sm backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#a8f5e9]/20 bg-[#a8f5e9]/10 text-[#a8f5e9]">
                  <BadgeCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Detected skills</p>
                  <p className="text-xs text-white/45">Evidence-backed stack terms</p>
                </div>
              </div>
              <div className="mt-5">{signalChips(analysis.nlp.skillEvidence, "mint")}</div>
            </article>

            <article className="rounded-[1.8rem] border border-white/10 bg-surface/45 p-5 shadow-sm backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-300/20 bg-sky-300/10 text-sky-200">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Strengths</p>
                  <p className="text-xs text-white/45">Positive delivery signals</p>
                </div>
              </div>
              <div className="mt-5">{signalChips(analysis.nlp.strengths, "sky")}</div>
            </article>

            <article className="rounded-[1.8rem] border border-white/10 bg-surface/45 p-5 shadow-sm backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-300/10 text-amber-200">
                  <TriangleAlert className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Risks</p>
                  <p className="text-xs text-white/45">What still needs scrutiny</p>
                </div>
              </div>
              <div className="mt-5">{signalChips(analysis.nlp.risks, "amber")}</div>
            </article>
          </section>
        </>
      ) : null}
    </div>
  );
}
