import Link from "next/link";
import BackButton from "@/components/BackButton";
import SkillCertificateView from "@/components/SkillCertificateView";
import { fetchDashboardCertificate } from "@/lib/dashboard-data";

type CertificatePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DashboardCertificatePage({
  params,
}: CertificatePageProps) {
  const { id } = await params;

  let certificate = null;
  let loadError: string | null = null;

  try {
    certificate = await fetchDashboardCertificate(id);
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Could not load certificate.";
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
          Credential Preview
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
          Skill Certificate
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          This is the polished certificate document for the saved project record. It uses the real
          repository analysis data already stored in your backend.
        </p>
      </section>

      <SkillCertificateView certificate={certificate} />
    </main>
  );
}
