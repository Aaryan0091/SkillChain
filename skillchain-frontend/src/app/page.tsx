"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import Aurora from "../components/Aurora";
import LiquidEther from "../components/LiquidEther";
import { 
  Code2, 
  ShieldCheck, 
  Sparkles, 
  Terminal, 
  GitBranch, 
  Cpu, 
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { hasIntentionalLogout } from "@/lib/auth-session";

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const loadUser = async () => {
      if (hasIntentionalLogout()) {
        setIsAuthenticated(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      setIsAuthenticated(Boolean(user));
    };

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
      if (hasIntentionalLogout()) {
        setIsAuthenticated(false);
        return;
      }

      setIsAuthenticated(Boolean(session?.user));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden text-foreground">
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
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed left-0 right-0 top-3 z-50 flex w-full justify-center px-3 pointer-events-none sm:top-4 sm:px-4"
      >
        <header className="pointer-events-auto flex w-full max-w-5xl items-center justify-between rounded-full border border-white/10 bg-background/40 px-3 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-2xl transition-all sm:px-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 border border-accent/20">
              <Cpu className="h-4 w-4 text-accent" />
            </div>
            <p className="hidden sm:block text-sm font-bold uppercase tracking-widest text-foreground">
              SkillChain<span className="text-accent"></span>
            </p>
          </div>
          <div className="hidden items-center gap-1 md:flex rounded-full bg-white/5 border border-white/5 shadow-inner p-1">
            <a href="#features" className="px-4 py-1.5 rounded-full text-sm font-medium text-muted hover:text-white hover:bg-white/10 transition-all">
              Features
            </a>
            <a href="#how-it-works" className="px-4 py-1.5 rounded-full text-sm font-medium text-muted hover:text-white hover:bg-white/10 transition-all">
              How it Works
            </a>
            <Link href="/dashboard/verify" className="px-4 py-1.5 rounded-full text-sm font-medium text-muted hover:text-white hover:bg-white/10 transition-all">
              Verify ID
            </Link>
            <Link href="/dashboard" className="px-4 py-1.5 rounded-full text-sm font-medium text-accent hover:text-accent hover:bg-accent/20 transition-all">
              Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {!isAuthenticated ? (
              <Link href="/login" className="hidden text-sm font-medium text-muted hover:text-white transition-colors sm:block">
                Log In
              </Link>
            ) : null}
            <Link
              href={isAuthenticated ? "/dashboard" : "/login"}
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-white/20 bg-gradient-to-r from-accent to-emerald-400 px-4 py-2 text-sm font-medium text-background shadow-[0_0_20px_rgba(52,211,153,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_25px_rgba(52,211,153,0.5)] active:scale-95 sm:px-5 sm:text-base"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10 flex items-center gap-2 font-bold">
                {isAuthenticated ? "Open Dashboard" : "Launch App"} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </header>
      </motion.div>

      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">
        {/* HERO SECTION */}
        <section className="relative flex min-h-[100svh] flex-col items-center justify-center pt-24 pb-20 text-center sm:min-h-[100svh] sm:pt-28 sm:pb-24 lg:min-h-[100svh] lg:pt-32 lg:pb-28">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex max-w-4xl flex-col items-center"
          >
            <motion.div variants={fadeUp} className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-medium text-accent backdrop-blur-md">
              <Sparkles className="h-4 w-4" />
              <span>Stand out for SWE Internships & New Grad roles</span>
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
              Turn your <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-strong">code</span> into<br className="hidden sm:block"/> undeniable proof.
            </motion.h1>
            
            <motion.p variants={fadeUp} className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg lg:text-xl">
              Stop relying on a messy GitHub profile. SkillChain AI analyzes your hackathon and course projects to generate cryptographically verified, recruiter-ready certificates.
            </motion.p>
            
            <motion.div variants={fadeUp} className="mt-8 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-center sm:gap-4">
              <Link
                href="/submit"
                className="group flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-white shadow-[0_0_40px_-10px_var(--color-accent)] transition-all hover:bg-accent/90 hover:shadow-[0_0_60px_-15px_var(--color-accent)] sm:h-14 sm:px-8 sm:text-base"
              >
                <GitBranch className="h-5 w-5" />
                Connect GitHub
              </Link>
              <a
                href="#features"
                className="flex h-12 items-center justify-center rounded-full border-2 border-border bg-surface px-6 text-sm font-semibold text-foreground backdrop-blur-sm transition-colors hover:bg-border/50 sm:h-14 sm:px-8 sm:text-base"
              >
                See how it works
              </a>
              <Link
                href="/dashboard/verify"
                className="flex h-12 items-center justify-center rounded-full border-2 border-accent/30 bg-accent/10 px-6 text-sm font-semibold text-accent backdrop-blur-sm transition-colors hover:bg-accent/15 sm:h-14 sm:px-8 sm:text-base"
              >
                Verify Certificate ID
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm font-medium text-muted sm:mt-10 sm:gap-8">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" /> Explainable Skill Reports</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" /> Blockchain Verified</div>
            </motion.div>
          </motion.div>
        </section>

        {/* BENTO GRID FEATURES SECTION */}
        <section id="features" className="scroll-mt-24 py-16 sm:scroll-mt-28 sm:py-20 lg:py-24">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="mb-12 text-center sm:mb-16"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">Engineered for Builders</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted">We don&apos;t count lines of code. We analyze architecture, security, and complexity to prove you&apos;re ready for production.</p>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3 md:auto-rows-[280px] lg:auto-rows-[300px]">
            {/* Large Card 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-50px" }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -5 }}
              className="group relative overflow-hidden rounded-[2rem] border border-border bg-surface p-6 backdrop-blur-md transition-all hover:border-accent/40 sm:rounded-[2.5rem] sm:p-8 md:col-span-2"
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
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -5 }}
              className="group relative overflow-hidden rounded-[2rem] border border-border bg-surface p-6 backdrop-blur-md transition-all hover:border-accent-strong/40 sm:rounded-[2.5rem] sm:p-8"
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
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -5 }}
              className="group relative overflow-hidden rounded-[2rem] border border-border bg-surface p-6 backdrop-blur-md transition-all hover:border-accent/40 sm:rounded-[2.5rem] sm:p-8"
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
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -5 }}
              className="group relative overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-surface to-surface-strong p-6 backdrop-blur-md transition-all hover:border-accent/40 sm:rounded-[2.5rem] sm:p-8 md:col-span-2"
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
        <section id="how-it-works" className="relative scroll-mt-24 py-20 sm:scroll-mt-28 sm:py-24 lg:py-28">
          <div className="absolute inset-0 bg-surface-strong/30 rounded-[3rem] -z-10" />
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold sm:text-5xl">From Repo to Resume in Minutes</h2>
          </motion.div>
          
          <div className="grid gap-6 px-2 sm:px-4 md:grid-cols-3 lg:gap-8 lg:px-8">
            {steps.map((step, idx) => (
              <motion.div 
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
                className="relative flex flex-col items-center p-4 text-center sm:p-6"
              >
                <div className="mb-4 text-5xl font-black text-accent/10 sm:mb-6 sm:text-6xl">{step.step}</div>
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
        <section className="py-20 sm:py-24 lg:py-28">
          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-surface-strong px-5 py-14 text-center backdrop-blur-md sm:rounded-[2.5rem] sm:px-10 sm:py-16 lg:rounded-[3rem] lg:px-16 lg:py-20">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-full bg-accent/20 blur-[100px] pointer-events-none" />
            
            <motion.div 
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, margin: "-50px" }}
              transition={{ duration: 0.7 }}
              className="relative z-10 mx-auto max-w-2xl space-y-8"
            >
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Ready to prove your skills?</h2>
              <p className="text-base text-muted sm:text-lg">
                Don&apos;t let your hard work get lost in the noise. Generate your verifiable skill certificate today and land your dream role.
              </p>
              <div className="flex justify-center">
                <Link
                  href="/submit"
                  className="group relative inline-flex h-12 items-center justify-center gap-3 overflow-hidden rounded-full bg-accent px-6 text-sm font-medium text-white shadow-lg shadow-accent/40 transition-all hover:scale-105 hover:bg-accent/90 hover:shadow-accent/60 active:scale-95 sm:h-14 sm:px-8 sm:text-base"
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
      <motion.footer 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.6 }}
        className="border-t border-border bg-surface/50 py-8 backdrop-blur sm:py-10"
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:gap-6 sm:px-6 sm:text-left lg:px-12">
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
      </motion.footer>
    </div>
  );
}
