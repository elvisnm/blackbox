import { useMemo } from "react";
import GithubSlugger from "github-slugger";

interface TocItem {
  level: number;
  text: string;
  slug: string;
}

function extractHeadings(markdown: string): TocItem[] {
  const items: TocItem[] = [];
  const slugger = new GithubSlugger();
  const lines = markdown.split("\n");
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = line.match(/^(#{2,4})\s+(.+)$/);
    if (match) {
      const text = match[2].trim();
      const cleanText = text.replace(/`/g, "");
      items.push({
        level: match[1].length,
        text,
        slug: slugger.slug(cleanText),
      });
    }
  }

  return items;
}

export default function TableOfContents({ content }: { content: string }) {
  const headings = useMemo(() => extractHeadings(content), [content]);

  if (headings.length === 0) return null;

  return (
    <nav className="text-sm">
      <h4 className="font-semibold mb-2 text-xs uppercase tracking-wide text-muted-foreground">
        On this page
      </h4>
      <ul className="space-y-1">
        {headings.map((h, i) => (
          <li
            key={i}
            style={{ paddingLeft: `${(h.level - 2) * 12}px` }}
          >
            <a
              href={`#${h.slug}`}
              className="text-muted-foreground hover:text-foreground transition-colors block py-0.5 truncate"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
