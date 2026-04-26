import BackButton from "@/components/BackButton";
import SubmitClient from "./SubmitClient";

export default function SubmitPage() {
  return (
    <main className="flex min-h-screen w-full flex-col px-6 py-10 pt-12 sm:px-10 sm:pt-16 relative overflow-hidden">
      <div className="w-full max-w-6xl mx-auto mb-4 relative z-10 flex items-center justify-between">
        <BackButton />
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Analysis Engine Online
        </div>
      </div>
      
      <div className="relative z-10 w-full">
        <SubmitClient />
      </div>

      {/* Subtle Background Elements */}
      <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none -z-10" />
      <div className="absolute top-1/4 left-0 w-1/2 h-1/2 bg-accent/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
    </main>
  );
}
