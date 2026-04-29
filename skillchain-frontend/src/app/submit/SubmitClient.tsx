"use client";

import { motion } from "framer-motion";
import { 
  Link as LinkIcon, Cpu, Zap, 
  ShieldCheck, Terminal, Code,
  Layers, Lock, Sparkles, Database, GitBranch, Search, Activity
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getPublicEnv } from "@/lib/env";

type AnalysisResult = {
  analysisVersion: string;
  repo: {
    fullName: string;
    htmlUrl: string;
    branch: string;
  };
  basis: {
    fileStats: {
      totalFiles: number;
      sourceFiles: number;
      testFiles: number;
      docsFiles: number;
      backendFiles: number;
      frontendFiles: number;
    };
    selectedFiles: {
      path: string;
      kind: string;
    }[];
  };
  deterministic: {
    frameworks: string[];
    readme: {
      exists: boolean;
      lines: number;
      words: number;
      score: number;
      note: string;
    };
    signals: Record<string, boolean>;
  };
  nlp: {
    projectType: string;
    skillEvidence: string[];
    architectureSummary: string;
    strengths: string[];
    risks: string[];
  };
  scores: Record<string, number>;
  summary: string;
};

export default function SubmitClient() {
  const [url, setUrl] = useState("");
  const [branch, setBranch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const analysisRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (analysis && analysisRef.current) {
      analysisRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [analysis]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsSubmitting(true);
    setError("");
    setAnalysis(null);
    setStatusMessage("Connecting to the analyzer...");

    try {
      const { apiBaseUrl } = getPublicEnv();
      const baseUrl = apiBaseUrl.replace(/\/$/, "");
      const projectsUrl = baseUrl.endsWith("/api/v1")
        ? `${baseUrl}/projects`
        : `${baseUrl}/api/v1/projects`;

      console.info("[SkillChain] Starting repository analysis", {
        repoUrl: url,
        branch: branch || "default",
        endpoint: projectsUrl,
      });
      setStatusMessage("Fetching GitHub metadata and repository files...");

      const response = await fetch(projectsUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repoUrl: url,
          branch: branch || undefined,
        }),
      });

      setStatusMessage("Scoring repository evidence...");
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Repository analysis failed.");
      }

      setAnalysis(result.data.analysis);
      setStatusMessage("Analysis complete.");
      console.info("[SkillChain] Repository analysis complete", result.data.analysis);
    } catch (caughtError) {
      console.error("[SkillChain] Repository analysis failed", caughtError);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Repository analysis failed."
      );
      setStatusMessage("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <div className="flex items-center gap-2 text-emerald-400 mb-2">
          <Terminal className="h-5 w-5" />
          <span className="text-sm font-semibold tracking-wider uppercase">Repository Analysis</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
          Connect your <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-emerald-400">GitHub</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg mt-2">
          Submit your codebase for an AI-driven architectural deep dive. We extract verifiable skills directly from your commit history.
        </p>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8"
      >
        {/* Left Column - Submission Form */}
        <div className="lg:col-span-5 space-y-8">
          <motion.div variants={item} className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-surface/40 p-8 shadow-2xl backdrop-blur-xl">
            {/* Background Glow */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-accent/20 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="relative z-10">
              <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 shadow-inner">
                <GitBranch className="h-6 w-6 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">Link Repository</h2>
              <p className="text-sm text-muted-foreground mb-8">
                Paste your public GitHub repository URL below to initiate the code analysis pipeline.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="repo-url" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    Repository URL
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <LinkIcon className="h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                    </div>
                    <input
                      id="repo-url"
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://github.com/username/project"
                      required
                      className="w-full bg-background/50 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="branch" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    Branch <span className="text-white/30 lowercase tracking-normal">(Optional)</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <GitBranch className="h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                    </div>
                    <input
                      id="branch"
                      type="text"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="main"
                      className="w-full bg-background/50 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={isSubmitting || !url}
                    className="relative w-full group overflow-hidden rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-6 py-4 text-sm font-bold text-emerald-400 transition-all hover:bg-emerald-500 hover:text-[#0f172a] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isSubmitting ? (
                        <>
                          <Activity className="h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Zap className="h-5 w-5" />
                          Initiate Analysis
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </form>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5" />
                <span>Read-only access. We never store your raw code.</span>
              </div>

              {statusMessage ? (
                <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                  {statusMessage}
                </div>
              ) : null}

              {error ? (
                <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                  {error}
                </div>
              ) : null}

              {analysis ? (
                <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
                  Result ready for{" "}
                  <span className="font-semibold text-white">{analysis.repo.fullName}</span>.
                  The detailed analysis is shown below.
                </div>
              ) : null}
            </div>
          </motion.div>
        </div>

        {/* Right Column - Info & Process */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Analysis Goals Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div variants={item} className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-surface/40 p-6 backdrop-blur-xl hover:border-accent/40 transition-all duration-300 shadow-lg">
              <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-all duration-500">
                <Database className="h-32 w-32 text-accent" />
              </div>
              <div className="relative z-10">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4 border border-accent/20">
                  <Database className="h-5 w-5 text-accent" />
                </div>
                <h4 className="text-lg font-bold text-white mb-1">Architecture</h4>
                <p className="text-sm text-muted-foreground">Evaluating system design, patterns, and scalability.</p>
              </div>
            </motion.div>

            <motion.div variants={item} className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-surface/40 p-6 backdrop-blur-xl hover:border-blue-500/40 transition-all duration-300 shadow-lg">
              <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-all duration-500">
                <Code className="h-32 w-32 text-blue-500" />
              </div>
              <div className="relative z-10">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-500/20">
                  <Code className="h-5 w-5 text-blue-400" />
                </div>
                <h4 className="text-lg font-bold text-white mb-1">Code Quality</h4>
                <p className="text-sm text-muted-foreground">Analyzing cleanliness, modularity, and best practices.</p>
              </div>
            </motion.div>

            <motion.div variants={item} className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-surface/40 p-6 backdrop-blur-xl hover:border-purple-500/40 transition-all duration-300 shadow-lg">
              <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-all duration-500">
                <ShieldCheck className="h-32 w-32 text-purple-500" />
              </div>
              <div className="relative z-10">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 border border-purple-500/20">
                  <ShieldCheck className="h-5 w-5 text-purple-400" />
                </div>
                <h4 className="text-lg font-bold text-white mb-1">Security</h4>
                <p className="text-sm text-muted-foreground">Checking for vulnerabilities and secure coding habits.</p>
              </div>
            </motion.div>

            <motion.div variants={item} className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-surface/40 p-6 backdrop-blur-xl hover:border-pink-500/40 transition-all duration-300 shadow-lg">
              <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-all duration-500">
                <Sparkles className="h-32 w-32 text-pink-500" />
              </div>
              <div className="relative z-10">
                <div className="h-10 w-10 rounded-lg bg-pink-500/10 flex items-center justify-center mb-4 border border-pink-500/20">
                  <Sparkles className="h-5 w-5 text-pink-400" />
                </div>
                <h4 className="text-lg font-bold text-white mb-1">Innovation</h4>
                <p className="text-sm text-muted-foreground">Detecting usage of modern frameworks and paradigms.</p>
              </div>
            </motion.div>
          </div>

          {/* Process Timeline */}
          <motion.div variants={item} className="rounded-[2rem] border border-white/10 bg-surface/40 p-8 backdrop-blur-xl shadow-xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Activity className="h-6 w-6 text-emerald-400" />
              Analysis Pipeline
            </h3>
            
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="relative flex items-start gap-4 group">
                <div className="flex flex-col items-center mt-1">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0 z-10 border border-emerald-500/30">
                    <Search className="h-4 w-4" />
                  </div>
                  <div className="w-px h-full min-h-[3rem] bg-gradient-to-b from-white/20 to-transparent group-last:hidden mt-2" />
                </div>
                <div className="flex-1 p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-colors group-hover:bg-white/10 pb-4">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-white text-sm">Deep Scan</h4>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">Step 1</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">Fetching repository metadata, commit history, and resolving dependency graphs.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative flex items-start gap-4 group">
                <div className="flex flex-col items-center mt-1">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/20 text-accent shrink-0 z-10 border border-accent/30">
                    <Cpu className="h-4 w-4" />
                  </div>
                  <div className="w-px h-full min-h-[3rem] bg-gradient-to-b from-white/20 to-transparent group-last:hidden mt-2" />
                </div>
                <div className="flex-1 p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-colors group-hover:bg-white/10 pb-4">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-white text-sm">AI Profiling</h4>
                    <span className="text-[10px] font-mono text-muted-foreground bg-white/5 px-2 py-0.5 rounded border border-white/10">Step 2</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">Multi-model agents analyze code semantics to quantify technical proficiency.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex items-start gap-4 group">
                <div className="flex flex-col items-center mt-1">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 shrink-0 z-10 border border-blue-500/30">
                    <Layers className="h-4 w-4" />
                  </div>
                  {/* Last item, no line needed */}
                </div>
                <div className="flex-1 p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-colors group-hover:bg-white/10">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-white text-sm">On-chain Verification</h4>
                    <span className="text-[10px] font-mono text-muted-foreground bg-white/5 px-2 py-0.5 rounded border border-white/10">Step 3</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">Minting cryptographic proofs of your skills directly onto the blockchain.</p>
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </motion.div>

      {analysis ? (
        <motion.section
          ref={analysisRef}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] border border-white/10 bg-surface/50 p-8 backdrop-blur-xl shadow-xl"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Hybrid NLP Result
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white">
                {analysis.repo.fullName}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                {analysis.summary}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-muted-foreground">
              Branch: <span className="font-semibold text-white">{analysis.repo.branch}</span>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
            {Object.entries(analysis.scores).map(([label, score]) => (
              <div key={label} className="rounded-xl border border-white/10 bg-background/40 p-4">
                <p className="text-xs capitalize text-muted-foreground">
                  {label.replace(/([A-Z])/g, " $1")}
                </p>
                <p className="mt-2 text-2xl font-black text-white">{score}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                What Was Analyzed
              </h3>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <span className="text-muted-foreground">Total files</span>
                <span className="font-semibold text-white">{analysis.basis.fileStats.totalFiles}</span>
                <span className="text-muted-foreground">Source files</span>
                <span className="font-semibold text-white">{analysis.basis.fileStats.sourceFiles}</span>
                <span className="text-muted-foreground">Test files</span>
                <span className="font-semibold text-white">{analysis.basis.fileStats.testFiles}</span>
                <span className="text-muted-foreground">Docs files</span>
                <span className="font-semibold text-white">{analysis.basis.fileStats.docsFiles}</span>
                <span className="text-muted-foreground">Selected files</span>
                <span className="font-semibold text-white">{analysis.basis.selectedFiles.length}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                NLP Interpretation
              </h3>
              <p className="mt-4 text-sm capitalize text-emerald-300">
                {analysis.nlp.projectType}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {analysis.nlp.architectureSummary}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                README Signal
              </h3>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <span className="text-muted-foreground">Lines</span>
                <span className="font-semibold text-white">{analysis.deterministic.readme.lines}</span>
                <span className="text-muted-foreground">Words</span>
                <span className="font-semibold text-white">{analysis.deterministic.readme.words}</span>
                <span className="text-muted-foreground">Doc score</span>
                <span className="font-semibold text-white">{analysis.deterministic.readme.score}</span>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                {analysis.deterministic.readme.note}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
            <EvidenceList title="Detected Skills" items={analysis.nlp.skillEvidence} />
            <EvidenceList title="Strengths" items={analysis.nlp.strengths} />
            <EvidenceList title="Risks" items={analysis.nlp.risks} />
          </div>
        </motion.section>
      ) : null}
    </div>
  );
}

function EvidenceList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h3 className="text-sm font-bold uppercase tracking-wider text-white">
        {title}
      </h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.length > 0 ? (
          items.slice(0, 10).map((item) => (
            <span
              key={item}
              className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-100"
            >
              {item}
            </span>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No strong evidence detected.</p>
        )}
      </div>
    </div>
  );
}
