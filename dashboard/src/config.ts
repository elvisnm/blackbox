export interface RepoConfig {
  owner: string;
  repo: string;
  branch: string;
}

export interface DashboardConfig {
  repos: RepoConfig[];
  token?: string;
}

declare const __BLACKBOX_CONFIG__: {
  author?: string;
  token?: string;
  repos?: Array<{ owner: string; repo: string; branch: string }>;
} | null;

const FALLBACK_CONFIG: DashboardConfig = {
  repos: [
    { owner: "elvisnm", repo: "blackbox", branch: "main" },
  ],
};

function buildConfig(): DashboardConfig {
  const globalConfig = typeof __BLACKBOX_CONFIG__ !== "undefined" ? __BLACKBOX_CONFIG__ : null;

  if (globalConfig && Array.isArray(globalConfig.repos) && globalConfig.repos.length > 0) {
    return {
      repos: globalConfig.repos,
      token: globalConfig.token || import.meta.env.VITE_GITHUB_TOKEN || undefined,
    };
  }

  return {
    ...FALLBACK_CONFIG,
    token: import.meta.env.VITE_GITHUB_TOKEN || undefined,
  };
}

const config: DashboardConfig = buildConfig();

export default config;
