export type CandidateReviewStatus = "pending" | "selected" | "shortlisted" | "declined";

export type CandidateDecisionEntry = {
  id: string;
  recruiterId?: string;
  label: string;
  status: CandidateReviewStatus;
  roleLabel: string;
  desiredRole: string;
  score: number;
  updatedAt: string;
};

export const DECISION_STORAGE_KEY = "skillchain-recruiter-decisions";

export function readStoredDecisionBoard(recruiterId?: string | null) {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(DECISION_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CandidateDecisionEntry[];
    if (!Array.isArray(parsed)) return [];
    if (!recruiterId) return parsed.filter((entry) => !entry.recruiterId);
    return parsed.filter((entry) => entry.recruiterId === recruiterId);
  } catch {
    return [];
  }
}

export function writeStoredDecisionBoard(
  entries: CandidateDecisionEntry[],
  recruiterId?: string | null
) {
  if (typeof window === "undefined") return;

  const existing = readAllStoredDecisionBoard();
  const scopedEntries = recruiterId
    ? entries.map((entry) => ({ ...entry, recruiterId }))
    : entries;
  const next = recruiterId
    ? [
        ...existing.filter((entry) => entry.recruiterId !== recruiterId),
        ...scopedEntries,
      ]
    : scopedEntries;

  window.localStorage.setItem(DECISION_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("skillchain-recruiter-board-updated"));
}

function readAllStoredDecisionBoard() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(DECISION_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CandidateDecisionEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
