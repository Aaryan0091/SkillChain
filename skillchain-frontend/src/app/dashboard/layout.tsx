import Link from "next/link";
import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full relative">
      {/* Sidebar */}
      <aside className="sticky top-0 h-screen w-64 flex-col border-r border-border bg-surface/50 backdrop-blur-xl hidden md:flex">
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
          <div className="flex items-center gap-3 rounded-2xl bg-surface-strong/50 border border-border/30 p-3 backdrop-blur shadow-sm">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-accent to-accent-strong text-white flex items-center justify-center font-bold shadow-inner">
              D
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate leading-tight">Developer</p>
              <p className="text-[11px] text-muted truncate mt-0.5">dev@skillchain.ai</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between h-16 px-6 border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-20">
          <Link href="/" className="text-sm font-bold tracking-widest uppercase text-accent">
            SkillChain
          </Link>
          <button className="text-muted p-2 -mr-2 active:scale-95 transition-transform">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        </header>
        
        <div className="flex-1 relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
