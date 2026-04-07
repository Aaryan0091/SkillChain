import BackButton from "@/components/BackButton";

export default function DashboardPage() {
  const stats = [
    {
      label: "Repositories Analyzed",
      value: "12",
      trend: "+2 this week",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
      ),
      color: "text-accent",
      bg: "bg-accent/[0.08]",
      glow: "bg-accent/20",
    },
    {
      label: "Certificates Minted",
      value: "8",
      trend: "All verified",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
      ),
      color: "text-accent-strong",
      bg: "bg-accent-strong/[0.08]",
      glow: "bg-accent-strong/20",
    },
    {
      label: "Pending Scans",
      value: "1",
      trend: "In progress...",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      ),
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-600/10 dark:bg-blue-400/10",
      glow: "bg-blue-500/20",
    },
  ];

  const recentActivity = [
    { repo: "user/nextjs-saas", score: 88, status: "Completed", date: "2 hours ago" },
    { repo: "user/python-api", score: 74, status: "Completed", date: "Yesterday" },
    { repo: "user/defi-smart-contracts", score: null, status: "Analyzing", date: "Just now" },
  ];

  return (
    <main className="mx-auto w-full max-w-5xl p-6 pt-24 sm:p-10 sm:pt-32 lg:p-12 lg:pt-32 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <BackButton />
      {/* Header */}
      <div className="space-y-3 mb-12">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Welcome back, Developer
        </h1>
        <p className="max-w-xl text-base text-muted leading-relaxed">
          Here is an overview of your repository analysis and verified blockchain certificates.
        </p>
      </div>

      {/* Metrics Cards */}
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-12">
        {stats.map((stat, i) => (
          <article
            key={i}
            className="group relative overflow-hidden rounded-[2rem] border border-border/60 bg-surface/50 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/5 hover:border-border"
          >
            {/* Ambient Background Glow */}
            <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full ${stat.glow} blur-3xl transition-transform duration-500 group-hover:scale-150 opacity-40 mix-blend-multiply dark:mix-blend-screen`}></div>
            
            <div className="relative z-10 flex items-start justify-between">
              <div className={`p-3.5 rounded-2xl ${stat.bg} ${stat.color} ring-1 ring-inset ring-foreground/5 shadow-inner`}>
                {stat.icon}
              </div>
              <span className="text-[11px] font-semibold px-3 py-1.5 rounded-full bg-surface-strong border border-border/50 text-muted shadow-sm backdrop-blur-md">
                {stat.trend}
              </span>
            </div>
            
            <div className="relative z-10 mt-8">
              <h2 className="text-4xl font-bold tracking-tight text-foreground drop-shadow-sm">{stat.value}</h2>
              <p className="mt-2 text-sm font-medium text-muted">{stat.label}</p>
            </div>
          </article>
        ))}
      </section>

      {/* Recent Activity */}
      <section className="rounded-[2.5rem] border border-border/80 bg-surface/40 shadow-sm backdrop-blur-2xl overflow-hidden relative">
        {/* Subtle top inner border for depth */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/5 to-transparent"></div>
        
        <div className="px-8 py-6 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface/40">
          <div>
            <h3 className="text-xl font-semibold tracking-tight">Recent Scans</h3>
            <p className="text-sm text-muted mt-1">Latest repository evaluations and scores.</p>
          </div>
          <button className="text-sm font-semibold rounded-full bg-background border border-border px-4 py-2 hover:bg-surface-strong transition-colors shadow-sm">
            View all history
          </button>
        </div>
        
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-muted text-xs uppercase tracking-wider bg-surface-strong/30">
              <tr>
                <th className="px-8 py-4 font-semibold">Repository</th>
                <th className="px-8 py-4 font-semibold">Status</th>
                <th className="px-8 py-4 font-semibold">Skill Score</th>
                <th className="px-8 py-4 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {recentActivity.map((activity, i) => (
                <tr key={i} className="hover:bg-surface-strong/40 transition-colors group">
                  <td className="px-8 py-5 font-medium text-foreground flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-strong border border-border flex items-center justify-center text-muted group-hover:bg-background transition-colors">
                      <svg fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                    </div>
                    {activity.repo}
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      activity.status === 'Completed' 
                        ? 'bg-accent/10 border-accent/20 text-accent/90'
                        : 'bg-accent-strong/10 border-accent-strong/30 text-accent-strong animate-pulse'
                    }`}>
                      {activity.status === 'Completed' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                      )}
                      {activity.status === 'Analyzing' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-strong"></span>
                      )}
                      {activity.status}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    {activity.score !== null ? (
                      <div className="flex items-center gap-3">
                        <span className="font-bold w-6">{activity.score}</span>
                        <div className="w-24 h-1.5 bg-border/50 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${activity.score > 80 ? 'bg-accent' : 'bg-accent-strong'}`} 
                            style={{ width: `${activity.score}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted font-medium italic">Pending...</span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-muted font-medium">
                    {activity.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
