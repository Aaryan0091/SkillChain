"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Fingerprint,
  Lock,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";
import BackButton from "@/components/BackButton";

const quickLookups = [
  {
    label: "Aaryan Gupta",
    key: "aaryan",
    note: "Frontend systems, clean architecture, verified certificate",
    tag: "Verified Profile",
  },
  {
    label: "Demo Candidate",
    key: "demo-candidate",
    note: "Backend API work, certificate pending blockchain anchoring",
    tag: "Pending Finality",
  },
  {
    label: "Demo Builder",
    key: "demo-builder",
    note: "Smart contract and full-stack repository achievements",
    tag: "Top Score",
  },
  {
    label: "SC-2026-001",
    key: "SC-2026-001",
    note: "Open a direct certificate ID demo",
    tag: "Direct Lookup",
  },
];

const verificationSignals = [
  {
    title: "Certificate Integrity",
    description:
      "Every public record is designed to map back to a stable saved certificate payload.",
    icon: <Fingerprint className="h-5 w-5 text-accent" />,
  },
  {
    title: "Visible Skill Evidence",
    description:
      "Recruiters can inspect score summaries, project strengths, and verification state in one place.",
    icon: <Trophy className="h-5 w-5 text-blue-400" />,
  },
  {
    title: "Tamper-Aware Flow",
    description:
      "Verification pages are built to compare stored proof data with future blockchain references.",
    icon: <ShieldCheck className="h-5 w-5 text-emerald-400" />,
  },
];

const recruiterChecks = [
  "Lookup by certificate ID or username",
  "Review saved project proof without rerunning analysis",
  "Confirm certificate and verification status quickly",
];

export default function VerifyIndexPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const value = query.trim();
    if (!value) {
      return;
    }

    router.push(`/verify/${encodeURIComponent(value)}`);
  };

  return (
    <main className="app-shell">
      <div className="app-container mb-4 flex items-center justify-between">
        <BackButton href="/" text="Back to Home" />
        <div className="mb-6 hidden items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Public Records Online
        </div>
      </div>

      <div className="app-container app-stack pb-8 sm:pb-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="mb-2 flex items-center gap-2 text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">
              Public Verification
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
            Verify a <span className="bg-gradient-to-r from-accent to-emerald-400 bg-clip-text text-transparent">developer proof</span>
          </h1>
          <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
            Search a certificate ID or username to inspect saved credibility signals, public skill proof,
            and verification readiness without relying on a one-time result.
          </p>
        </motion.div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-5">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-surface/40 p-8 shadow-2xl backdrop-blur-xl"
            >
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/20 blur-[80px]" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/10 blur-[80px]" />

              <div className="relative z-10">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-inner">
                  <Search className="h-6 w-6 text-white" />
                </div>

                <h2 className="mb-2 text-2xl font-bold text-white">Lookup Public Record</h2>
                <p className="mb-8 text-sm text-muted-foreground">
                  Enter a public certificate ID or username to open the candidate&apos;s verification page.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label
                      htmlFor="verify-query"
                      className="ml-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      Certificate ID or Username
                    </label>
                    <div className="group relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <Search className="h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-accent" />
                      </div>
                      <input
                        id="verify-query"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Try SC-2026-001 or aaryan"
                        className="w-full rounded-xl border border-white/10 bg-background/50 py-3.5 pl-11 pr-4 text-white outline-none transition-all placeholder:text-white/20 focus:border-accent focus:ring-2 focus:ring-accent/50"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="group relative w-full overflow-hidden rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-6 py-4 text-sm font-bold text-emerald-400 transition-all hover:bg-emerald-500 hover:text-[#0f172a] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <Activity className="h-5 w-5" />
                        Open Public Record
                      </span>
                    </button>
                  </div>
                </form>

                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Public-safe lookup only. Private account data stays hidden.</span>
                </div>
              </div>
            </motion.section>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {verificationSignals.map((signal, index) => (
                <motion.article
                  key={signal.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-surface/40 p-6 shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-accent/40"
                >
                  <div className="absolute -right-4 -top-4 p-4 opacity-5 transition-all duration-500 group-hover:opacity-10">
                    <ShieldCheck className="h-28 w-28 text-accent" />
                  </div>
                  <div className="relative z-10">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                      {signal.icon}
                    </div>
                    <h3 className="mb-1 text-lg font-bold text-white">{signal.title}</h3>
                    <p className="text-sm text-muted-foreground">{signal.description}</p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>

          <div className="space-y-8 lg:col-span-7">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-surface/40 p-8 shadow-2xl backdrop-blur-xl"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.12),transparent_28%),radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.12),transparent_26%)]" />
              <div className="relative z-10">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-medium text-accent backdrop-blur-md">
                  <Sparkles className="h-4 w-4" />
                  Recruiter-ready proof layer
                </div>

                <h2 className="max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  This is where saved proof becomes easy to trust.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                  Instead of rerunning live analysis every time, the verification experience is built to load a stable
                  public record with saved scores, evidence summaries, and certificate status.
                </p>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  {recruiterChecks.map((item) => (
                    <div
                      key={item}
                      className="rounded-[1.5rem] border border-white/10 bg-background/45 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                    >
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                        <BadgeCheck className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-medium leading-relaxed text-white/90">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {quickLookups.map((lookup, index) => (
                <motion.div
                  key={lookup.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                >
                  <Link
                    href={`/verify/${encodeURIComponent(lookup.key)}`}
                    className="group relative block overflow-hidden rounded-[2rem] border border-white/10 bg-surface/40 p-6 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-2xl"
                  >
                    <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-accent/8 blur-3xl transition-all duration-500 group-hover:bg-accent/15" />
                    <div className="relative z-10">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                        {lookup.tag}
                      </p>
                      <h3 className="mt-3 text-xl font-bold text-white">{lookup.label}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {lookup.note}
                      </p>

                      <div className="mt-5 flex items-center justify-between">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80">
                          <Fingerprint className="h-3.5 w-3.5 text-accent" />
                          {lookup.key}
                        </span>
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent transition-transform group-hover:translate-x-1">
                          Open
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </section>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="pointer-events-none absolute left-0 top-0 -z-10 h-96 w-full bg-gradient-to-b from-accent/5 to-transparent" />
      <div className="pointer-events-none absolute left-0 top-1/4 -z-10 h-1/2 w-1/2 rounded-full bg-accent/5 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-1/2 w-1/2 rounded-full bg-blue-500/5 blur-[120px]" />
    </main>
  );
}
