"use client";

import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  LoaderCircle,
} from "lucide-react";

type StatePanelVariant = "error" | "success" | "info" | "warning" | "loading";

const variantStyles: Record<
  StatePanelVariant,
  {
    icon: LucideIcon;
    wrapper: string;
    iconWrap: string;
    title: string;
    body: string;
  }
> = {
  error: {
    icon: AlertTriangle,
    wrapper: "border-red-500/25 bg-red-500/10",
    iconWrap: "border-red-400/25 bg-red-500/15 text-red-200",
    title: "text-red-100",
    body: "text-red-200/90",
  },
  success: {
    icon: CheckCircle2,
    wrapper: "border-emerald-400/25 bg-emerald-500/10",
    iconWrap: "border-emerald-400/25 bg-emerald-500/15 text-emerald-200",
    title: "text-emerald-100",
    body: "text-emerald-100/85",
  },
  info: {
    icon: Info,
    wrapper: "border-white/10 bg-white/5",
    iconWrap: "border-white/10 bg-white/10 text-white/80",
    title: "text-white",
    body: "text-muted",
  },
  warning: {
    icon: AlertTriangle,
    wrapper: "border-[#a8f5e9]/25 bg-[#a8f5e9]/10",
    iconWrap: "border-[#a8f5e9]/25 bg-[#a8f5e9]/12 text-[#a8f5e9]",
    title: "text-white",
    body: "text-white/75",
  },
  loading: {
    icon: LoaderCircle,
    wrapper: "border-sky-400/20 bg-sky-500/10",
    iconWrap: "border-sky-400/20 bg-sky-500/15 text-sky-200",
    title: "text-sky-100",
    body: "text-sky-100/80",
  },
};

export default function StatePanel({
  variant,
  title,
  message,
  className = "",
}: {
  variant: StatePanelVariant;
  title: string;
  message: string;
  className?: string;
}) {
  const styles = variantStyles[variant];
  const Icon = styles.icon;

  return (
    <div
      className={`rounded-[1.35rem] border p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${styles.wrapper} ${className}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border ${styles.iconWrap}`}
        >
          <Icon className={`h-4.5 w-4.5 ${variant === "loading" ? "animate-spin" : ""}`} />
        </div>
        <div className="min-w-0">
          <p className={`text-sm font-semibold ${styles.title}`}>{title}</p>
          <p className={`mt-1 text-sm leading-relaxed ${styles.body}`}>{message}</p>
        </div>
      </div>
    </div>
  );
}
