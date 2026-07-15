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
}: {
  title: string;
  message: string;
  actionHref?: string;
  actionLabel?: string;
  icon?: LucideIcon;
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-[2rem] border border-white/10 bg-surface/40 text-center shadow-sm backdrop-blur-xl ${
        compact ? "p-6" : "p-8 sm:p-10"
      }`}
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[1.4rem] border border-white/10 bg-white/5 text-accent">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-xl font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted">
        {message}
      </p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-5 inline-flex cursor-pointer items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
