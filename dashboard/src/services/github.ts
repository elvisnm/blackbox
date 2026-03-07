import config, { type RepoConfig } from "@/config";

export const BLUEPRINT_TYPES = ["feat", "fix", "improve", "hotfix"] as const;
const BASE_URL = "https://api.github.com";
const CACHE_TTL_MS = 5 * 60 * 1000;

const cache = new Map<string, { data: unknown; expiresAt: number }>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

export function clearCache(): void {
  cache.clear();
}

function headers(): HeadersInit {
  const h: HeadersInit = { Accept: "application/vnd.github.v3+json" };
  if (config.token) {
    h.Authorization = `Bearer ${config.token}`;
  }
  return h;
}

async function fetchGitHub<T>(path: string): Promise<T> {
  const cached = getCached<T>(path);
  if (cached) return cached;

  const res = await fetch(`${BASE_URL}${path}`, { headers: headers() });

  if (res.status === 403 && res.headers.get("X-RateLimit-Remaining") === "0") {
    const reset = res.headers.get("X-RateLimit-Reset");
    const resetDate = reset ? new Date(Number(reset) * 1000) : null;
    throw new GitHubRateLimitError(resetDate);
  }

  if (!res.ok) {
    throw new GitHubApiError(res.status, `GitHub API error: ${res.status}`);
  }

  const data = await res.json();
  setCache(path, data);
  return data as T;
}

export class GitHubApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "GitHubApiError";
    this.status = status;
  }
}

export class GitHubRateLimitError extends GitHubApiError {
  resetAt: Date | null;
  constructor(resetAt: Date | null) {
    super(403, "GitHub API rate limit exceeded");
    this.name = "GitHubRateLimitError";
    this.resetAt = resetAt;
  }
}

interface GitHubContent {
  name: string;
  path: string;
  type: "file" | "dir";
  content?: string;
  encoding?: string;
  sha: string;
}

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
}

export interface BlueprintFile {
  name: string;
  type: string;
  repo: RepoConfig;
}

export interface BlueprintCommit {
  sha: string;
  message: string;
  author: string;
  date: string;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetAt: Date;
}

export async function getRateLimitInfo(): Promise<RateLimitInfo> {
  const res = await fetch(`${BASE_URL}/rate_limit`, { headers: headers() });
  const data = await res.json();
  return {
    limit: data.rate.limit,
    remaining: data.rate.remaining,
    resetAt: new Date(data.rate.reset * 1000),
  };
}

function decodeBase64Utf8(base64: string): string {
  const binary = atob(base64.replace(/\n/g, ""));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export async function listBlueprints(
  repo: RepoConfig
): Promise<BlueprintFile[]> {
  const results = await Promise.all(
    BLUEPRINT_TYPES.map(async (type) => {
      const path = `/repos/${repo.owner}/${repo.repo}/contents/.blackbox/blueprints/${type}?ref=${repo.branch}`;
      try {
        const files = await fetchGitHub<GitHubContent[]>(path);
        return files
          .filter(
            (file) =>
              file.type === "file" &&
              file.name.endsWith(".md") &&
              file.name !== "_template.md"
          )
          .map((file) => ({
            name: file.name.replace(/\.md$/, ""),
            type,
            repo,
          }));
      } catch (e) {
        if (e instanceof GitHubApiError && e.status === 404) {
          return [];
        }
        throw e;
      }
    })
  );

  return results.flat();
}

export async function listAllBlueprints(): Promise<BlueprintFile[]> {
  const results = await Promise.allSettled(
    config.repos.map((repo) => listBlueprints(repo))
  );

  const blueprints: BlueprintFile[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      blueprints.push(...result.value);
    }
  }

  return blueprints;
}

export async function getBlueprintContent(
  repo: RepoConfig,
  type: string,
  name: string
): Promise<string> {
  const path = `/repos/${repo.owner}/${repo.repo}/contents/.blackbox/blueprints/${type}/${name}.md?ref=${repo.branch}`;
  const data = await fetchGitHub<GitHubContent>(path);

  if (data.content && data.encoding === "base64") {
    return decodeBase64Utf8(data.content);
  }

  throw new Error("Unexpected content encoding");
}

export async function getBlueprintHistory(
  repo: RepoConfig,
  type: string,
  name: string
): Promise<BlueprintCommit[]> {
  const path = `/repos/${repo.owner}/${repo.repo}/commits?path=.blackbox/blueprints/${type}/${name}.md&sha=${repo.branch}`;
  const commits = await fetchGitHub<GitHubCommit[]>(path);

  return commits.map((c) => ({
    sha: c.sha,
    message: c.commit.message,
    author: c.commit.author.name,
    date: c.commit.author.date,
  }));
}

export async function getBlueprintAtCommit(
  repo: RepoConfig,
  type: string,
  name: string,
  sha: string
): Promise<string> {
  const path = `/repos/${repo.owner}/${repo.repo}/contents/.blackbox/blueprints/${type}/${name}.md?ref=${sha}`;
  const data = await fetchGitHub<GitHubContent>(path);

  if (data.content && data.encoding === "base64") {
    return decodeBase64Utf8(data.content);
  }

  throw new Error("Unexpected content encoding");
}
