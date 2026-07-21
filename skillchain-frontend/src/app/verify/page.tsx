import BackButton from "@/components/BackButton";
import { BadgeCheck, Fingerprint, ShieldCheck } from "lucide-react";
import VerifyIndexClient from "./VerifyIndexClient";

export default function VerifyIndexPage() {
  return (
    <main className="app-shell">
      <div className="app-container mb-4 flex items-center justify-between">
        <BackButton href="/" text="Back to Home" />
        <div className="mb-6 hidden items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Certificate Verification Online
        </div>
      </div>

      <div className="app-container app-stack pb-8 sm:pb-10">
        <section className="surface-card">
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
                Search a public certificate ID to inspect one project&apos;s saved proof, score signals, and verification state without rerunning analysis.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <article className="rounded-[1.4rem] border border-white/10 bg-background/45 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-accent">
                  <Fingerprint className="h-5 w-5" />
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  Main use
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/85">
                  Open one saved certificate record and check whether its proof is trusted.
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

        <VerifyIndexClient />
      </div>
    </main>
  );
}
