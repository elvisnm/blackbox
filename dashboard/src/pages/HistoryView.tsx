import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createPatch } from "diff";
import { html, parse } from "diff2html";
import "diff2html/bundles/css/diff2html.min.css";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import BlueprintBreadcrumb from "@/components/BlueprintBreadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getBlueprintHistory,
  getBlueprintAtCommit,
  type BlueprintCommit,
} from "@/services/github";
import { formatDate } from "@/utils/formatDate";
import { buildRepoConfig } from "@/utils/buildRepoConfig";

export default function HistoryView() {
  const { owner, repo, type, name } = useParams();
  const navigate = useNavigate();
  const [commits, setCommits] = useState<BlueprintCommit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [openShas, setOpenShas] = useState<Set<string>>(new Set());
  const [loadingShas, setLoadingShas] = useState<Set<string>>(new Set());
  const diffCache = useRef<Record<string, string>>({});
  const [, forceRender] = useState(0);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  useEffect(() => {
    if (!owner || !repo || !type || !name) return;

    async function load() {
      setLoading(true);
      try {
        const repoConfig = buildRepoConfig(owner!, repo!);
        const history = await getBlueprintHistory(repoConfig, type!, name!);
        setCommits(history);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load history");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [owner, repo, type, name]);

  function toggleSelect(sha: string) {
    setSelected((prev) => {
      if (prev.includes(sha)) return prev.filter((s) => s !== sha);
      if (prev.length >= 2) return [prev[1], sha];
      return [...prev, sha];
    });
  }

  function handleCompare() {
    if (selected.length !== 2) return;
    const [sha1, sha2] = selected;
    navigate(
      `/blueprint/${owner}/${repo}/${type}/${name}/diff/${sha1}..${sha2}`
    );
  }

  function handleToggleDiff(sha: string, index: number) {
    if (openShas.has(sha)) {
      setOpenShas((prev) => {
        const next = new Set(prev);
        next.delete(sha);
        return next;
      });
      return;
    }

    setOpenShas((prev) => new Set(prev).add(sha));

    if (diffCache.current[sha]) return;
    if (!owner || !repo || !type || !name) return;

    setLoadingShas((prev) => new Set(prev).add(sha));

    const repoConfig = buildRepoConfig(owner!, repo!);

    (async () => {
      try {
        const newContentPromise = getBlueprintAtCommit(repoConfig, type!, name!, sha);
        const oldContentPromise = index < commits.length - 1
          ? getBlueprintAtCommit(repoConfig, type!, name!, commits[index + 1].sha).catch(() => "")
          : Promise.resolve("");

        const [newContent, oldContent] = await Promise.all([newContentPromise, oldContentPromise]);

        const patch = createPatch(
          `${type}/${name}.md`,
          oldContent,
          newContent,
          index < commits.length - 1 ? commits[index + 1].sha.slice(0, 7) : "(none)",
          sha.slice(0, 7)
        );

        const diffJson = parse(patch);
        diffCache.current[sha] = html(diffJson, {
          outputFormat: "line-by-line",
          drawFileList: false,
        });
      } catch {
        diffCache.current[sha] = '<p class="text-destructive p-4">Failed to load diff.</p>';
      } finally {
        setLoadingShas((prev) => {
          const next = new Set(prev);
          next.delete(sha);
          return next;
        });
        forceRender((n) => n + 1);
      }
    })();
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 space-y-4">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-[200px] w-full rounded-lg" />
        <Skeleton className="h-[300px] w-full rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <BlueprintBreadcrumb
        items={[
          { label: `${owner}/${repo}` },
          {
            label: `${type}/${name}`,
            href: `/blueprint/${owner}/${repo}/${type}/${name}`,
          },
          { label: "History" },
        ]}
      />

      <h1 className="text-3xl font-bold mb-6">
        History: {type}/{name}
      </h1>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Git Commits</CardTitle>
            {selected.length === 2 && (
              <button
                onClick={handleCompare}
                className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Compare Selected
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {commits.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <h3 className="text-base font-semibold mb-1">No commits found</h3>
              <p className="text-muted-foreground text-sm">This blueprint has no git commit history yet.</p>
            </div>
          ) : (
            <div>
              {commits.map((commit, index) => {
                const isOpen = openShas.has(commit.sha);
                const isLoading = loadingShas.has(commit.sha);
                const cachedHtml = diffCache.current[commit.sha];

                return (
                  <div key={commit.sha} className="border-b last:border-b-0">
                    <div
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer ${isOpen ? "bg-muted border-l-2 border-l-primary" : "hover:bg-muted/50"}`}
                      onClick={() => handleToggleDiff(commit.sha, index)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSet.has(commit.sha)}
                        onChange={() => toggleSelect(commit.sha)}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded shrink-0"
                      />
                      <span className="font-mono text-xs text-muted-foreground shrink-0 w-[60px]">
                        {commit.sha.slice(0, 7)}
                      </span>
                      <span className="truncate flex-1 text-sm">
                        {commit.message.split("\n")[0]}
                      </span>
                      <span className="text-sm text-muted-foreground shrink-0">
                        {commit.author}
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatDate(commit.date)}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleDiff(commit.sha, index); }}
                        className="text-sm text-primary hover:underline shrink-0"
                      >
                        {isOpen ? "Hide" : "View Changes"}
                      </button>
                    </div>

                    {isOpen && (
                      <div className="bg-muted/20 my-2 mx-2 rounded border-2 border-border overflow-auto">
                        {isLoading || !cachedHtml ? (
                          <div className="p-4 space-y-2">
                            <Skeleton className="h-4 w-[200px]" />
                            <Skeleton className="h-[200px] w-full" />
                          </div>
                        ) : (
                          <>
                            <div className="diff-header-bar sticky top-0 z-10">
                              <span className="diff-header-old">
                                {index < commits.length - 1 ? commits[index + 1].sha.slice(0, 7) : "(initial)"}
                              </span>
                              <span className="diff-header-arrow">&rarr;</span>
                              <span className="diff-header-new">
                                {commit.sha.slice(0, 7)}
                              </span>
                            </div>
                            <div
                              className="diff-container"
                              dangerouslySetInnerHTML={{ __html: cachedHtml }}
                            />
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
