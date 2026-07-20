import { LoaderCircle } from "lucide-react";

export default function LoadingStateCard({
  title = "Loading saved data",
  message = "SkillChain is fetching the latest records. This should only take a moment.",
  rows = 3,
}: {
  title?: string;
  message?: string;
  rows?: number;
}) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-[#a8f5e9]/20 bg-[linear-gradient(135deg,rgba(168,245,233,0.08),rgba(15,23,42,0.48)_45%,rgba(2,6,23,0.75))] p-5 shadow-sm backdrop-blur-xl sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#a8f5e9]/20 bg-[#a8f5e9]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#a8f5e9]">
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            Loading
          </p>
          <h3 className="mt-3 text-xl font-semibold text-white">{title}</h3>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">{message}</p>
        </div>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="rounded-[1.4rem] border border-white/10 bg-background/45 p-4"
          >
            <div className="animate-pulse space-y-4">
              <div className="h-4 w-24 rounded-full bg-white/10" />
              <div className="h-8 w-2/3 rounded-2xl bg-white/10" />
              <div className="h-14 rounded-2xl bg-white/8" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
