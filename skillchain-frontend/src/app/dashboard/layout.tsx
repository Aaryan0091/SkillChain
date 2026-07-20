"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import BackButton from "@/components/BackButton";
import { hasIntentionalLogout, signOutCompletely } from "@/lib/auth-session";
import { readStoredDecisionBoard } from "@/lib/recruiter-board";
import { createClient } from "@/utils/supabase/client";

function displayIdentity(user: User | null) {
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Developer";
  const githubUsername =
    user?.user_metadata?.user_name ||
    user?.user_metadata?.preferred_username ||
    user?.user_metadata?.username ||
    user?.user_metadata?.login ||
    null;

  return {
    displayName,
    displayEmail: user?.email || "dev@skillchain.ai",
    avatarLetter: displayName.charAt(0).toUpperCase() || "D",
    githubUsername:
      typeof githubUsername === "string" && githubUsername.trim().length > 0
        ? githubUsername.trim()
        : null,
  };
}

const dashboardNavItems = [
  {
    href: "/dashboard",
    label: "Overview",
    match: (pathname: string) => pathname === "/dashboard",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
    ),
  },
  {
    href: "/dashboard/submit",
    label: "Submit Repo",
    match: (pathname: string) =>
      pathname.startsWith("/dashboard/submit") || pathname.startsWith("/submit"),
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
    ),
  },
  {
    href: "/dashboard/projects",
    label: "Projects",
    match: (pathname: string) => pathname.startsWith("/dashboard/projects"),
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h6l2 2h10v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h4l2 2"/></svg>
    ),
  },
  {
    href: "/dashboard/recruiter",
    label: "Recruiter",
    match: (pathname: string) => pathname.startsWith("/dashboard/recruiter"),
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h6m-3 8c4.418 0 8-1.79 8-4V6a2 2 0 00-2-2H8a2 2 0 00-2 2v10c0 2.21 3.582 4 8 4z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 4V2m6 2V2"/></svg>
    ),
  },
  {
    href: "/dashboard/certificates",
    label: "Certificates",
    match: (pathname: string) => pathname.startsWith("/dashboard/certificates"),
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
    ),
  },
  {
    href: "/dashboard/verify",
    label: "Verify",
    match: (pathname: string) => pathname.startsWith("/dashboard/verify"),
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3l7 4v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V7l7-4z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.5 12.5l1.5 1.5 3.5-4"/></svg>
    ),
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    match: (pathname: string) => pathname.startsWith("/dashboard/settings"),
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8.5A3.5 3.5 0 1112 15.5A3.5 3.5 0 0112 8.5z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.4 15a1.7 1.7 0 00.34 1.87l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.7 1.7 0 00-1.87-.34 1.7 1.7 0 00-1.04 1.56V21a2 2 0 11-4 0v-.09A1.7 1.7 0 008.96 19.35a1.7 1.7 0 00-1.87.34l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.7 1.7 0 00.34-1.87A1.7 1.7 0 003 13.96H2.91a2 2 0 110-4H3a1.7 1.7 0 001.56-1.04 1.7 1.7 0 00-.34-1.87l-.06-.06a2 2 0 112.83-2.83l.06.06a1.7 1.7 0 001.87.34H9A1.7 1.7 0 0010.04 3H10.13a2 2 0 114 0H14a1.7 1.7 0 001.04 1.56 1.7 1.7 0 001.87-.34l.06-.06a2 2 0 112.83 2.83l-.06.06a1.7 1.7 0 00-.34 1.87V9A1.7 1.7 0 0021 10.04h.09a2 2 0 110 4H21A1.7 1.7 0 0019.44 15z"/></svg>
    ),
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const activePath =
    pathname || (typeof window !== "undefined" ? window.location.pathname : "");
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasRecruiterBoard, setHasRecruiterBoard] = useState(false);
  const [isRecruiterMenuOpen, setIsRecruiterMenuOpen] = useState(
    activePath.startsWith("/dashboard/recruiter/extend") ||
      activePath.startsWith("/dashboard/recruiter/search") ||
      activePath.startsWith("/dashboard/recruiter/candidate") ||
      activePath.startsWith("/dashboard/recruiter/public-repos")
  );

  useEffect(() => {
    const supabase = createClient();
    let isActive = true;

    const checkUser = async () => {
      if (hasIntentionalLogout()) {
        router.replace("/login?logged_out=1");
        return;
      }

      const {
        data: { user: authenticatedUser },
      } = await supabase.auth.getUser();

      if (!isActive) return;

      if (!authenticatedUser) {
        router.replace("/login");
        return;
      }

      setUser(authenticatedUser);
      setIsCheckingAuth(false);
    };

    void checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isActive) return;

      if (hasIntentionalLogout()) {
        router.replace("/login?logged_out=1");
        return;
      }

      if (!session) {
        router.replace("/login");
        return;
      }

      void supabase.auth.getUser().then(({ data }) => {
        if (!isActive) return;

        if (!data.user) {
          router.replace("/login");
          return;
        }

        setUser(data.user);
        setIsCheckingAuth(false);
      });
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    if (!user?.id) return;

    const syncRecruiterBoard = () => {
      setHasRecruiterBoard(readStoredDecisionBoard(user.id).length > 0);
    };

    syncRecruiterBoard();

    window.addEventListener("skillchain-recruiter-board-updated", syncRecruiterBoard);
    window.addEventListener("storage", syncRecruiterBoard);

    return () => {
      window.removeEventListener("skillchain-recruiter-board-updated", syncRecruiterBoard);
      window.removeEventListener("storage", syncRecruiterBoard);
    };
  }, [user?.id]);

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

  const visibleNavItems = dashboardNavItems.filter(
    (item) => item.href !== "/dashboard/recruiter"
  );
  const recruiterIsActive = activePath.startsWith("/dashboard/recruiter");
  const { displayName, displayEmail, avatarLetter, githubUsername } = displayIdentity(user);
  const isProfileActive = activePath.startsWith("/dashboard/profile");
  const isOverviewPage = activePath === "/dashboard";
  const isVerifyRecordPage =
    activePath.startsWith("/dashboard/verify/") &&
    activePath !== "/dashboard/verify";
  const backHref = isOverviewPage
    ? "/"
    : isVerifyRecordPage
      ? "/dashboard/verify"
      : "/dashboard";
  const backText = isOverviewPage
    ? "Back to Home"
    : isVerifyRecordPage
      ? "Back to Verify"
      : "Back to Overview";

  const handleSignOut = async () => {
    setIsMenuOpen(false);
    await signOutCompletely(router);
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
          {visibleNavItems.map((item) => {
            const isActive = item.match(activePath);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all lg:px-4 ${
                  isActive
                    ? "bg-accent/10 font-semibold text-accent shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                    : "font-medium text-muted hover:bg-surface-strong hover:text-foreground"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
          <div className="space-y-2">
            <div
              className={`rounded-xl transition-all ${
                recruiterIsActive
                  ? "bg-accent/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                  : "hover:bg-surface-strong"
              }`}
            >
              <div className="flex items-center gap-2 px-3 py-1.5 lg:px-4">
                <Link
                  href="/dashboard/recruiter/search"
                  prefetch={false}
                  className={`flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-lg px-0 py-1.5 text-sm transition-all ${
                    recruiterIsActive
                      ? "font-semibold text-accent"
                      : "font-medium text-muted hover:text-foreground"
                  }`}
                  aria-current={recruiterIsActive ? "page" : undefined}
                >
                  <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h6m-3 8c4.418 0 8-1.79 8-4V6a2 2 0 00-2-2H8a2 2 0 00-2 2v10c0 2.21 3.582 4 8 4z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 4V2m6 2V2"/></svg>
                  <span className="truncate">Recruiter</span>
                </Link>
                <button
                  type="button"
                    aria-label={isRecruiterMenuOpen ? "Collapse recruiter menu" : "Expand recruiter menu"}
                    aria-expanded={isRecruiterMenuOpen}
                    onClick={() => setIsRecruiterMenuOpen((value) => !value)}
                  className={`cursor-pointer rounded-lg p-2 transition ${
                    recruiterIsActive
                      ? "text-accent hover:bg-accent/10"
                      : "text-muted hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <svg
                      className={`h-4 w-4 transition-transform ${isRecruiterMenuOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
            {isRecruiterMenuOpen ? (
              <div className="ml-5 border-l border-white/10 pl-4">
                <Link
                  href="/dashboard/recruiter/search"
                  prefetch={false}
                  className={`mb-1 flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                    activePath.startsWith("/dashboard/recruiter/search")
                      ? "bg-accent/10 font-semibold text-accent"
                      : "font-medium text-muted hover:bg-surface-strong hover:text-foreground"
                  }`}
                  aria-current={activePath.startsWith("/dashboard/recruiter/search") ? "page" : undefined}
                >
                  <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"/></svg>
                  <span className="truncate">Candidate Search</span>
                </Link>
                <Link
                  href="/dashboard/recruiter/candidate?id=me"
                  prefetch={false}
                  className={`mb-1 flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                    activePath.startsWith("/dashboard/recruiter/candidate")
                      ? "bg-accent/10 font-semibold text-accent"
                      : "font-medium text-muted hover:bg-surface-strong hover:text-foreground"
                  }`}
                  aria-current={activePath.startsWith("/dashboard/recruiter/candidate") ? "page" : undefined}
                >
                  <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h6m-3 8c4.418 0 8-1.79 8-4V6a2 2 0 00-2-2H8a2 2 0 00-2 2v10c0 2.21 3.582 4 8 4z"/></svg>
                  <span className="truncate">Candidate Review</span>
                </Link>
                <Link
                  href="/dashboard/recruiter/public-repos"
                  prefetch={false}
                  className={`mb-1 flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                    activePath.startsWith("/dashboard/recruiter/public-repos")
                      ? "bg-accent/10 font-semibold text-accent"
                      : "font-medium text-muted hover:bg-surface-strong hover:text-foreground"
                  }`}
                  aria-current={activePath.startsWith("/dashboard/recruiter/public-repos") ? "page" : undefined}
                >
                  <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 7.5h.01M9 10.5h3v4.5"/></svg>
                  <span className="truncate">Public Repo Search</span>
                </Link>
                <Link
                  href="/dashboard/recruiter/extend"
                  prefetch={false}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                    activePath.startsWith("/dashboard/recruiter/extend")
                      ? "bg-accent/10 font-semibold text-accent"
                      : "font-medium text-muted hover:bg-surface-strong hover:text-foreground"
                  }`}
                  aria-current={activePath.startsWith("/dashboard/recruiter/extend") ? "page" : undefined}
                >
                  <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h10M4 17h16"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 11v6m-3-3h6"/></svg>
                  <span className="truncate">Recruiter List</span>
                  {!hasRecruiterBoard ? (
                    <span className="ml-auto rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/55">
                      Empty
                    </span>
                  ) : null}
                </Link>
              </div>
            ) : null}
          </div>
        </nav>
        <div className="border-t border-border/50 p-4">
          <Link
            href="/dashboard/profile"
            aria-current={isProfileActive ? "page" : undefined}
            className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 shadow-sm backdrop-blur transition-all ${
              isProfileActive
                ? "border-accent/25 bg-accent/10"
                : "border-border/30 bg-surface-strong/50 hover:border-border hover:bg-surface-strong"
            }`}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-strong font-bold text-white shadow-inner">
              {avatarLetter}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-semibold leading-tight">{displayName}</p>
              <p className="mt-0.5 truncate text-[11px] text-muted">{displayEmail}</p>
              {githubUsername ? (
                <p className="mt-1 truncate text-[11px] text-accent">
                  GitHub: @{githubUsername}
                </p>
              ) : null}
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
                      {githubUsername ? (
                        <p className="mt-1 truncate text-[11px] text-accent">
                          GitHub: @{githubUsername}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>

                <nav className="space-y-1.5">
                  {[
                    ...visibleNavItems.map((item) => ({
                      href: item.href,
                      label: item.href === "/submit" ? "Analyze Repo" : item.label,
                      isActive: item.match(activePath),
                    })),
                    {
                      href: "/dashboard/recruiter/search",
                      label: "Recruiter",
                      isActive: recruiterIsActive,
                    },
                    ...(isRecruiterMenuOpen
                      ? [
                          {
                            href: "/dashboard/recruiter/search",
                            label: "Candidate Search",
                            isActive: activePath.startsWith("/dashboard/recruiter/search"),
                          },
                          {
                            href: "/dashboard/recruiter/candidate?id=me",
                            label: "Candidate Review",
                            isActive: activePath.startsWith("/dashboard/recruiter/candidate"),
                          },
                          {
                            href: "/dashboard/recruiter/public-repos",
                            label: "Public Repo Search",
                            isActive: activePath.startsWith("/dashboard/recruiter/public-repos"),
                          },
                          {
                            href: "/dashboard/recruiter/extend",
                            label: "Recruiter List",
                            isActive: activePath.startsWith("/dashboard/recruiter/extend"),
                          },
                        ]
                      : []),
                    { href: "/dashboard/profile", label: "Switch Profile", isActive: activePath.startsWith("/dashboard/profile") },
                    { href: "/", label: "Back to Home", isActive: false },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={item.href.startsWith("/dashboard/recruiter") ? false : undefined}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center justify-between rounded-xl px-3 py-3 text-sm transition-colors ${
                        item.isActive
                          ? "bg-accent/10 font-semibold text-accent"
                          : "font-medium text-white hover:bg-white/5"
                      }`}
                      aria-current={item.isActive ? "page" : undefined}
                    >
                      <span>{item.label}</span>
                      <svg className={`h-4 w-4 ${item.isActive ? "text-accent" : "text-muted"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
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
            <BackButton href={backHref} text={backText} />
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
