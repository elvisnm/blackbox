import type { RepoConfig } from "@/config";

export type BlueprintType = "feat" | "fix" | "improve" | "hotfix";

export interface BlueprintMeta {
  name: string;
  type: BlueprintType;
  title: string;
  asana: string | null;
  pr: string | null;
  repo: RepoConfig;
}

function extractHeaderField(content: string, field: string): string | null {
  const regex = new RegExp(`^>\\s*\\*\\*${field}:\\*\\*\\s*(.+)$`, "mi");
  const match = content.match(regex);
  if (!match) return null;
  const value = match[1].trim();
  if (value.startsWith("_") && value.endsWith("_")) return null;
  if (value.toLowerCase() === "n/a") return null;
  return value;
}

function extractLink(value: string | null): string | null {
  if (!value) return null;
  const linkMatch = value.match(/\[.*?\]\((.*?)\)/);
  if (linkMatch) return linkMatch[1];
  if (value.startsWith("http")) return value;
  return value;
}

export function parseBlueprintMeta(
  content: string,
  name: string,
  type: BlueprintType,
  repo: RepoConfig
): BlueprintMeta {
  // v2 title format: # {type}/{name}
  const titleMatchV2 = content.match(/^#\s+(.+)$/m);
  // v1 fallback: # Blueprint: {title}
  const titleMatchV1 = content.match(/^#\s+Blueprint:\s*(.+)$/m);
  const title = titleMatchV1
    ? titleMatchV1[1].trim()
    : titleMatchV2
      ? titleMatchV2[1].trim()
      : name;

  const asanaRaw = extractHeaderField(content, "Asana");
  const prRaw = extractHeaderField(content, "PR");

  return {
    name,
    type,
    title,
    asana: extractLink(asanaRaw),
    pr: extractLink(prRaw),
    repo,
  };
}
