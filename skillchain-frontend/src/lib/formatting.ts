export function titleCase(value: string) {
  return value
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function parseDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function formatLongDate(value: string | null) {
  const date = parseDate(value);
  if (!date) return "Unknown";

  return date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatShortDate(value: string | null) {
  const date = parseDate(value);
  if (!date) return "Unknown";

  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value: string | null) {
  const date = parseDate(value);
  if (!date) return "Unknown";

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeDate(value: string | null) {
  const date = parseDate(value);
  if (!date) return "No activity yet";

  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.max(0, Math.round(diffMs / (1000 * 60 * 60)));

  if (diffHours < 1) return "Updated just now";
  if (diffHours < 24) return `Updated ${diffHours}h ago`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `Updated ${diffDays}d ago`;

  return `Updated ${date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })}`;
}

export function averageNumbers(values: Array<number | null | undefined>) {
  const valid = values.filter((value): value is number => typeof value === "number");
  if (!valid.length) return null;
  return Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length);
}
