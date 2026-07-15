import { BadgeCheck, Fingerprint, ShieldCheck } from "lucide-react";
import VerifyIndexClient from "@/app/verify/VerifyIndexClient";

export default function DashboardVerifyIndexPage() {
  return (
    <main className="w-full px-4 pb-10 pt-4 sm:px-6 sm:pb-12 lg:px-8 lg:pb-14">
      <div className="space-y-8">
        <section className="relative overflow-hidden rounded-[2.3rem] border border-white/10 bg-surface/45 p-6 shadow-xl backdrop-blur-2xl sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.14),transparent_24%),radial-gradient(circle_at_10%_80%,rgba(59,130,246,0.12),transparent_22%)]" />
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <div>
              <div className="hero-kicker">
                <ShieldCheck className="h-5 w-5" />
                <span>Project Verification</span>
              </div>
              <h1 className="hero-title max-w-3xl">
                Verify a{" "}
                <span className="bg-gradient-to-r from-accent to-emerald-400 bg-clip-text text-transparent">
                  project certificate
                </span>
              </h1>
              <p className="hero-copy">
                Open saved project proof inside your dashboard without leaving the authenticated workspace.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <article className="rounded-[1.4rem] border border-white/10 bg-background/45 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-accent">
                  <Fingerprint className="h-5 w-5" />
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  Dashboard use
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/85">
                  Review your saved certificate records while keeping the dashboard sidebar visible.
                </p>
              </article>
              <article className="rounded-[1.4rem] border border-white/10 bg-background/45 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-accent">
                  <BadgeCheck className="h-5 w-5" />
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  What you confirm
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/85">
                  Certificate status, score summary, and linked project proof in one place.
                </p>
              </article>
            </div>
          </div>
        </section>

        <VerifyIndexClient
          recordBasePath="/dashboard/verify"
          variant="dashboard"
        />
      </div>
    </main>
  );
}
