"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import BackButton from "@/components/BackButton";

const quickLookups = [
  {
    label: "Aaryan Gupta",
    key: "aaryan",
    note: "Frontend systems, clean architecture, verified certificate",
  },
  {
    label: "Demo Candidate",
    key: "demo-candidate",
    note: "Backend API work, certificate pending blockchain anchoring",
  },
  {
    label: "Demo Builder",
    key: "demo-builder",
    note: "Smart contract and full-stack repository achievements",
  },
  {
    label: "SC-2026-001",
    key: "SC-2026-001",
    note: "Open a direct certificate ID demo",
  },
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
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-16 sm:px-10 lg:px-12">
      <BackButton href="/" text="Back to Home" />

      <section className="rounded-[2.5rem] border border-border/70 bg-surface/60 p-8 shadow-xl backdrop-blur-2xl sm:p-10">
        <div className="max-w-3xl">
          <p className="inline-flex rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-accent">
            Public Verification
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
            Check a developer&apos;s certificate, progress, and achievements
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Enter a certificate ID or username to open that person&apos;s public proof page. This is
            where recruiters and reviewers can inspect legitimacy, skill progress, and notable achievements.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 rounded-[2rem] border border-border/60 bg-background/70 p-5 sm:p-6">
          <label htmlFor="verify-query" className="text-sm font-semibold text-foreground">
            Search by certificate ID or username
          </label>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              id="verify-query"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try SC-2026-001 or aaryan"
              className="h-13 flex-1 rounded-full border border-border bg-surface px-5 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-accent"
            />
            <button
              type="submit"
              className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent/90"
            >
              Open Public Record
            </button>
          </div>
        </form>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {quickLookups.map((lookup) => (
            <Link
              key={lookup.key}
              href={`/verify/${encodeURIComponent(lookup.key)}`}
              className="rounded-[1.75rem] border border-border/60 bg-background/60 p-5 transition-all hover:-translate-y-0.5 hover:border-accent/30"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Quick Lookup
              </p>
              <h2 className="mt-2 text-lg font-semibold text-foreground">{lookup.label}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">{lookup.note}</p>
            </Link>
          ))}
        </section>
      </section>
    </main>
  );
}
