"use client";

import Link from "next/link";
import { useEffect, useState, startTransition } from "react";
import { Expand, X } from "lucide-react";
import BackButton from "@/components/BackButton";
import SkillCertificateView from "@/components/SkillCertificateView";
import { buildSkillchainApiUrl } from "@/lib/skillchain-api";
import type { CertificateWithProjectRecord } from "@/lib/dashboard-data";

async function fetchCertificateClient(certificateId: string) {
  const response = await fetch(buildSkillchainApiUrl(`/verify/${certificateId}`), {
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Could not load certificate.");
  }

  return (result.data || null) as CertificateWithProjectRecord | null;
}

export default function CertificateDetailClient({
  certificateId,
}: {
  certificateId: string;
}) {
  const [certificate, setCertificate] = useState<CertificateWithProjectRecord | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    fetchCertificateClient(certificateId)
      .then((data) => {
        if (!isActive) return;
        startTransition(() => {
          setCertificate(data);
          setLoadError(null);
          setIsLoading(false);
        });
      })
      .catch((error) => {
        if (!isActive) return;
        startTransition(() => {
          setCertificate(null);
          setLoadError(
            error instanceof Error ? error.message : "Could not load certificate."
          );
          setIsLoading(false);
        });
      });

    return () => {
      isActive = false;
    };
  }, [certificateId]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(168,245,233,0.08),transparent_26%),linear-gradient(180deg,#020617,#0f172a_42%,#020617)] px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 rounded-[1.75rem] border border-white/10 bg-black/25 px-4 py-3 backdrop-blur-xl">
          <BackButton href="/dashboard/certificates" text="Close Viewer" />
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 sm:inline-flex">
            <Expand className="h-3.5 w-3.5" />
            Certificate Viewer
          </div>
        </div>

        <section className="mx-auto mt-5 max-w-6xl rounded-[2.8rem] border border-white/10 bg-white/5 p-4 shadow-[0_40px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-6">
          <div className="animate-pulse space-y-4 rounded-[2.2rem] bg-white/[0.03] p-6">
            <div className="h-5 w-40 rounded-full bg-white/10" />
            <div className="h-10 w-full max-w-2xl rounded-2xl bg-white/10" />
            <div className="h-5 w-full max-w-xl rounded-full bg-white/8" />
            <div className="h-[32rem] rounded-[2rem] bg-white/8" />
          </div>
        </section>
      </main>
    );
  }

  if (!certificate) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(168,245,233,0.08),transparent_26%),linear-gradient(180deg,#020617,#0f172a_42%,#020617)] px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 rounded-[1.75rem] border border-white/10 bg-black/25 px-4 py-3 backdrop-blur-xl">
          <BackButton href="/dashboard/certificates" text="Close Viewer" />
          <Link
            href="/dashboard/certificates"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            <X className="h-4 w-4" />
            Exit
          </Link>
        </div>

        <section className="mx-auto mt-5 max-w-4xl rounded-[2.5rem] border border-red-500/20 bg-red-500/10 p-8 shadow-[0_24px_70px_rgba(0,0,0,0.25)] backdrop-blur-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-300">
            Certificate unavailable
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-white">
            We couldn&apos;t load this certificate.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-red-200/90">
            {loadError || "The requested certificate could not be found for your account."}
          </p>
          <Link
            href="/dashboard/certificates"
            className="mt-6 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Back to Certificate List
          </Link>
        </section>
      </main>
    );
  }

  return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(168,245,233,0.08),transparent_26%),linear-gradient(180deg,#020617,#0f172a_42%,#020617)] px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 rounded-[1.75rem] border border-white/10 bg-black/25 px-4 py-3 backdrop-blur-xl">
          <BackButton href="/dashboard/certificates" text="Close Viewer" />
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
            <Expand className="h-3.5 w-3.5" />
            Full Certificate Preview
          </div>
        </div>

        <section className="mx-auto mt-5 max-w-7xl">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1">
            <div>
              <p className="inline-flex items-center rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">
                Per-Project Credential
              </p>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Project Skill Certificate
              </h1>
            </div>
            <p className="max-w-xl text-right text-sm leading-relaxed text-white/60">
              Opened in viewer mode so the certificate stays centered like a document preview.
            </p>
          </div>

          <div className="rounded-[2.8rem] border border-white/10 bg-white/[0.04] p-3 shadow-[0_40px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-5">
            <div className="mx-auto max-w-6xl">
              <SkillCertificateView certificate={certificate} />
            </div>
          </div>
        </section>
      </main>
  );
}
