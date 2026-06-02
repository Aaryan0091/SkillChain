export function getSkillchainApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    throw new Error("Missing NEXT_PUBLIC_API_BASE_URL.");
  }

  return baseUrl.replace(/\/$/, "");
}

export function buildSkillchainApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const baseUrl = getSkillchainApiBaseUrl();

  return baseUrl.endsWith("/api/v1")
    ? `${baseUrl}${normalizedPath}`
    : `${baseUrl}/api/v1${normalizedPath}`;
}
