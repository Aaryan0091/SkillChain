import Link from "next/link";
import React from "react";
import { redirect } from "next/navigation";
import BackButton from "@/components/BackButton";
import { getSessionUser } from "@/utils/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Developer";
  const displayEmail = user.email || "dev@skillchain.ai";
  const avatarLetter = displayName.charAt(0).toUpperCase() || "D";

  return (
    <div className="relative flex min-h-screen w-full">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-border bg-surface/50 backdrop-blur-xl lg:flex">
        <div className="flex h-16 items-center px-6 border-b border-border/50">
          <Link href="/" className="text-lg font-bold tracking-[0.2em] uppercase text-accent">
            SkillChain
          </Link>
        </div>
        <nav className="flex-1 space-y-2 p-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-xl bg-accent/10 lg:px-4 px-3 py-3 text-sm font-semibold text-accent transition-all shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            Overview
          </Link>
          <Link
            href="/submit"
            className="flex items-center gap-3 rounded-xl lg:px-4 px-3 py-3 text-sm font-medium text-muted hover:bg-surface-strong hover:text-foreground transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            Submit Repo
          </Link>
          <Link
            href="/dashboard/certificates"
            className="flex items-center gap-3 rounded-xl lg:px-4 px-3 py-3 text-sm font-medium text-muted hover:bg-surface-strong hover:text-foreground transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
            Certificates
          </Link>
        </nav>
        <div className="p-4 border-t border-border/50">
          <Link href="/dashboard/profile" className="flex items-center gap-3 rounded-2xl bg-surface-strong/50 border border-border/30 p-3 backdrop-blur shadow-sm hover:bg-surface-strong hover:border-border transition-all cursor-pointer">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-accent to-accent-strong text-white flex items-center justify-center font-bold shadow-inner">
              {avatarLetter}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate leading-tight">{displayName}</p>
              <p className="text-[11px] text-muted truncate mt-0.5">{displayEmail}</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex min-h-screen flex-1 flex-col overflow-x-hidden">
        {/* Mobile Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-surface/80 px-4 backdrop-blur-md sm:px-6 lg:hidden">
          <Link href="/" className="text-sm font-bold tracking-widest uppercase text-accent">
            SkillChain
          </Link>
          <button className="text-muted p-2 -mr-2 active:scale-95 transition-transform">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        </header>
        
        <div className="relative z-10 flex-1">
          <div className="hidden px-4 pt-4 sm:px-6 md:block lg:px-8 lg:pt-6">
            <BackButton href="/" text="Back to Home" />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
