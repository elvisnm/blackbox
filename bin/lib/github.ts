export interface RepoCheckResult {
  status: 'public' | 'private' | 'not-found' | 'error';
  message?: string;
}

/**
 * Check if a GitHub repo (or a path within it) is accessible.
 * Without a token: 200 = public, 404 = private or doesn't exist.
 * With a token: 200 = accessible, 404 = doesn't exist.
 */
export async function checkRepoVisibility(
  ownerRepo: string,
  token?: string,
  path?: string,
): Promise<RepoCheckResult> {
  const url = path
    ? `https://api.github.com/repos/${ownerRepo}/contents/${path}`
    : `https://api.github.com/repos/${ownerRepo}`;

  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'bbox-cli',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, { headers });

    if (response.ok) {
      if (!token && !path) {
        return { status: 'public' };
      }
      // With token or checking a path — it's accessible
      return { status: 'public' };
    }

    if (response.status === 404) {
      if (token) {
        return { status: 'not-found', message: 'Repository or path not found' };
      }
      // Without a token, 404 could mean private or non-existent
      return { status: 'not-found', message: 'Private or does not exist' };
    }

    if (response.status === 403) {
      return { status: 'error', message: 'API rate limit exceeded — add a GitHub token' };
    }

    return { status: 'error', message: `GitHub API returned ${response.status}` };
  } catch (err) {
    return { status: 'error', message: `Network error: ${(err as Error).message}` };
  }
}
