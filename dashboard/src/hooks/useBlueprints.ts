import { useEffect, useState } from "react";
import {
  listAllBlueprints,
  getBlueprintContent,
  getBlueprintHistory,
  type BlueprintFile,
  type BlueprintCommit,
  GitHubRateLimitError,
} from "@/services/github";
import {
  parseBlueprintMeta,
  type BlueprintMeta,
  type BlueprintType,
} from "@/services/parser";
import { clearCache } from "@/services/github";

export interface BlueprintListItem extends BlueprintMeta {
  lastUpdated: string | null;
}

interface UseBlueprintsResult {
  blueprints: BlueprintListItem[];
  loading: boolean;
  error: string | null;
  rateLimitReset: Date | null;
  lastFetched: Date | null;
  refresh: () => void;
}

export function useBlueprints(): UseBlueprintsResult {
  const [blueprints, setBlueprints] = useState<BlueprintListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitReset, setRateLimitReset] = useState<Date | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const files = await listAllBlueprints();

        const items: BlueprintListItem[] = await Promise.all(
          files.map(async (file: BlueprintFile) => {
            const [content, history] = await Promise.all([
              getBlueprintContent(file.repo, file.type, file.name),
              getBlueprintHistory(file.repo, file.type, file.name).catch(
                () => [] as BlueprintCommit[]
              ),
            ]);

            const meta = parseBlueprintMeta(
              content,
              file.name,
              file.type as BlueprintType,
              file.repo
            );

            return {
              ...meta,
              lastUpdated: history.length > 0 ? history[0].date : null,
            };
          })
        );

        if (!cancelled) {
          setBlueprints(items);
          setLastFetched(new Date());
        }
      } catch (e) {
        if (cancelled) return;
        if (e instanceof GitHubRateLimitError) {
          setRateLimitReset(e.resetAt);
          setError("GitHub API rate limit exceeded. Add a token for higher limits.");
        } else {
          setError(e instanceof Error ? e.message : "Failed to load blueprints");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const refresh = () => {
    clearCache();
    setRefreshKey((k) => k + 1);
  };

  return { blueprints, loading, error, rateLimitReset, lastFetched, refresh };
}
