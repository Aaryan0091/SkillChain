"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton({ href = "/", text = "Back" }) {
  const router = useRouter();

  function handleBack() {
    if (typeof window === "undefined") {
      router.push(href);
      return;
    }

    const sameOriginReferrer =
      !!document.referrer && document.referrer.startsWith(window.location.origin);

    if (window.history.length > 1 && sameOriginReferrer) {
      router.back();
      return;
    }

    router.push(href);
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className="group mb-6 inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-surface/80 px-4 py-2 text-sm font-medium text-muted backdrop-blur-xl transition-all hover:bg-surface hover:text-foreground hover:shadow-md"
    >
      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
      {text}
    </button>
  );
}
