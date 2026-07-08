"use client";

import Link from "next/link";
import { useEffect, useState, startTransition } from "react";
import BackButton from "@/components/BackButton";
import SkillCertificateView from "@/components/SkillCertificateView";
import { buildSkillchainApiUrl } from "@/lib/skillchain-api";
import type { CertificateWithProjectRecord } from "@/lib/dashboard-data";
import { createClient } from "@/utils/supabase/client";

type MetricRecord = {
  files: number | null;
  test_ratio: number | null;
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
    summary?: string;
  } | null;
};

type ScoreRecord = {
  backend_score: number | null;
  architecture_score: number | null;
  documentation_score: number | null;
  confidence_score: number | null;
  explanation: string | null;
  score_breakdown_json?: {
    frontend?: number;
    codeQuality?: number;
    security?: number;
    strengths?: string[];
    risks?: string[];
    skillEvidence?: string[];
  } | null;
};

type ProjectRecord = {
  id: string;
  repo_name: string;
  repo_url: string;
  analysis_status: string;
  default_branch: string | null;
  created_at: string;
  last_analyzed_at: string | null;
  analysis_error: string | null;
  metrics?: MetricRecord[];
  scores?: ScoreRecord[];
  certificates?: Array<{
    id: string;
    status: string | null;
    created_at: string | null;
    verification_status?: string | null;
  }>;
  users?: { email?: string | null } | Array<{ email?: string | null }>;
};

async function fetchCertificateClient(certificateId: string) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Please sign in again to load this certificate.");
  }

  const response = await fetch(buildSkillchainApiUrl("/projects"), {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Could not load certificate.");
  }

  const projects = (result.data || []) as ProjectRecord[];
  const project = projects.find((entry) =>
    (entry.certificates || []).some((certificate) => certificate.id === certificateId)
  );

  if (!project) {
    return null;
  }

  const certificate = (project.certificates || []).find(
    (entry) => entry.id === certificateId
  );

  if (!certificate) {
    return null;
  }

  const explanation =
    project.scores?.[0]?.explanation ||
    project.metrics?.[0]?.raw_metrics_json?.summary ||
    "This is a demo certificate view backed by the saved project analysis.";

  const fallbackCertificate: CertificateWithProjectRecord = {
    id: certificate.id,
    status: certificate.status,
    created_at: certificate.created_at,
    verification_status: certificate.verification_status,
    verification_url: `/verify/${certificate.id}`,
    certificate_hash: null,
    blockchain_tx: null,
    contract_address: null,
    chain_id: null,
    certificate_payload: {
      summary: {
        explanation,
      },
      verificationBasis: {
        scope: "project",
        basisVersion: "v1",
        projectBinding: {
          projectId: project.id,
          repoUrl: project.repo_url,
          repoName: project.repo_name,
          defaultBranch: project.default_branch,
        },
        checks: [
          "This certificate is tied to one saved project record.",
          "Its score summary comes from the repository analysis stored for that project.",
          "This is a demo-safe certificate view until the final certificate pipeline is completed.",
        ],
      },
    },
    projects: project,
  };

  return fallbackCertificate;
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
      <main className="w-full px-4 pb-12 pt-4 sm:px-6 sm:pb-14 lg:px-8 lg:pb-16">
        <div className="mb-5">
          <BackButton href="/dashboard/certificates" text="Back to Certificates" />
        </div>
        <section className="rounded-[2.5rem] border border-border/70 bg-surface/50 p-8 shadow-[0_24px_70px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
          <div className="animate-pulse space-y-4">
            <div className="h-5 w-40 rounded-full bg-white/10" />
            <div className="h-10 w-full max-w-2xl rounded-2xl bg-white/10" />
            <div className="h-5 w-full max-w-xl rounded-full bg-white/8" />
            <div className="h-[28rem] rounded-[2rem] bg-white/8" />
          </div>
        </section>
      </main>
    );
  }

  if (!certificate) {
    return (
      <main className="w-full px-4 pb-12 pt-4 sm:px-6 sm:pb-14 lg:px-8 lg:pb-16">
        <div className="mb-5">
          <BackButton href="/dashboard/certificates" text="Back to Certificates" />
        </div>

        <section className="rounded-[2.5rem] border border-red-500/20 bg-red-500/10 p-8 shadow-[0_24px_70px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
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
    <main className="w-full px-4 pb-12 pt-4 sm:px-6 sm:pb-14 lg:px-8 lg:pb-16">
      <div className="mb-5">
        <BackButton href="/dashboard/certificates" text="Back to Certificates" />
      </div>

      <section className="mb-6 space-y-3">
        <p className="inline-flex items-center rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-accent">
          Per-Project Credential
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
          Project Skill Certificate
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          This is a demo-ready certificate view built from the saved project analysis while the final
          certificate pipeline is still being stabilized.
        </p>
      </section>

      <SkillCertificateView certificate={certificate} />
    </main>
  );
}
