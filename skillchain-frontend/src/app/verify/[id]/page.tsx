import Link from "next/link";
import BackButton from "@/components/BackButton";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Code2, 
  Award, 
  GitCommit, 
  Activity,
  User,
  Clock,
  TrendingUp,
  Trophy,
  CheckCircle2,
  Fingerprint
} from "lucide-react";

type VerifyPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const demoCertificateMap: Record<
  string,
  {
    owner: string;
    username: string;
    repo: string;
    score: number;
    skills: {
      label: string;
      value: number;
    }[];
    stats: {
      label: string;
      value: string;
      note: string;
    }[];
    status: "VERIFIED ON POLYGON" | "VERIFICATION PENDING";
    tx: string;
    issuedAt: string;
    summary: string;
    progress: string[];
    achievements: string[];
  }
> = {
  "SC-2026-001": {
    owner: "Aaryan Gupta",
    username: "aaryan",
    repo: "user/nextjs-saas",
    score: 88,
    skills: [
      { label: "Frontend Systems", value: 92 },
      { label: "Architecture", value: 89 },
      { label: "Documentation", value: 84 },
      { label: "Backend Readiness", value: 81 },
    ],
    stats: [
      { label: "Repositories Analyzed", value: "12", note: "Full-stack and frontend project set" },
      { label: "Certificates Issued", value: "8", note: "7 already verified on Polygon" },
      { label: "Commits Reviewed", value: "1,426", note: "Across scanned repositories" },
      { label: "Skill Consistency", value: "91%", note: "Stable performance across recent scans" },
    ],
    status: "VERIFIED ON POLYGON",
    tx: "0x8d31...9fc2",
    issuedAt: "April 10, 2026",
    summary:
      "This certificate is a demo record showing how SkillChain AI will verify score data against a Polygon hash.",
    progress: [
      "12 repositories analyzed across full-stack and frontend projects",
      "Architecture score improved steadily over the last 3 scan cycles",
      "Documentation quality moved from acceptable to recruiter-ready",
    ],
    achievements: [
      "Verified Polygon-backed certificate issued",
      "High-signal repository structure and modular frontend patterns",
      "Consistent project delivery across multiple demo repositories",
    ],
  },
  "SC-2026-002": {
    owner: "Demo Candidate",
    username: "demo-candidate",
    repo: "user/python-api",
    score: 74,
    skills: [
      { label: "Backend APIs", value: 82 },
      { label: "Architecture", value: 72 },
      { label: "Documentation", value: 68 },
      { label: "Testing", value: 64 },
    ],
    stats: [
      { label: "Repositories Analyzed", value: "6", note: "Mostly backend service work" },
      { label: "Certificates Issued", value: "3", note: "1 awaiting on-chain anchoring" },
      { label: "Commits Reviewed", value: "684", note: "API and service-layer activity" },
      { label: "Skill Consistency", value: "76%", note: "Good backend strength, moderate variance" },
    ],
    status: "VERIFICATION PENDING",
    tx: "Awaiting blockchain write",
    issuedAt: "April 8, 2026",
    summary:
      "This demo record represents a certificate that has been issued in the app but has not yet been anchored on-chain.",
    progress: [
      "Backend API analysis completed successfully",
      "Testing signals were detected but need deeper coverage",
      "Documentation and deployment readiness are improving",
    ],
    achievements: [
      "API design competency recognized in repository analysis",
      "Certificate issued and awaiting final on-chain anchoring",
      "Demonstrated maintainable service-layer structure",
    ],
  },
  "SC-2026-003": {
    owner: "Demo Builder",
    username: "demo-builder",
    repo: "user/solidity-vault",
    score: 91,
    skills: [
      { label: "Smart Contracts", value: 95 },
      { label: "System Design", value: 90 },
      { label: "Backend Logic", value: 88 },
      { label: "Documentation", value: 79 },
    ],
    stats: [
      { label: "Repositories Analyzed", value: "15", note: "Blockchain and systems stack" },
      { label: "Certificates Issued", value: "11", note: "All public records verified" },
      { label: "Commits Reviewed", value: "2,038", note: "Strong build velocity" },
      { label: "Skill Consistency", value: "94%", note: "High performance maintained" },
    ],
    status: "VERIFIED ON POLYGON",
    tx: "0x4ab2...cc10",
    issuedAt: "April 6, 2026",
    summary:
      "This certificate demonstrates the recruiter-facing legitimacy check for a strong verified repository analysis result.",
    progress: [
      "Strong full-stack and smart contract scoring across recent submissions",
      "Repository complexity and architecture consistency are both high",
      "Skill profile is stable across blockchain and backend work",
    ],
    achievements: [
      "Top demo score among currently exposed public certificates",
      "Verified blockchain reference already available",
      "Clear evidence of contract and systems engineering depth",
    ],
  },
};

const aliasMap: Record<string, string> = {
  aaryan: "SC-2026-001",
  "demo-candidate": "SC-2026-002",
  "demo-builder": "SC-2026-003",
};

export default async function VerifyCertificatePage({ params }: VerifyPageProps) {
  const { id } = await params;
  const normalizedId = aliasMap[id.toLowerCase()] ?? id;
  const certificate = demoCertificateMap[normalizedId];

  if (!certificate) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-6 py-20 text-center">
        <div className="absolute top-10 left-10">
          <BackButton href="/verify" text="Back to Verify" />
        </div>
        <div className="mt-8 flex h-20 w-20 items-center justify-center rounded-full bg-accent-strong/10 text-accent-strong mb-8 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <p className="rounded-full border border-accent-strong/20 bg-accent-strong/10 px-5 py-2 text-xs font-bold uppercase tracking-[0.25em] text-accent-strong">
          Certificate Not Found
        </p>
        <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl drop-shadow-sm">No valid record located</h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
          This public verification area is active, but the provided certificate ID or username could not be found in our network.
        </p>
        <Link
          href="/verify"
          className="mt-10 rounded-full bg-foreground px-8 py-4 text-sm font-bold text-background transition-all hover:scale-105 hover:bg-foreground/90 shadow-xl"
        >
          Return to Verify Hub
        </Link>
      </main>
    );
  }

  const isVerified = certificate.status === "VERIFIED ON POLYGON";
  const StatIcons = [Code2, Award, GitCommit, Activity];

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-12 sm:px-8 lg:px-12">
      <div className="mb-6">
         <BackButton href="/verify" text="Back to Search" />
      </div>

      <div className="flex flex-col gap-6 lg:gap-8">
        
        {/* Top Header Section */}
        <header className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between rounded-[2.5rem] border border-border/70 bg-surface/50 p-8 sm:p-10 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 -z-10 h-full w-2/3 bg-gradient-to-l from-accent/5 to-transparent blur-3xl rounded-r-[2.5rem]" />
          <div className="absolute -left-20 -top-20 -z-10 h-60 w-60 rounded-full bg-surface-strong/50 blur-3xl" />
          
          <div className="flex items-center gap-6 z-10">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-accent/30 to-accent/5 border border-accent/30 text-accent shadow-inner">
               <User className="h-10 w-10" strokeWidth={1.5} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent drop-shadow-sm">Verified Profile</p>
                {isVerified ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent border border-accent/30 shadow-[0_0_15px_rgba(52,211,153,0.2)]">
                    <ShieldCheck className="h-3.5 w-3.5" /> On-Chain Record
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 rounded-full bg-accent-strong/15 px-3 py-1 text-xs font-semibold text-accent-strong border border-accent-strong/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                    <ShieldAlert className="h-3.5 w-3.5" /> Pending Finality
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground drop-shadow-md">
                {certificate.owner}
              </h1>
              <p className="mt-3 text-sm font-medium text-muted flex items-center gap-2">
                {normalizedId} <span className="opacity-40 text-xs mx-1">●</span> <span className="text-foreground/80">@{certificate.username}</span>
              </p>
            </div>
          </div>

          <div className="z-10 flex shrink-0 items-center justify-center gap-6 rounded-[2rem] bg-background/80 border border-border/80 p-6 shadow-xl backdrop-blur-xl transition-transform hover:scale-[1.02] duration-300">
            <div className="relative flex h-28 w-28 items-center justify-center">
              <svg className="h-full w-full -rotate-90 transform drop-shadow-lg" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" className="stroke-border/40" strokeWidth="8"/>
                <circle 
                  cx="50" cy="50" r="42" fill="none" 
                  className="stroke-accent drop-shadow-[0_0_12px_rgba(52,211,153,0.6)]" strokeWidth="8" strokeLinecap="round" 
                  strokeDasharray={`${(certificate.score / 100) * 264} 264`} 
                  style={{ transition: 'stroke-dasharray 1.5s ease-out' }}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-foreground drop-shadow-md">{certificate.score}</span>
              </div>
            </div>
            <div className="flex flex-col justify-center pr-2">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted mb-1">
                <Trophy className="h-3.5 w-3.5 text-accent" /> Developer Rank
              </p>
              <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70 drop-shadow-sm">
                {certificate.score >= 90 ? "S-Tier" : certificate.score >= 80 ? "A-Tier" : certificate.score >= 70 ? "B-Tier" : "C-Tier"}
              </p>
              <p className="text-xs font-medium text-muted/80 mt-1 max-w-[130px] leading-snug">Elite percentile across measured repositories</p>
            </div>
          </div>
        </header>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Main Left Column (Stats & Skills) */}
          <div className="md:col-span-8 flex flex-col gap-6 lg:gap-8">
            
            {/* 4 Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
              {certificate.stats.map((stat, i) => {
                const Icon = StatIcons[i % StatIcons.length];
                return (
                  <article key={stat.label} className="group relative overflow-hidden rounded-[2rem] border border-border/80 bg-surface/50 p-6 transition-all hover:-translate-y-1 hover:bg-surface/80 hover:border-accent/40 hover:shadow-xl backdrop-blur-md">
                    <div className="absolute right-0 top-0 -mr-6 -mt-6 h-32 w-32 rounded-full bg-accent/5 blur-3xl transition-all duration-500 group-hover:bg-accent/15" />
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-background/80 border border-border/50 text-muted transition-colors duration-300 group-hover:text-accent shadow-sm">
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className="mt-5 text-xs font-bold uppercase tracking-widest text-muted group-hover:text-foreground/80 transition-colors">{stat.label}</p>
                    <p className="mt-1.5 text-3xl font-black tracking-tight text-foreground drop-shadow-sm">{stat.value}</p>
                    <p className="mt-2 text-xs font-medium leading-relaxed text-muted/70">{stat.note}</p>
                  </article>
                );
              })}
            </div>

            {/* Skill Breakdown */}
            <section className="rounded-[2rem] border border-border/80 bg-surface/50 p-8 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-extrabold flex items-center gap-2.5 tracking-tight text-foreground">
                     <Activity className="h-6 w-6 text-accent" /> Skill Topography
                  </h2>
                  <p className="mt-2 text-sm font-medium text-muted">A detailed breakdown of technical competencies extracted from historical code analysis.</p>
                </div>
              </div>
              
              <div className="space-y-7">
                {certificate.skills.map((skill) => (
                  <div key={skill.label} className="group cursor-default">
                    <div className="flex items-end justify-between mb-3">
                      <p className="text-sm font-bold text-foreground/90 tracking-wide transition-colors group-hover:text-accent">{skill.label}</p>
                      <p className="text-xl font-extrabold text-foreground">{skill.value}<span className="text-sm font-bold text-muted ml-0.5">%</span></p>
                    </div>
                    <div className="relative h-3 w-full overflow-hidden rounded-full bg-border/40 shadow-inner">
                      <div
                        className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-accent/80 to-accent shadow-[0_0_12px_rgba(52,211,153,0.5)] transition-all duration-1000 ease-out"
                        style={{ width: `${skill.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* Right Column (Verification, Details, Progress) */}
          <div className="md:col-span-4 flex flex-col gap-6 lg:gap-8">
            
            {/* Blockchain Verification Status */}
            <section className="relative overflow-hidden rounded-[2rem] border border-border/80 bg-surface/50 p-7 shadow-xl backdrop-blur-md group hover:border-accent/30 transition-colors duration-300">
              <div className="absolute right-0 top-0 h-40 w-40 translate-x-1/3 -translate-y-1/3 rounded-full bg-accent/10 blur-[50px] group-hover:bg-accent/20 transition-colors duration-500" />
              <h2 className="text-xl font-extrabold flex items-center gap-2.5 mb-6 tracking-tight text-foreground">
                <Fingerprint className="h-6 w-6 text-muted group-hover:text-accent transition-colors" /> Source Integrity
              </h2>
              <div className="space-y-5 text-sm">
                <div className="rounded-2xl bg-background/60 border border-border/60 p-4.5 shadow-sm">
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-muted mb-1.5">Network Status</p>
                  <p className={`text-sm font-bold flex items-center gap-2 ${isVerified ? "text-accent drop-shadow-sm" : "text-accent-strong drop-shadow-sm"}`}>
                    {isVerified ? <ShieldCheck className="h-4.5 w-4.5"/> : <Clock className="h-4.5 w-4.5" />}
                    {isVerified ? "Secured on Polygon Mainnet" : "Awaiting Block Finality"}
                  </p>
                </div>
                <div className="rounded-2xl bg-background/60 border border-border/60 p-4.5 shadow-sm">
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-muted mb-2">Cryptographic Hash</p>
                  <p className="font-mono text-[13px] font-semibold text-foreground/90 break-all bg-surface/50 p-2.5 rounded-xl border border-border/40">
                    {certificate.tx}
                  </p>
                </div>
                <div className="rounded-2xl bg-background/60 border border-border/60 p-4.5 shadow-sm">
                   <p className="text-[11px] font-extrabold uppercase tracking-widest text-muted mb-1.5">Issuance Timestamp</p>
                   <p className="text-sm font-bold text-foreground">{certificate.issuedAt}</p>
                </div>
              </div>
            </section>

            {/* Achievements */}
            <section className="rounded-[2rem] border border-border/80 bg-surface/50 p-7 shadow-xl backdrop-blur-md flex-1">
              <h2 className="text-xl font-extrabold flex items-center gap-2.5 mb-6 tracking-tight text-foreground">
                <Trophy className="h-6 w-6 text-accent-strong drop-shadow-sm" /> Milestones
              </h2>
              <ul className="space-y-4.5">
                {certificate.achievements.map((item, i) => (
                  <li key={i} className="flex items-start gap-3.5 group">
                    <div className="bg-accent/10 p-1 rounded-full border border-accent/20 mt-0.5 shrink-0 group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                    </div>
                    <span className="text-sm font-medium leading-relaxed text-muted group-hover:text-foreground/90 transition-colors">{item}</span>
                  </li>
                ))}
              </ul>
              
              <hr className="my-7 border-border/60" />
              
              <h2 className="text-xl font-extrabold flex items-center gap-2.5 mb-6 tracking-tight text-foreground">
                <TrendingUp className="h-6 w-6 text-blue-400 drop-shadow-sm" /> Growth Trajectory
              </h2>
              <ul className="space-y-4.5">
                {certificate.progress.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 group">
                    <div className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0 group-hover:scale-150 transition-transform shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
                    <span className="text-sm font-medium leading-relaxed text-muted group-hover:text-foreground/90 transition-colors">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

          </div>
        </div>

        {/* Try Another Section */}
        <section className="mt-4 flex flex-col items-center justify-center rounded-[2.5rem] border border-border/70 bg-gradient-to-b from-surface/30 to-surface/50 p-10 text-center shadow-lg backdrop-blur-xl">
          <p className="text-sm font-extrabold tracking-[0.25em] text-muted uppercase mb-6">Explore Directory</p>
          <div className="flex flex-wrap justify-center gap-3.5 max-w-2xl">
            {Object.keys(aliasMap).map(alias => (
              <Link
                key={alias}
                href={`/verify/${alias}`}
                className="rounded-full border border-border/80 bg-background/60 px-6 py-2.5 text-xs font-bold text-foreground transition-all duration-300 hover:scale-105 hover:bg-surface hover:border-accent hover:text-accent hover:shadow-[0_0_15px_rgba(52,211,153,0.15)]"
              >
                @{alias}
              </Link>
            ))}
            <Link
              href={`/verify/SC-2026-001`}
              className="rounded-full border border-border/80 bg-background/60 px-6 py-2.5 text-xs font-bold text-foreground transition-all duration-300 hover:scale-105 hover:bg-surface hover:border-accent hover:text-accent hover:shadow-[0_0_15px_rgba(52,211,153,0.15)]"
            >
              SC-2026-001
            </Link>
            <Link
              href={`/verify/SC-2026-002`}
              className="rounded-full border border-border/80 bg-background/60 px-6 py-2.5 text-xs font-bold text-foreground transition-all duration-300 hover:scale-105 hover:bg-surface hover:border-accent hover:text-accent hover:shadow-[0_0_15px_rgba(52,211,153,0.15)]"
            >
              SC-2026-002
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}

