import { type RepoConfig } from "@/config";

export function buildRepoConfig(owner: string, repo: string): RepoConfig {
  return { owner, repo, branch: "main" };
}
