"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";
import { createClient } from "@/utils/supabase/client";

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

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center px-6 py-10 pt-24 sm:px-10 sm:pt-32">
      <div className="w-full mb-6">
        <BackButton />
      </div>
      <section className="grid w-full gap-8 rounded-[2rem] border border-border bg-surface p-8 backdrop-blur lg:grid-cols-[1fr_0.9fr] lg:p-10 lg:items-center">
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-muted">
            Authentication
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">
            Sign in or create your SkillChain profile
          </h1>
          <p className="text-base leading-7 text-muted">
            Use OAuth for quick access, or create an account with your name, email, and password for a complete profile.
          </p>
        </div>

        <div className="rounded-[1.5rem] bg-surface-strong p-6 sm:p-8 flex flex-col justify-center border border-border/50">
          <div className="mb-8 grid w-full grid-cols-2 rounded-full border border-border/80 bg-background/60 p-1 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => {
                setAuthMode("signin");
                setMessage(null);
                setErrorMessage(null);
              }}
              className={`rounded-full py-2.5 text-sm font-semibold transition-all ${
                authMode === "signin"
                  ? "bg-accent text-[#0f172a] shadow-sm"
                  : "text-muted hover:text-foreground hover:bg-white/5"
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
              className={`rounded-full py-2.5 text-sm font-semibold transition-all ${
                authMode === "signup"
                  ? "bg-accent text-[#0f172a] shadow-sm"
                  : "text-muted hover:text-foreground hover:bg-white/5"
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="space-y-4">
            {authMode === "signup" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="name">
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-all focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-all focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={authMode === "signup" ? "Create a password" : "Enter your password"}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-all focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>

            {authMode === "signup" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="confirmPassword">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirm your password"
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-all focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </div>
            )}

            {errorMessage && (
              <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {errorMessage}
              </p>
            )}

            {message && (
              <p className="rounded-2xl border border-accent/20 bg-accent/10 px-4 py-3 text-sm text-accent">
                {message}
              </p>
            )}

            <button
              type="button"
              onClick={handleEmailAuth}
              disabled={formLoading || !!loading}
              className="flex w-full items-center justify-center rounded-2xl bg-accent px-4 py-3.5 text-sm font-semibold text-[#0f172a] transition-all hover:bg-accent/90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
            >
              {formLoading
                ? authMode === "signup"
                  ? "Creating account..."
                  : "Signing in..."
                : authMode === "signup"
                  ? "Create account"
                  : "Sign in with email"}
            </button>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleOAuthLogin("github")}
              disabled={!!loading || formLoading}
              className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-background/50 px-4 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-background hover:border-border/80 disabled:opacity-50"
            >
              {loading === 'github' ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
              ) : (
                <svg className="w-5 h-5 text-foreground transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/></svg>
              )}
              Continue with GitHub
            </button>
            
            <button
              onClick={() => handleOAuthLogin("google")}
              disabled={!!loading || formLoading}
              className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-background/50 px-4 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-background hover:border-border/80 disabled:opacity-50"
            >
              {loading === 'google' ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
              ) : (
                <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              )}
              Continue with Google
            </button>
          </div>
          
          <div className="relative mt-8 mb-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-surface-strong px-2 text-muted-foreground text-[10px] tracking-wider">
                Demo shortcut
              </span>
            </div>
          </div>
          
          <Link
            href="/dashboard"
            className="inline-flex justify-center rounded-xl bg-accent/10 px-5 py-3 text-sm font-semibold text-accent transition-colors hover:bg-accent/20"
          >
            Go to dashboard directly
          </Link>
        </div>
      </section>
    </main>
  );
}
