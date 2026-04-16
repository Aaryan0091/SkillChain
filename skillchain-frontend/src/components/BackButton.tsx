import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BackButton({ href = "/", text = "Back" }) {
  return (
    <Link
      href={href}
      className="group mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-4 py-2 text-sm font-medium text-muted backdrop-blur-xl transition-all hover:bg-surface hover:text-foreground hover:shadow-md"
    >
      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
      {text}
    </Link>
  );
}
