import { useEffect, useRef, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { MarkdownHooks as Markdown } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import rehypeSlug from "rehype-slug";
import BlueprintBreadcrumb from "@/components/BlueprintBreadcrumb";
import BlueprintDetailSkeleton from "@/components/BlueprintDetailSkeleton";
import TableOfContents from "@/components/TableOfContents";
import TypeBadge from "@/components/TypeBadge";
import { getBlueprintContent } from "@/services/github";
import { buildRepoConfig } from "@/utils/buildRepoConfig";
import {
  parseBlueprintMeta,
  type BlueprintMeta,
  type BlueprintType,
} from "@/services/parser";

export default function DetailView() {
  const { owner, repo, type, name } = useParams();
  const { hash } = useLocation();
  const [content, setContent] = useState<string | null>(null);
  const [meta, setMeta] = useState<BlueprintMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasScrolled = useRef(false);

  useEffect(() => {
    if (!owner || !repo || !type || !name) return;

    async function load() {
      setLoading(true);
      try {
        const repoConfig = buildRepoConfig(owner!, repo!);
        const raw = await getBlueprintContent(repoConfig, type!, name!);
        setContent(raw);
        setMeta(
          parseBlueprintMeta(
            raw,
            name!,
            type! as BlueprintType,
            repoConfig
          )
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load blueprint");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [owner, repo, type, name]);

  useEffect(() => {
    if (!hash || loading || hasScrolled.current) return;
    const id = hash.slice(1);
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        hasScrolled.current = true;
      }
    });
  }, [hash, loading]);

  if (loading) {
    return <BlueprintDetailSkeleton />;
  }

  if (error || !meta || !content) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-destructive">{error || "Blueprint not found"}</p>
        <Link to="/" className="text-sm hover:underline mt-2 inline-block">
          Back to list
        </Link>
      </div>
    );
  }

  const githubUrl = `https://github.com/${owner}/${repo}/blob/main/.blackbox/blueprints/${type}/${name}.md`;

  return (
    <div className="container mx-auto py-8">
      <BlueprintBreadcrumb
        items={[
          { label: `${meta.repo.owner}/${meta.repo.repo}` },
          { label: `${type}/${name}` },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <article className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h2:border-b prose-h2:pb-2 prose-h3:text-lg prose-a:text-primary prose-code:before:content-none prose-code:after:content-none prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-zinc-900 prose-pre:text-zinc-100 prose-pre:border prose-table:text-sm prose-th:text-left prose-blockquote:border-l-primary/50 prose-blockquote:text-muted-foreground prose-img:rounded-lg prose-li:marker:text-muted-foreground">
          <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug, rehypeHighlight]}>{content}</Markdown>
        </article>

        <div className="space-y-4">
          <Card>
            <CardContent className="pt-4">
              <TableOfContents content={content} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Project</span>
                <span>
                  {meta.repo.owner}/{meta.repo.repo}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Type</span>
                <TypeBadge type={meta.type} />
              </div>
              {meta.asana && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Asana</span>
                  <a
                    href={meta.asana}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline truncate max-w-[160px]"
                  >
                    Open ticket
                  </a>
                </div>
              )}
              {meta.pr && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">PR</span>
                  <a
                    href={meta.pr}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline truncate max-w-[160px]"
                  >
                    View PR
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Link
              to={`/blueprint/${owner}/${repo}/${type}/${name}/history`}
              className="px-3 py-2 text-sm border rounded-md text-center hover:bg-accent"
            >
              View History
            </Link>
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-sm border rounded-md text-center hover:bg-accent"
            >
              View Raw on GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
