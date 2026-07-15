export function statusTone(
  status: string,
  tones: Record<string, string>,
  fallback = "border-white/10 bg-white/5 text-muted"
) {
  return tones[status] || fallback;
}
