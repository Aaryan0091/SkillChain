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
import { buildSkillchainApiUrl } from "@/lib/skillchain-api";
import VerifySearchForm from "./VerifySearchForm";

type PublicCertificateRecord = {
  id: string;
  status: string | null;
  verification_status?: string | null;
  created_at: string | null;
};

const verificationSignals = [
  {
    title: "Certificate Integrity",
    description:
      "Every public record maps back to a stable saved certificate payload.",
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
  "Review saved project proof without rerunning analysis",
  "Confirm certificate and verification status quickly",
];

function certificateTag(certificate: PublicCertificateRecord) {
  if (certificate.verification_status === "verified") return "Verified";
  if (certificate.status === "verified") return "Verified";
  if (certificate.status === "failed") return "Failed";
  return "Pending";
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

export default function VerifyIndexClient() {
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
          setLoadError(
            error instanceof Error
              ? error.message
              : "Could not load public certificates."
          );
          setIsLoading(false);
        });
      });

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
      <div className="space-y-8 lg:col-span-5">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-surface/40 p-8 shadow-2xl backdrop-blur-xl">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/20 blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/10 blur-[80px]" />

          <div className="relative z-10">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-inner">
              <Fingerprint className="h-6 w-6 text-white" />
            </div>

            <h2 className="mb-2 text-2xl font-bold text-white">Lookup Public Record</h2>
            <p className="mb-8 text-sm text-muted-foreground">
              Enter a public certificate ID to open the candidate&apos;s verification page.
            </p>

            <VerifySearchForm />

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5" />
              <span>Public-safe lookup only. Private account data stays hidden.</span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {verificationSignals.map((signal) => (
            <article
              key={signal.title}
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
            </article>
          ))}
        </div>
      </div>

      <div className="space-y-8 lg:col-span-7">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-surface/40 p-8 shadow-2xl backdrop-blur-xl">
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
              Instead of rerunning live analysis every time, the verification experience loads a stable
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
        </section>

        {loadError ? (
          <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {loadError}
          </p>
        ) : null}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-[2rem] border border-white/10 bg-surface/40 p-6 shadow-lg backdrop-blur-xl"
              >
                <div className="animate-pulse space-y-4">
                  <div className="h-4 w-24 rounded-full bg-white/10" />
                  <div className="h-8 w-3/4 rounded-2xl bg-white/10" />
                  <div className="h-16 rounded-2xl bg-white/8" />
                  <div className="h-4 w-32 rounded-full bg-white/10" />
                </div>
              </div>
            ))
          ) : certificates.length ? (
            certificates.map((certificate) => (
              <Link
                key={certificate.id}
                href={`/verify/${encodeURIComponent(certificate.id)}`}
                className="group relative block overflow-hidden rounded-[2rem] border border-white/10 bg-surface/40 p-6 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-2xl"
              >
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-accent/8 blur-3xl transition-all duration-500 group-hover:bg-accent/15" />
                <div className="relative z-10">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                    {certificateTag(certificate)}
                  </p>
                  <h3 className="mt-3 text-xl font-bold text-white">{certificate.id}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Open the public record to inspect the saved score and verification data.
                  </p>
                  <p className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-white/45">
                    Issued {formatDate(certificate.created_at)}
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80">
                      <Fingerprint className="h-3.5 w-3.5 text-accent" />
                      {certificate.id}
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
            <div className="rounded-[2rem] border border-white/10 bg-surface/40 p-6 text-sm text-muted-foreground shadow-lg backdrop-blur-xl sm:col-span-2">
              No public certificate records are available yet.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
