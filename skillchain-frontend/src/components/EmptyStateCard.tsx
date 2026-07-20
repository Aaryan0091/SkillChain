import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

export default function EmptyStateCard({
  title,
  message,
  actionHref,
  actionLabel,
  icon: Icon = Inbox,
  compact = false,
  eyebrow = "Nothing here yet",
}: {
  title: string;
  message: string;
  actionHref?: string;
  actionLabel?: string;
  icon?: LucideIcon;
  compact?: boolean;
  eyebrow?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(168,245,233,0.08),rgba(15,23,42,0.46)_42%,rgba(2,6,23,0.72))] text-center shadow-sm backdrop-blur-xl ${
        compact ? "p-6" : "p-8 sm:p-10"
      }`}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#a8f5e9]/10 blur-3xl" />
      <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-[1.4rem] border border-[#a8f5e9]/20 bg-[#a8f5e9]/10 text-[#a8f5e9]">
        <Icon className="h-6 w-6" />
      </div>
      <p className="relative mt-4 text-xs font-bold uppercase tracking-[0.2em] text-[#a8f5e9]">
        {eyebrow}
      </p>
      <h3 className="relative mt-2 text-xl font-semibold text-white">{title}</h3>
      <p className="relative mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted">
        {message}
      </p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="relative mt-5 inline-flex cursor-pointer items-center rounded-full border border-[#a8f5e9]/20 bg-[#a8f5e9]/10 px-4 py-2 text-sm font-semibold text-[#d8fff9] transition-colors hover:bg-[#a8f5e9]/15"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
