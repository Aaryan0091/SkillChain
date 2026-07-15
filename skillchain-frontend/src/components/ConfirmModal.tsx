"use client";

import { Trash2, X } from "lucide-react";

export default function ConfirmModal({
  open,
  title,
  description,
  detail,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  busy = false,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  detail?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-surface/95 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300">
              Confirm removal
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-white">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="inline-flex cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 p-2 text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-muted">{description}</p>
        {detail ? <p className="mt-2 text-sm leading-relaxed text-muted">{detail}</p> : null}

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="inline-flex cursor-pointer items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm font-semibold text-red-200 transition-colors hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" />
            {busy ? "Removing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
