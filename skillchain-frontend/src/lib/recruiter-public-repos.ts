export type PublicRepoAnalysis = {
  analysisVersion: string;
  repo: {
    fullName: string;
    htmlUrl: string;
    branch: string;
  };
  basis: {
    fileStats: {
      totalFiles: number;
      sourceFiles: number;
      testFiles: number;
      docsFiles: number;
      backendFiles: number;
      frontendFiles: number;
    };
    selectedFiles: {
      path: string;
      kind: string;
    }[];
  };
  deterministic: {
    frameworks: string[];
    readme: {
      exists: boolean;
      lines: number;
      words: number;
      score: number;
      note: string;
    };
    signals: Record<string, boolean>;
  };
  nlp: {
    projectType: string;
    skillEvidence: string[];
    architectureSummary: string;
    strengths: string[];
    risks: string[];
  };
  scores: Record<string, number>;
  summary: string;
};

export type RecruiterRecentSearch = {
  recruiterId?: string;
  repoUrl: string;
  branch: string;
  repoLabel: string;
  lastViewedAt: string;
};

const RECRUITER_RECENT_SEARCHES_KEY = "skillchain-recruiter-recent-searches";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function repoLabelFromUrl(repoUrl: string) {
  try {
    const parsed = new URL(repoUrl);
    return parsed.pathname.replace(/^\/+/, "") || repoUrl;
  } catch {
    return repoUrl;
  }
}

export function readRecruiterRecentSearches(recruiterId?: string | null): RecruiterRecentSearch[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(RECRUITER_RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const entries = parsed as RecruiterRecentSearch[];
    if (!recruiterId) return entries.filter((entry) => !entry.recruiterId);
    return entries.filter((entry) => entry.recruiterId === recruiterId);
  } catch {
    return [];
  }
}

export function writeRecruiterRecentSearches(
  entries: RecruiterRecentSearch[],
  recruiterId?: string | null
) {
  if (!canUseStorage()) return;

  const existing = readAllRecruiterRecentSearches();
  const scopedEntries = recruiterId
    ? entries.map((entry) => ({ ...entry, recruiterId }))
    : entries;
  const next = recruiterId
    ? [
        ...existing.filter((entry) => entry.recruiterId !== recruiterId),
        ...scopedEntries,
      ]
    : scopedEntries;

  window.localStorage.setItem(RECRUITER_RECENT_SEARCHES_KEY, JSON.stringify(next));
}

export function pushRecruiterRecentSearch(
  repoUrl: string,
  branch?: string | null,
  recruiterId?: string | null
) {
  const trimmedUrl = repoUrl.trim();
  const trimmedBranch = branch?.trim() || "";

  if (!trimmedUrl) return [];

  const nextEntry: RecruiterRecentSearch = {
    recruiterId: recruiterId || undefined,
    repoUrl: trimmedUrl,
    branch: trimmedBranch,
    repoLabel: repoLabelFromUrl(trimmedUrl),
    lastViewedAt: new Date().toISOString(),
  };

  const current = readRecruiterRecentSearches(recruiterId);
  const deduped = current.filter(
    (entry) =>
      !(
        entry.repoUrl.trim().toLowerCase() === trimmedUrl.toLowerCase() &&
        (entry.branch?.trim() || "") === trimmedBranch
      )
  );
  const next = [nextEntry, ...deduped].slice(0, 8);
  writeRecruiterRecentSearches(next, recruiterId);
  return next;
}

function readAllRecruiterRecentSearches(): RecruiterRecentSearch[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(RECRUITER_RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as RecruiterRecentSearch[]) : [];
  } catch {
    return [];
  }
}

export function publicRepoResultHref(repoUrl: string, branch?: string | null) {
  const params = new URLSearchParams();
  params.set("repo", repoUrl);

  if (branch?.trim()) {
    params.set("branch", branch.trim());
  }

  return `/dashboard/recruiter/public-repos/result?${params.toString()}`;
}
