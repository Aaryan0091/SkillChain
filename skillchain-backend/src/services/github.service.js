const { env } = require("../config/env");

const GITHUB_API_BASE = "https://api.github.com";

function parseGitHubRepoUrl(repoUrl) {
  let parsed;

  try {
    parsed = new URL(repoUrl.trim());
  } catch (_error) {
    throw new Error("Enter a valid GitHub repository URL.");
  }

  const host = parsed.hostname.toLowerCase();
  if (host !== "github.com" && host !== "www.github.com") {
    throw new Error("Only github.com repository URLs are supported.");
  }

  const [owner, repoWithSuffix, treeKeyword, branch] = parsed.pathname
    .split("/")
    .filter(Boolean);

  if (!owner || !repoWithSuffix) {
    throw new Error("GitHub URL must include an owner and repository name.");
  }

  const repo = repoWithSuffix.replace(/\.git$/, "");

  return {
    owner,
    repo,
    branch: treeKeyword === "tree" ? branch : undefined,
  };
}

async function githubRequest(path) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "skillchain-ai-analyzer",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (env.githubToken) {
    headers.Authorization = `Bearer ${env.githubToken}`;
  }

  const response = await fetch(`${GITHUB_API_BASE}${path}`, { headers });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Repository not found or not publicly accessible.");
    }

    if (response.status === 403) {
      throw new Error("GitHub API rate limit or access restriction reached.");
    }

    throw new Error(`GitHub API request failed with status ${response.status}.`);
  }

  return response.json();
}

async function fetchRepositorySnapshot(repoUrl, branchOverride) {
  const parsed = parseGitHubRepoUrl(repoUrl);
  const repo = await githubRequest(`/repos/${parsed.owner}/${parsed.repo}`);
  const branch = branchOverride || parsed.branch || repo.default_branch;

  const [languages, tree] = await Promise.all([
    githubRequest(`/repos/${parsed.owner}/${parsed.repo}/languages`).catch(() => ({})),
    githubRequest(
      `/repos/${parsed.owner}/${parsed.repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`
    ),
  ]);

  return {
    owner: parsed.owner,
    repo: parsed.repo,
    branch,
    metadata: {
      id: repo.id,
      fullName: repo.full_name,
      name: repo.name,
      description: repo.description || "",
      htmlUrl: repo.html_url,
      defaultBranch: repo.default_branch,
      primaryLanguage: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      openIssues: repo.open_issues_count,
      sizeKb: repo.size,
      createdAt: repo.created_at,
      updatedAt: repo.updated_at,
    },
    languages,
    tree: Array.isArray(tree.tree) ? tree.tree : [],
    truncated: Boolean(tree.truncated),
  };
}

async function fetchBlobText(owner, repo, sha) {
  const blob = await githubRequest(`/repos/${owner}/${repo}/git/blobs/${sha}`);

  if (blob.encoding !== "base64" || typeof blob.content !== "string") {
    return "";
  }

  return Buffer.from(blob.content.replace(/\n/g, ""), "base64").toString("utf8");
}

module.exports = {
  fetchBlobText,
  fetchRepositorySnapshot,
  parseGitHubRepoUrl,
};
