"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, Copy, ExternalLink, QrCode } from "lucide-react";

function resolveUrl(value: string | null | undefined) {
  if (!value) return "";
  if (typeof window === "undefined") return value;
  if (/^https?:\/\//i.test(value)) return value;
  return `${window.location.origin}${value.startsWith("/") ? value : `/${value}`}`;
}

export default function PublicCertificateTools({
  certificateId,
  verificationUrl,
  compact = false,
  recordHrefBase = "/verify",
}: {
  certificateId: string;
  verificationUrl?: string | null;
  compact?: boolean;
  recordHrefBase?: string;
}) {
  const [copied, setCopied] = useState(false);

  const publicUrl = useMemo(
    () => resolveUrl(verificationUrl || `/verify/${certificateId}`),
    [certificateId, verificationUrl]
  );

  const qrUrl = useMemo(() => {
    const encoded = encodeURIComponent(publicUrl);
    return `https://quickchart.io/qr?text=${encoded}&size=180&margin=2`;
  }, [publicUrl]);

  async function copyId() {
    await navigator.clipboard.writeText(certificateId);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <section
      className={`rounded-[1.75rem] border border-border/70 bg-background/70 ${
        compact ? "p-4" : "p-5 sm:p-6"
      }`}
    >
      <div className={`grid gap-5 ${compact ? "lg:grid-cols-[1.2fr_140px]" : "lg:grid-cols-[1.35fr_180px]"}`}>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Public Certificate ID
            </p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="break-all font-mono text-sm text-white">{certificateId}</p>
              </div>
              <button
                type="button"
                onClick={copyId}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-[#a8f5e9]/35 bg-[#a8f5e9]/10 px-4 py-2 text-sm font-semibold text-[#a8f5e9] transition-colors hover:bg-[#a8f5e9]/15"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy ID"}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`${recordHrefBase}/${certificateId}`}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent/90"
            >
              Open Public Record
              <ExternalLink className="h-4 w-4" />
            </Link>
            <Link
              href={`/verify/profile/${certificateId}`}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              View Profile
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-center">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            <QrCode className="h-4 w-4" />
            QR Access
          </div>
          <Image
            src={qrUrl}
            alt="QR code for public certificate"
            width={128}
            height={128}
            unoptimized
            className="h-32 w-32 rounded-xl bg-white p-2"
          />
          <p className="mt-2 text-xs text-muted">Scan to open the public certificate page.</p>
        </div>
      </div>
    </section>
  );
}
