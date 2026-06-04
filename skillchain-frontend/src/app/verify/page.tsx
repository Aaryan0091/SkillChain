import BackButton from "@/components/BackButton";
import { ShieldCheck } from "lucide-react";
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
          Public Records Online
        </div>
      </div>

      <div className="app-container app-stack pb-8 sm:pb-10">
        <div className="space-y-2">
          <div className="mb-2 flex items-center gap-2 text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">
              Public Verification
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
            Verify a{" "}
            <span className="bg-gradient-to-r from-accent to-emerald-400 bg-clip-text text-transparent">
              developer proof
            </span>
          </h1>
          <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
            Search a public certificate ID to inspect saved credibility signals, public skill proof,
            and verification readiness without relying on a one-time result.
          </p>
        </div>

        <VerifyIndexClient />
      </div>
    </main>
  );
}
