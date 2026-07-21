"use client";

import Link from "next/link";
import { useEffect, useState, startTransition } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Fingerprint,
  Lock,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";
import EmptyStateCard from "@/components/EmptyStateCard";
import SectionSkeleton from "@/components/SectionSkeleton";
import StatePanel from "@/components/StatePanel";
import VerificationStatusLegend from "@/components/VerificationStatusLegend";
import { resolveCertificateVerification } from "@/lib/certificate-verification";
import { buildSkillchainApiUrl } from "@/lib/skillchain-api";
import { getErrorMessage } from "@/lib/user-facing-errors";
import { VerifySearchFormInner } from "./VerifySearchForm";

type PublicCertificateRecord = {
  id: string;
  status: string | null;
  verification_status?: string | null;
  created_at: string | null;
};

const verificationSignals = [
  {
    title: "Project Certificate Integrity",
    description:
      "Every certificate maps back to one stable project proof payload.",
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
      "Verification pages are designed to compare stored proof data with future blockchain references.",
    icon: <ShieldCheck className="h-5 w-5 text-emerald-400" />,
  },
];

const recruiterChecks = [
  "Lookup by public certificate ID",
  "Review one saved project proof without rerunning analysis",
  "Confirm issuance and verification status quickly",
];

function certificateTag(certificate: PublicCertificateRecord) {
  return resolveCertificateVerification(certificate).badgeLabel;
}

function formatDate(value: string | null) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

async function fetchPublicCertificates() {
  const response = await fetch(buildSkillchainApiUrl("/verify?limit=4"), {
    cache: "no-store",
  });
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Could not load public certificates.");
  }

  return (result.data || []) as PublicCertificateRecord[];
}

export default function VerifyIndexClient({
  recordBasePath = "/verify",
  variant = "public",
}: {
  recordBasePath?: string;
  variant?: "public" | "dashboard";
}) {
  const isDashboard = variant === "dashboard";
  const [certificates, setCertificates] = useState<PublicCertificateRecord[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    fetchPublicCertificates()
      .then((data) => {
        if (!isActive) return;
        startTransition(() => {
          setCertificates(data);
          setLoadError(null);
          setIsLoading(false);
        });
      })
      .catch((error) => {
        if (!isActive) return;
        startTransition(() => {
          setCertificates([]);
          setLoadError(getErrorMessage(error, "Could not load public certificates."));
          setIsLoading(false);
        });
      });

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className="mt-8 grid grid-cols-1 items-start gap-6">
      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-surface/40 p-5 shadow-2xl backdrop-blur-xl sm:p-6 lg:p-7">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/20 blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/10 blur-[80px]" />

          <div className="relative z-10">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-inner">
              <Fingerprint className="h-6 w-6 text-white" />
            </div>

            <h2 className="mb-2 text-2xl font-bold text-white">
              {isDashboard ? "Open Verification Record" : "Lookup Certificate"}
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
              {isDashboard
                ? "Paste a certificate ID from your saved projects to open its verification view inside the dashboard."
                : "Paste a certificate ID to open the main proof page for one saved project."}
            </p>

            <VerifySearchFormInner recordBasePath={recordBasePath} />

            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5" />
              <span>
                {isDashboard
                  ? "Saved certificate lookup only. The verification page opens in your workspace."
                  : "Certificate lookup only. Private account data stays hidden."}
              </span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(isDashboard ? verificationSignals.slice(0, 2) : verificationSignals).map((signal) => (
            <article
              key={signal.title}
              className="group relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-surface/40 p-5 shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-accent/40"
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
            </article>
          ))}
        </div>

        <div className="xl:col-span-2">
          <VerificationStatusLegend compact />
        </div>
      </div>

      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-surface/40 p-5 shadow-2xl backdrop-blur-xl sm:p-6 lg:p-7">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.12),transparent_28%),radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.12),transparent_26%)]" />
          <div className="relative z-10 mx-auto max-w-5xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-medium text-accent backdrop-blur-md">
              <Sparkles className="h-4 w-4" />
              {isDashboard ? "Saved proof workspace" : "Recruiter-ready proof layer"}
            </div>

            <h2 className="max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {isDashboard
                ? "Review saved verification records without leaving your dashboard."
                : "This is where saved proof becomes easy to trust."}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              {isDashboard
                ? "Use this area to jump into any issued project certificate, inspect its proof state, and confirm whether it is verified, pending, or failed."
                : "Instead of rerunning live analysis every time, this page opens a stable certificate with one project&apos;s scores, evidence summary, and proof status."}
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {(isDashboard
                ? [
                    "Open one saved certificate by ID",
                    "Stay inside the dashboard while reviewing proof",
                    "Check verification state before sharing it",
                  ]
                : recruiterChecks
              ).map((item) => (
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
        </section>

        {loadError ? (
          <StatePanel
            variant="error"
            title="Could not load public certificates"
            message={loadError}
            actionHref="/dashboard/verify"
            actionLabel="Open verify hub"
          />
        ) : null}

        <section className="space-y-4">
          <div className="mx-auto flex max-w-5xl flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                {isDashboard ? "Recent Verification Records" : "Recent Certificates"}
              </p>
              <h3 className="text-2xl font-semibold tracking-tight text-white">
                {isDashboard ? "Recently saved certificates" : "Recently issued certificates"}
              </h3>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-muted">
              {isDashboard
                ? "Open any saved certificate below to inspect its proof and current verification state."
                : "Open any certificate below to inspect its saved proof and verification status."}
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            <SectionSkeleton cards={3} className="md:col-span-2 xl:col-span-3" />
          ) : certificates.length ? (
            certificates.map((certificate) => (
                <Link
                  key={certificate.id}
                href={`${recordBasePath}/${encodeURIComponent(certificate.id)}`}
                className="group relative block overflow-hidden rounded-[1.7rem] border border-white/10 bg-surface/40 p-5 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-2xl"
              >
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-accent/8 blur-3xl transition-all duration-500 group-hover:bg-accent/15" />
                <div className="relative z-10">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                    {certificateTag(certificate)}
                  </p>
                  <h3 className="mt-3 break-all text-lg font-bold text-white sm:text-xl">{certificate.id}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Open this certificate to inspect its saved project proof and verification data.
                  </p>
                  <p className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-white/45">
                    Issued {formatDate(certificate.created_at)}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80">
                      <Fingerprint className="h-3.5 w-3.5 text-accent" />
                      <span className="truncate">{certificate.id}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent transition-transform group-hover:translate-x-1">
                      Open
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="md:col-span-2 xl:col-span-3">
              <EmptyStateCard
                compact
                title={
                  isDashboard
                    ? "No saved verification records yet"
                    : "No public certificate records yet"
                }
                message={
                  isDashboard
                    ? "Once a project certificate is issued, it will appear here for dashboard lookup."
                    : "Once a project certificate is issued, it will appear here for public lookup."
                }
                actionHref="/dashboard/submit"
                actionLabel="Analyze a repository"
              />
            </div>
          )}
          </div>
        </section>
      </div>
    </div>
  );
}
