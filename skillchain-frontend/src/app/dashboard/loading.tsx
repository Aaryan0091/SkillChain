export default function DashboardLoading() {
  return (
    <main className="w-full px-4 pb-12 pt-4 sm:px-6 sm:pb-14 lg:px-8 lg:pb-16">
      <section className="surface-card animate-pulse">
        <div className="grid gap-6 lg:grid-cols-[1.45fr_0.9fr]">
          <div className="space-y-5">
            <div className="h-6 w-40 rounded-full bg-white/10" />
            <div className="space-y-3">
              <div className="h-10 w-full max-w-2xl rounded-2xl bg-white/10" />
              <div className="h-5 w-full max-w-xl rounded-full bg-white/8" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="rounded-[1.6rem] border border-white/10 bg-background/45 p-4">
                  <div className="h-4 w-24 rounded-full bg-white/10" />
                  <div className="mt-4 h-10 w-16 rounded-xl bg-white/10" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-background/50 p-5">
            <div className="h-5 w-28 rounded-full bg-white/10" />
            <div className="mt-4 h-8 w-40 rounded-xl bg-white/10" />
            <div className="mt-6 space-y-4">
              <div className="rounded-[1.5rem] border border-white/8 bg-surface/35 p-4">
                <div className="h-4 w-28 rounded-full bg-white/10" />
                <div className="mt-4 h-20 rounded-2xl bg-white/8" />
              </div>
              <div className="rounded-[1.5rem] border border-white/8 bg-surface/35 p-4">
                <div className="h-4 w-24 rounded-full bg-white/10" />
                <div className="mt-4 h-16 rounded-2xl bg-white/8" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
