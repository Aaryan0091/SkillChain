"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import Aurora from "../components/Aurora";
import LiquidEther from "../components/LiquidEther";
import { 
  Code2, 
  ShieldCheck, 
  TrendingUp, 
  Sparkles, 
  Terminal, 
  GitBranch, 
  Cpu, 
  ArrowRight,
  CheckCircle2
} from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const pillars = [
  {
    title: "Deep Code Analysis",
    description: "We look beyond lines of code. Our AI understands your system architecture, clean code practices, and complex logic.",
    icon: <Terminal className="h-6 w-6 text-accent" />,
  },
  {
    title: "Verifiable Proof",
    description: "Every skill score is backed by an immutable blockchain certificate. No more fake resume claims.",
    icon: <ShieldCheck className="h-6 w-6 text-accent" />,
  },
  {
    title: "Explainable Metrics",
    description: "Don't just get a score. See exactly how your commits, pull requests, and code quality contributed to your rank.",
    icon: <TrendingUp className="h-6 w-6 text-accent" />,
  },
];

const steps = [
  {
    step: "01",
    title: "Connect GitHub",
    description: "Import your best course projects, hackathon repos, and open-source contributions securely."
  },
  {
    step: "02",
    title: "AI Processing",
    description: "Our engine evaluates complexity, architecture, and documentation to extract true skill signals."
  },
  {
    step: "03",
    title: "Mint Certificate",
    description: "Generate a cryptographically secure certificate that proves to recruiters you can actually build."
  }
];

export default function Home() {
  return (
    <div className="relative min-h-screen text-foreground overflow-hidden">
      <div className="fixed inset-0 z-[0] pointer-events-none">
        <LiquidEther
          mouseForce={20}
          cursorSize={100}
          isViscous={false}
          viscous={30}
          colors={['#34d399', '#3b82f6', '#10b981']}
          autoDemo
          autoSpeed={0.5}
          autoIntensity={2.2}
          isBounce={false}
          resolution={0.5}
        />
      </div>
      
      {/* Aurora Background */}
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
        <Aurora
          colorStops={["#5227FF", "#7cff67", "#5227FF"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      </div>
      
      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Navigation */}
      <header className="relative z-50 mx-auto mt-6 flex w-full max-w-7xl items-center justify-between rounded-full border border-border bg-surface/50 px-6 py-3 backdrop-blur-xl transition-all sm:px-8">
        <div className="flex items-center gap-2">
          <Cpu className="h-6 w-6 text-accent" />
          <p className="text-base font-bold uppercase tracking-widest text-foreground">
            SkillChain<span className="text-accent">.AI</span>
          </p>
        </div>
        <nav className="hidden items-center gap-8 md:flex">
          <Link href="#features" className="text-sm font-medium text-muted hover:text-foreground transition-colors">Features</Link>
          <Link href="#how-it-works" className="text-sm font-medium text-muted hover:text-foreground transition-colors">How it Works</Link>
          <Link href="/dashboard" className="text-sm font-medium text-muted hover:text-foreground transition-colors">Dashboard</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden text-sm font-medium hover:text-accent transition-colors sm:block">
            Sign In
          </Link>
          <Link
            href="/login"
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-accent px-5 py-2 font-medium text-white shadow-lg shadow-accent/40 transition-all hover:scale-105 hover:bg-accent/90 hover:shadow-accent/60 active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-2">
              Launch App <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-12">
        {/* HERO SECTION */}
        <section className="relative pt-24 pb-32 lg:pt-36 lg:pb-40 flex flex-col items-center text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col items-center max-w-4xl"
          >
            <motion.div variants={fadeUp} className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-medium text-accent backdrop-blur-md">
              <Sparkles className="h-4 w-4" />
              <span>Stand out for SWE Internships & New Grad roles</span>
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl">
              Turn your <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-strong">code</span> into<br className="hidden sm:block"/> undeniable proof.
            </motion.h1>
            
            <motion.p variants={fadeUp} className="mt-8 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
              Stop relying on a messy GitHub profile. SkillChain AI analyzes your hackathon and course projects to generate cryptographically verified, recruiter-ready certificates.
            </motion.p>
            
            <motion.div variants={fadeUp} className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
              <Link
                href="/submit"
                className="group flex h-14 items-center gap-2 rounded-full bg-accent px-8 text-base font-semibold text-white shadow-[0_0_40px_-10px_var(--color-accent)] transition-all hover:bg-accent/90 hover:shadow-[0_0_60px_-15px_var(--color-accent)]"
              >
                <GitBranch className="h-5 w-5" />
                Connect GitHub
              </Link>
              <Link
                href="#features"
                className="flex h-14 items-center justify-center rounded-full border-2 border-border bg-surface px-8 text-base font-semibold text-foreground backdrop-blur-sm transition-colors hover:bg-border/50"
              >
                See how it works
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-12 flex items-center gap-8 text-sm font-medium text-muted">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" /> 100% Free for Students</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" /> Blockchain Verified</div>
            </motion.div>
          </motion.div>
        </section>

        {/* BENTO GRID FEATURES SECTION */}
        <section id="features" className="py-24">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="mb-16 text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">Engineered for Builders</h2>
            <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">We don't count lines of code. We analyze architecture, security, and complexity to prove you're ready for production.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            {/* Large Card 1 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-2 group relative overflow-hidden rounded-[2.5rem] border border-border bg-surface p-8 backdrop-blur-md transition-all hover:border-accent/40"
            >
              <div className="absolute top-0 right-0 p-8 opacity-20 transition-opacity group-hover:opacity-40">
                <Code2 className="h-32 w-32 text-accent" />
              </div>
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center mb-6">
                    <Terminal className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold">Deep Static Analysis</h3>
                  <p className="mt-3 text-muted max-w-md">Our AI parses your AST (Abstract Syntax Tree) to measure structural complexity, design patterns, and modularity. Prove you write clean, maintainable code.</p>
                </div>
              </div>
            </motion.div>

            {/* Small Card 1 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="group relative overflow-hidden rounded-[2.5rem] border border-border bg-surface p-8 backdrop-blur-md transition-all hover:border-accent-strong/40"
            >
              <div className="absolute bottom-0 right-0 p-4 opacity-10">
                <ShieldCheck className="h-24 w-24 text-accent-strong" />
              </div>
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div className="w-12 h-12 rounded-2xl bg-accent-strong/20 flex items-center justify-center mb-6">
                  <ShieldCheck className="h-6 w-6 text-accent-strong" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Anti-Cheat Verification</h3>
                  <p className="mt-2 text-sm text-muted">We detect forked repos and copied code to ensure your certificate is 100% authentic.</p>
                </div>
              </div>
            </motion.div>

            {/* Small Card 2 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="group relative overflow-hidden rounded-[2.5rem] border border-border bg-surface p-8 backdrop-blur-md transition-all hover:border-accent/40"
            >
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center mb-6">
                  <GitBranch className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Collaboration Metrics</h3>
                  <p className="mt-2 text-sm text-muted">Showcase your teamwork through PR reviews, issue management, and merge consistency.</p>
                </div>
              </div>
            </motion.div>

            {/* Large Card 2 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-2 group relative overflow-hidden rounded-[2.5rem] border border-border bg-gradient-to-br from-surface to-surface-strong p-8 backdrop-blur-md transition-all hover:border-accent/40"
            >
              <div className="absolute inset-0 bg-accent/5 opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative z-10 flex h-full flex-col justify-between md:flex-row md:items-center">
                <div className="mb-6 md:mb-0 md:max-w-sm">
                  <h3 className="text-2xl font-bold">On-chain Certification</h3>
                  <p className="mt-3 text-muted">Your skill profile is hashed and anchored to a public ledger. A single verifiable link lets recruiters see your proven technical abilities.</p>
                </div>
                <div className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-background/50 p-4 shadow-xl backdrop-blur-sm pointer-events-none">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-mono text-muted">BLOCKCHAIN SYNC LIVE</span>
                  </div>
                  <div className="text-sm font-mono break-all text-accent/80">0x7F2B3...9A11C<br/>HASH_VERIFIED</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" className="py-32 relative">
          <div className="absolute inset-0 bg-surface-strong/30 rounded-[3rem] -z-10" />
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold sm:text-5xl">From Repo to Resume in Minutes</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 px-4 sm:px-8">
            {steps.map((step, idx) => (
              <motion.div 
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
                className="relative flex flex-col items-center text-center p-6"
              >
                <div className="text-6xl font-black text-accent/10 mb-6">{step.step}</div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted">{step.description}</p>
                
                {idx !== steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 right-0 w-full h-[2px] bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2 translate-x-1/2" />
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="py-32">
          <div className="relative overflow-hidden rounded-[3rem] border border-border bg-surface-strong px-6 py-20 text-center sm:px-16 backdrop-blur-md">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-full bg-accent/20 blur-[100px] pointer-events-none" />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative z-10 mx-auto max-w-2xl space-y-8"
            >
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Ready to prove your skills?</h2>
              <p className="text-lg text-muted">
                Don't let your hard work get lost in the noise. Generate your verifiable skill certificate today and land your dream role.
              </p>
              <div className="flex justify-center">
                <Link
                  href="/submit"
                  className="group relative inline-flex gap-3 h-14 items-center justify-center overflow-hidden rounded-full bg-accent px-8 text-base font-medium text-white shadow-lg shadow-accent/40 transition-all hover:scale-105 hover:bg-accent/90 hover:shadow-accent/60 active:scale-95"
                >
                  Start Free Analysis
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border bg-surface/50 py-10 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 sm:flex-row lg:px-12">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-accent" />
            <span className="text-sm font-bold uppercase tracking-widest text-foreground">
              SkillChain
            </span>
          </div>
          <p className="text-sm text-muted">
            &copy; {new Date().getFullYear()} SkillChain AI. Empowering student developers.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted">
            <Link href="#" className="hover:text-foreground">Privacy</Link>
            <Link href="#" className="hover:text-foreground">Terms</Link>
            <Link href="#" className="hover:text-foreground">Twitter</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
