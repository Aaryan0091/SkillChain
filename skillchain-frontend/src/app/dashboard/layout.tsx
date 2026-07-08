"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import BackButton from "@/components/BackButton";
import { createClient } from "@/utils/supabase/client";

function displayIdentity(user: User | null) {
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Developer";

  return {
    displayName,
    displayEmail: user?.email || "dev@skillchain.ai",
    avatarLetter: displayName.charAt(0).toUpperCase() || "D",
  };
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let isActive = true;

    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user ?? null;

      if (!isActive) return;

      if (!currentUser) {
        router.replace("/login");
        return;
      }

      setUser(currentUser);
      setIsCheckingAuth(false);
    };

    void checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isActive) return;

      const currentUser = session?.user ?? null;

      if (!currentUser) {
        router.replace("/login");
        return;
      }

      setUser(currentUser);
      setIsCheckingAuth(false);
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen]);

  const { displayName, displayEmail, avatarLetter } = displayIdentity(user);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsMenuOpen(false);
    router.replace("/login");
  };

  return (
    <div className="relative flex min-h-screen w-full">
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-border bg-surface/50 backdrop-blur-xl lg:flex">
        <div className="flex h-16 items-center border-b border-border/50 px-6">
          <Link href="/" className="text-lg font-bold uppercase tracking-[0.2em] text-accent">
            SkillChain
          </Link>
        </div>
        <nav className="flex-1 space-y-2 p-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-xl bg-accent/10 px-3 py-3 text-sm font-semibold text-accent shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] transition-all lg:px-4"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            Overview
          </Link>
          <Link
            href="/submit"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-muted transition-all hover:bg-surface-strong hover:text-foreground lg:px-4"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            Submit Repo
          </Link>
          <Link
            href="/dashboard/certificates"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-muted transition-all hover:bg-surface-strong hover:text-foreground lg:px-4"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
            Certificates
          </Link>
        </nav>
        <div className="border-t border-border/50 p-4">
          <Link href="/dashboard/profile" className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border/30 bg-surface-strong/50 p-3 shadow-sm backdrop-blur transition-all hover:border-border hover:bg-surface-strong">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-strong font-bold text-white shadow-inner">
              {avatarLetter}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-semibold leading-tight">{displayName}</p>
              <p className="mt-0.5 truncate text-[11px] text-muted">{displayEmail}</p>
            </div>
          </Link>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col overflow-x-hidden">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-surface/80 px-4 backdrop-blur-md sm:px-6 lg:hidden">
          <Link href="/" className="text-sm font-bold uppercase tracking-widest text-accent">
            SkillChain
          </Link>
          <button
            type="button"
            aria-label="Open dashboard menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((value) => !value)}
            className="-mr-2 cursor-pointer rounded-xl p-2 text-muted transition-all hover:bg-white/5 hover:text-white active:scale-95"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        </header>

        <div className="relative z-10 flex-1">
          {isMenuOpen ? (
            <>
              <button
                type="button"
                aria-label="Close dashboard menu"
                onClick={() => setIsMenuOpen(false)}
                className="fixed inset-0 z-30 bg-black/40 lg:hidden"
              />
              <div className="fixed right-4 top-20 z-40 w-[min(20rem,calc(100vw-2rem))] rounded-[1.6rem] border border-border/70 bg-surface/95 p-3 shadow-[0_24px_70px_rgba(0,0,0,0.28)] backdrop-blur-2xl lg:hidden">
                <div className="mb-3 rounded-[1.2rem] border border-border/50 bg-background/50 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-strong font-bold text-white shadow-inner">
                      {avatarLetter}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{displayName}</p>
                      <p className="truncate text-xs text-muted">{displayEmail}</p>
                    </div>
                  </div>
                </div>

                <nav className="space-y-1.5">
                  {[
                    { href: "/dashboard", label: "Overview" },
                    { href: "/submit", label: "Analyze Repo" },
                    { href: "/dashboard/certificates", label: "Certificates" },
                    { href: "/dashboard/profile", label: "Switch Profile" },
                    { href: "/", label: "Back to Home" },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-white transition-colors hover:bg-white/5"
                    >
                      <span>{item.label}</span>
                      <svg className="h-4 w-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                    </Link>
                  ))}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-medium text-red-300 transition-colors hover:bg-red-500/10"
                  >
                    <span>Logout</span>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1"/></svg>
                  </button>
                </nav>
              </div>
            </>
          ) : null}
          <div className="hidden px-4 pt-4 sm:px-6 md:block lg:px-8 lg:pt-6">
            <BackButton href="/" text="Back to Home" />
          </div>
          {isCheckingAuth ? (
            <main className="w-full px-4 pb-12 pt-4 sm:px-6 sm:pb-14 lg:px-8 lg:pb-16">
              <section className="overflow-hidden rounded-[2.5rem] border border-border/70 bg-surface/50 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
                <div className="animate-pulse space-y-4">
                  <div className="h-5 w-36 rounded-full bg-white/10" />
                  <div className="h-10 w-full max-w-xl rounded-2xl bg-white/10" />
                  <div className="h-5 w-full max-w-md rounded-full bg-white/8" />
                </div>
              </section>
            </main>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}
