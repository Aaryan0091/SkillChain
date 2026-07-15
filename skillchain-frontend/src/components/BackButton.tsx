"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton({
  href = "/",
  text = "Back",
  forceHref = true,
  useHistory = false,
}: {
  href?: string;
  text?: string;
  forceHref?: boolean;
  useHistory?: boolean;
}) {
  const router = useRouter();

  function handleBack() {
    if (typeof window === "undefined") {
      router.push(href);
      return;
    }

    if (forceHref) {
      router.push(href);
      return;
    }

    if (!useHistory) {
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
      className="group mb-6 inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-[#0f172a]/90 px-4 py-2 text-sm font-medium text-white/85 shadow-[0_10px_30px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-all hover:border-white/20 hover:bg-[#162033] hover:text-white hover:shadow-md"
    >
      <ArrowLeft className="h-4 w-4 text-white/80 transition-transform group-hover:-translate-x-1 group-hover:text-white" />
      {text}
    </button>
  );
}
