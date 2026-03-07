import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { createPatch } from "diff";
import { html, parse } from "diff2html";
import "diff2html/bundles/css/diff2html.min.css";
import BlueprintBreadcrumb from "@/components/BlueprintBreadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { getBlueprintAtCommit, getBlueprintHistory, type BlueprintCommit } from "@/services/github";
import { formatDate } from "@/utils/formatDate";
import { buildRepoConfig } from "@/utils/buildRepoConfig";

export default function DiffView() {
  const { owner, repo, type, name, sha1: rawSha1, sha2: rawSha2 } = useParams();
  const sha1 = rawSha1 || "";
  const sha2 = rawSha2 || "";
  const [diffHtml, setDiffHtml] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commitInfo, setCommitInfo] = useState<{
    sha1: BlueprintCommit | null;
    sha2: BlueprintCommit | null;
  }>({ sha1: null, sha2: null });

  useEffect(() => {
    if (!owner || !repo || !type || !name || !sha1 || !sha2) return;

    async function load() {
      setLoading(true);
      try {
        const repoConfig = buildRepoConfig(owner!, repo!);

        const [content1, content2, history] = await Promise.all([
          getBlueprintAtCommit(repoConfig, type!, name!, sha1),
          getBlueprintAtCommit(repoConfig, type!, name!, sha2),
          getBlueprintHistory(repoConfig, type!, name!),
        ]);

        const commit1 = history.find((c) => c.sha === sha1) || null;
        const commit2 = history.find((c) => c.sha === sha2) || null;
        setCommitInfo({ sha1: commit1, sha2: commit2 });

        const patch = createPatch(
          `${type}/${name}.md`,
          content1,
          content2,
          sha1.slice(0, 7),
          sha2.slice(0, 7)
        );

        const diffJson = parse(patch);
        const rendered = html(diffJson, {
          outputFormat: "side-by-side",
          drawFileList: false,
        });

        setDiffHtml(rendered);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to generate diff");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [owner, repo, type, name, sha1, sha2]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 space-y-4">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
        <Skeleton className="h-[400px] w-full rounded-lg" />
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
          {
            label: "History",
            href: `/blueprint/${owner}/${repo}/${type}/${name}/history`,
          },
          { label: `${sha1.slice(0, 7)}..${sha2.slice(0, 7)}` },
        ]}
      />

      <h1 className="text-3xl font-bold mb-2">
        Diff: {type}/{name}
      </h1>

      <div className="mb-6 text-sm text-muted-foreground">
        Comparing{" "}
        <span className="font-mono font-medium text-foreground">
          {sha1.slice(0, 7)}
        </span>
        {commitInfo.sha1 && ` (${formatDate(commitInfo.sha1.date)})`}
        {" vs "}
        <span className="font-mono font-medium text-foreground">
          {sha2.slice(0, 7)}
        </span>
        {commitInfo.sha2 && ` (${formatDate(commitInfo.sha2.date)})`}
        {" — "}
        {owner}/{repo}
      </div>

      <div
        className="border rounded-md overflow-auto"
        dangerouslySetInnerHTML={{ __html: diffHtml }}
      />
    </div>
  );
}
