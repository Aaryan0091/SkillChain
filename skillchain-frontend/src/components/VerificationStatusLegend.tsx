const statusItems = [
  {
    label: "Verified",
    description:
      "All proof checks passed. The saved certificate and its chain reference match.",
    tone: "border-emerald-400/25 bg-emerald-500/10 text-emerald-200",
  },
  {
    label: "Pending",
    description:
      "The certificate exists, but the final proof step is still being completed.",
    tone: "border-[#a8f5e9]/25 bg-[#a8f5e9]/10 text-[#a8f5e9]",
  },
  {
    label: "Failed",
    description:
      "Something in the proof flow did not pass. The record should be retried or replaced.",
    tone: "border-red-400/25 bg-red-500/10 text-red-200",
  },
];

export default function VerificationStatusLegend({
  title = "What the certificate status means",
  compact = false,
}: {
  title?: string;
  compact?: boolean;
}) {
  return (
    <section
      className={
        compact
          ? "rounded-[1.35rem]"
          : "rounded-[2rem] border border-white/10 bg-surface/40 p-6 shadow-sm backdrop-blur-xl"
      }
    >
      {!compact ? <h3 className="text-lg font-semibold text-white">{title}</h3> : null}
      <div className={`grid gap-3 ${compact ? "sm:grid-cols-3" : "mt-4 md:grid-cols-3"}`}>
        {statusItems.map((item) => (
          <article
            key={item.label}
            className={`rounded-[1.35rem] border border-white/10 bg-background/45 ${
              compact ? "p-3.5 sm:p-4" : "p-4"
            }`}
          >
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${item.tone}`}
            >
              {item.label}
            </span>
            <p
              className={`mt-3 leading-relaxed text-muted ${
                compact ? "text-xs sm:text-sm" : "text-sm"
              }`}
            >
              {item.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
