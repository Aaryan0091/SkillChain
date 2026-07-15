"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Activity, Search } from "lucide-react";

export default function VerifySearchForm() {
  return <VerifySearchFormInner />;
}

export function VerifySearchFormInner({
  recordBasePath = "/verify",
}: {
  recordBasePath?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const value = query.trim();
    if (!value) return;

    router.push(`${recordBasePath}/${encodeURIComponent(value)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="verify-query"
          className="ml-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          Certificate ID
        </label>
        <div className="group relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-accent" />
          </div>
          <input
            id="verify-query"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Paste a public certificate ID"
            className="w-full rounded-xl border border-white/10 bg-background/50 py-3.5 pl-11 pr-4 text-white outline-none transition-all placeholder:text-white/20 focus:border-accent focus:ring-2 focus:ring-accent/50"
          />
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          className="group relative w-full cursor-pointer overflow-hidden rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-6 py-4 text-sm font-bold text-emerald-400 transition-all hover:bg-emerald-500 hover:text-[#0f172a] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <span className="relative z-10 flex items-center justify-center gap-2">
            <Activity className="h-5 w-5" />
            Open Public Record
          </span>
        </button>
      </div>
    </form>
  );
}
