"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, ShieldCheck, Sparkles, Zap, ArrowRight, GitBranch, Terminal, Award, CheckCircle2, Eye, EyeOff } from "lucide-react";
import BackButton from "@/components/BackButton";
import LiquidEther from "@/components/LiquidEther";
import { createClient } from "@/utils/supabase/client";

const AnimaticIllustration = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 3);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center">
      {/* Dynamic Background Halo */}
      <motion.div 
        animate={{ 
          backgroundColor: step === 0 ? 'rgba(59, 130, 246, 0.1)' : step === 1 ? 'rgba(168, 85, 247, 0.1)' : 'rgba(16, 185, 129, 0.1)',
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full blur-[60px]"
      />

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="step-0"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative w-full max-w-[280px] rounded-2xl border border-white/10 bg-[#0f172a]/80 p-6 shadow-2xl backdrop-blur-md"
          >
            <div className="mb-4 flex items-center gap-3 border-b border-white/5 pb-4">
              <Terminal className="h-5 w-5 text-blue-400" />
              <span className="text-sm font-mono text-white/80">workspace.ts</span>
            </div>
            <div className="space-y-3">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                className="h-2 rounded-full bg-blue-500/40"
              />
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "75%" }}
                transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                className="h-2 rounded-full bg-blue-500/40"
              />
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "90%" }}
                transition={{ duration: 1, delay: 1, ease: "easeOut" }}
                className="h-2 rounded-full bg-blue-500/20"
              />
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              className="mt-6 flex items-center gap-2 rounded-lg bg-blue-500/10 p-2 text-xs text-blue-300 font-mono"
            >
              <GitBranch className="h-4 w-4" />
              <span>Commit: build feature</span>
            </motion.div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative w-full max-w-[280px] rounded-2xl border border-purple-500/20 bg-[#0f172a]/80 p-6 shadow-2xl backdrop-blur-md overflow-hidden"
          >
            {/* Scanning Line */}
            <motion.div
              animate={{ top: ["-10%", "110%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-[2px] bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.8)] z-20"
            />
            
            <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-purple-400" />
                <span className="text-sm font-mono text-white/80">AI Analysis</span>
              </div>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-4 w-4 text-purple-400/50" />
              </motion.div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-purple-500" />
                <span className="text-xs text-white/70">Authenticity Verified</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-purple-500" />
                <span className="text-xs text-white/70">Syntax & Logic Scored</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-purple-500" />
                <span className="text-xs text-white/70">Plagiarism Check: Pass</span>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative w-full max-w-[280px] rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 to-[#0f172a]/80 p-6 shadow-2xl backdrop-blur-md text-center"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 ring-4 ring-emerald-500/10">
              <Award className="h-8 w-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Skill Verified</h3>
            <p className="mt-2 text-xs text-emerald-200/70 font-mono bg-emerald-500/10 rounded-lg p-2">
              Tx: 0x8f...3a9b
            </p>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="mt-6 w-full rounded-xl bg-emerald-500/20 py-2 text-sm font-semibold text-emerald-400 border border-emerald-500/50 cursor-default"
            >
              Certificate Minted
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dots Indicator */}
      <div className="absolute -bottom-8 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div 
            key={i} 
            className={`h-1.5 rounded-full transition-all duration-300 ${step === i ? 'w-6 bg-white' : 'w-1.5 bg-white/20'}`} 
          />
        ))}
      </div>
    </div>
  );
};

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<'github' | 'google' | null>(null);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const supabase = createClient();

  const handleOAuthLogin = async (provider: 'github' | 'google') => {
    setMessage(null);
    setErrorMessage(null);
    setLoading(provider);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error(error);
      setErrorMessage(error.message);
      setLoading(null);
    }
  };

  const handleEmailAuth = async () => {
    setMessage(null);
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage("Email and password are required.");
      return;
    }

    if (authMode === "signup") {
      if (!name.trim()) {
        setErrorMessage("Name is required for sign up.");
        return;
      }

      if (password.length < 6) {
        setErrorMessage("Password must be at least 6 characters long.");
        return;
      }

      if (password !== confirmPassword) {
        setErrorMessage("Password and confirm password must match.");
        return;
      }
    }

    setFormLoading(true);

    if (authMode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        setFormLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: name.trim(),
          name: name.trim(),
        },
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setFormLoading(false);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setMessage("Account created. Check your email to confirm your account, then sign in.");
    setFormLoading(false);
  };

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background">
      {/* Background Effects */}
      <div className="fixed inset-0 z-[0] pointer-events-none opacity-40">
        <LiquidEther
          mouseForce={20}
          cursorSize={100}
          isViscous={false}
          viscous={30}
          colors={['#34d399', '#3b82f6', '#10b981']}
          autoDemo
          autoSpeed={0.3}
          autoIntensity={1.5}
          isBounce={false}
          resolution={0.5}
        />
      </div>
      <div className="absolute inset-0 z-[1] pointer-events-none bg-background/80 backdrop-blur-[4px]" />
      <div className="absolute inset-0 z-[2] bg-[radial-gradient(circle_at_50%_0%,rgba(52,211,153,0.1),transparent_70%)] pointer-events-none" />

      {/* Main Container */}
      <main className="relative z-10 w-full max-w-5xl p-4 sm:p-8">
        <div className="mb-6">
          <BackButton />
        </div>

        <div className="grid w-full overflow-hidden rounded-[2.5rem] border border-white/10 bg-surface/40 shadow-2xl backdrop-blur-2xl lg:grid-cols-2">
          
          {/* Left Column: Branding (hidden on mobile) */}
          <div className="relative hidden w-full flex-col justify-between overflow-hidden bg-background/60 p-10 lg:flex lg:w-full border-r border-white/5">
            {/* Background elements */}
            <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-accent/10 blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
            
            <div className="relative z-10">
              <div className="mb-6 inline-flex items-center gap-3 transition-opacity">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-emerald-500 shadow-lg shadow-accent/20">
                   <Zap className="h-6 w-6 text-[#0f172a]" />
                </div>
                <span className="text-2xl font-black tracking-tight text-white">SkillChain</span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-white xl:text-5xl mt-6">
                Your code is <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-emerald-400">your resume.</span>
              </h1>
              <p className="mt-4 text-base text-muted/90 max-w-sm leading-relaxed font-normal">
                Forget traditional interviews. Connect your GitHub, let AI verify your real-world commits, and instantly showcase your true capabilities to top teams.
              </p>
            </div>

            {/* Animatic Section */}
            <div className="relative z-10 w-full flex-1 min-h-[300px] mt-8 mb-4 flex items-center justify-center">
               <AnimaticIllustration />
            </div>

            {/* Testimonial / Humanity touch */}
            <div className="relative z-10 mt-auto">
              <div className="rounded-2xl border border-white/5 bg-white/5 p-5 backdrop-blur-md transition-all hover:bg-white/10 cursor-default shadow-xl">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 p-[2px]">
                    <div className="h-full w-full rounded-full bg-[#0f172a] flex items-center justify-center">
                       <User className="h-5 w-5 text-white/70" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-relaxed text-white/90 italic">
                      "SkillChain completely changed how I hire. Seeing verified proof of a developer's specific commits gives me absolute confidence."
                    </p>
                    <p className="mt-2 text-xs font-semibold text-emerald-400">— Sarah J., Engineering Leader</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Auth Form */}
          <div className="flex flex-col justify-center bg-background/50 p-8 sm:p-12 lg:border-l lg:border-white/10">
            <div className="mx-auto w-full max-w-md">
              
              <div className="mb-8 text-center lg:text-left">
                <h2 className="text-3xl font-bold tracking-tight text-white">
                  {authMode === "signin" ? "Welcome back" : "Create an account"}
                </h2>
                <p className="mt-2 text-sm text-muted">
                  {authMode === "signin" 
                    ? "Enter your credentials to access your dashboard." 
                    : "Fill in the details below to get started."}
                </p>
              </div>

              {/* Toggle switch */}
              <div className="mb-8 grid grid-cols-2 rounded-full border border-white/10 bg-white/5 p-1 shadow-inner backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signin");
                    setMessage(null);
                    setErrorMessage(null);
                  }}
                  className={`rounded-full py-2.5 text-sm font-semibold transition-all duration-300 ${
                    authMode === "signin"
                      ? "bg-gradient-to-r from-accent to-emerald-400 text-[#0f172a] shadow-md"
                      : "text-muted hover:text-white hover:bg-white/5"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signup");
                    setMessage(null);
                    setErrorMessage(null);
                  }}
                  className={`rounded-full py-2.5 text-sm font-semibold transition-all duration-300 ${
                    authMode === "signup"
                      ? "bg-gradient-to-r from-accent to-emerald-400 text-[#0f172a] shadow-md"
                      : "text-muted hover:text-white hover:bg-white/5"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Form Container */}
              <div className="space-y-4">
                <AnimatePresence mode="wait">
                  {authMode === "signup" && (
                    <motion.div
                      key="nameField"
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={variants}
                      className="group relative"
                    >
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-accent" />
                      </div>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full name"
                        className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white placeholder-muted-foreground outline-none transition-all focus:border-accent focus:bg-white/10 focus:ring-1 focus:ring-accent"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="group relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-accent" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white placeholder-muted-foreground outline-none transition-all focus:border-accent focus:bg-white/10 focus:ring-1 focus:ring-accent"
                  />
                </div>

                <div className="group relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-accent" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={authMode === "signup" ? "Create a password" : "Enter password"}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-12 text-sm text-white placeholder-muted-foreground outline-none transition-all focus:border-accent focus:bg-white/10 focus:ring-1 focus:ring-accent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {authMode === "signup" && (
                    <motion.div
                      key="confirmPasswordField"
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={variants}
                      className="group relative"
                    >
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-accent" />
                      </div>
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-12 text-sm text-white placeholder-muted-foreground outline-none transition-all focus:border-accent focus:bg-white/10 focus:ring-1 focus:ring-accent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {errorMessage && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                  >
                    {errorMessage}
                  </motion.p>
                )}

                {message && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-accent/20 bg-accent/10 px-4 py-3 text-sm text-accent"
                  >
                    {message}
                  </motion.p>
                )}

                <button
                  type="button"
                  onClick={handleEmailAuth}
                  disabled={formLoading || !!loading}
                  className="group relative mt-2 flex w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-accent to-emerald-400 px-4 py-4 text-sm font-bold text-[#0f172a] shadow-[0_0_20px_rgba(52,211,153,0.2)] transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(52,211,153,0.4)] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  <span className="relative z-10 flex items-center gap-2">
                    {formLoading ? (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#0f172a] border-t-transparent" />
                    ) : (
                      <>
                        {authMode === "signup" ? "Create Account" : "Sign In"}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </span>
                </button>
              </div>

              <div className="relative my-8 flex items-center">
                <div className="flex-grow border-t border-white/10" />
                <span className="mx-4 text-xs font-medium uppercase tracking-widest text-muted">
                  Or continue with
                </span>
                <div className="flex-grow border-t border-white/10" />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  onClick={() => handleOAuthLogin("github")}
                  disabled={!!loading || formLoading}
                  className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] disabled:opacity-50"
                >
                  {loading === 'github' ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/></svg>
                  )}
                  GitHub
                </button>
                
                <button
                  onClick={() => handleOAuthLogin("google")}
                  disabled={!!loading || formLoading}
                  className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] disabled:opacity-50"
                >
                  {loading === 'google' ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  )}
                  Google
                </button>
              </div>

              <div className="mt-8 flex justify-center">
                <Link
                  href="/dashboard"
                  className="group inline-flex items-center gap-1 text-xs text-muted transition-colors hover:text-white"
                >
                  Skip for now, go to dashboard
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
