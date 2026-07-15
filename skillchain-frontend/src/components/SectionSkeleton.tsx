export default function SectionSkeleton({
  cards = 3,
  className = "",
}: {
  cards?: number;
  className?: string;
}) {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 ${className}`}>
      {Array.from({ length: cards }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-[2rem] border border-white/10 bg-surface/40 p-6 shadow-lg backdrop-blur-xl"
        >
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-24 rounded-full bg-white/10" />
            <div className="h-8 w-3/4 rounded-2xl bg-white/10" />
            <div className="h-14 rounded-2xl bg-white/8" />
            <div className="h-4 w-32 rounded-full bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}
