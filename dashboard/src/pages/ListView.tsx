import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import TypeBadge from "@/components/TypeBadge";
import BlueprintListSkeleton from "@/components/BlueprintListSkeleton";
import EmptyState from "@/components/EmptyState";
import { useBlueprints, type BlueprintListItem } from "@/hooks/useBlueprints";
import config from "@/config";
import type { BlueprintType } from "@/services/parser";
import { BLUEPRINT_TYPES } from "@/services/github";
import { formatDate } from "@/utils/formatDate";

const ALL_TYPES: readonly BlueprintType[] = BLUEPRINT_TYPES;

type SortKey = "title" | "type" | "lastUpdated";
type SortDir = "asc" | "desc";

function compareBlueprints(
  a: BlueprintListItem,
  b: BlueprintListItem,
  key: SortKey,
  dir: SortDir
): number {
  let result = 0;
  switch (key) {
    case "title":
      result = a.title.localeCompare(b.title);
      break;
    case "type":
      result = a.type.localeCompare(b.type);
      break;
    case "lastUpdated": {
      const dateA = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
      const dateB = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
      result = dateB - dateA;
      break;
    }
  }
  return dir === "desc" ? -result : result;
}

export default function ListView() {
  const { blueprints, loading, error, rateLimitReset, lastFetched, refresh } =
    useBlueprints();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("lastUpdated");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const projects = useMemo(() => {
    const set = new Set(
      config.repos.map((r) => `${r.owner}/${r.repo}`)
    );
    blueprints.forEach((b) => set.add(`${b.repo.owner}/${b.repo.repo}`));
    return Array.from(set).sort();
  }, [blueprints]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const result = blueprints.filter((b) => {
      if (typeFilter !== "all" && b.type !== typeFilter) return false;
      if (
        projectFilter !== "all" &&
        `${b.repo.owner}/${b.repo.repo}` !== projectFilter
      )
        return false;
      if (q && !b.title.toLowerCase().includes(q) && !b.name.toLowerCase().includes(q))
        return false;
      return true;
    });
    return result.sort((a, b) => compareBlueprints(a, b, sortKey, sortDir));
  }, [blueprints, typeFilter, projectFilter, sortKey, sortDir, search]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return "";
    return sortDir === "asc" ? " \u2191" : " \u2193";
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Blueprints</h1>
        <div className="flex items-center gap-3">
          {lastFetched && (
            <span className="text-xs text-muted-foreground">
              Updated {lastFetched.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={refresh}
            className="px-3 py-1.5 text-sm border rounded-md hover:bg-accent"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-md">
          {error}
          {rateLimitReset && (
            <p className="text-sm mt-1">
              Resets at {rateLimitReset.toLocaleTimeString()}
            </p>
          )}
        </div>
      )}

      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Search blueprints..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-[250px]"
        />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {ALL_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <BlueprintListSkeleton />
      ) : filtered.length === 0 && blueprints.length === 0 ? (
        <EmptyState
          title="No blueprints found"
          description={`${config.repos.length} repo(s) configured but no blueprints were found. Make sure .blackbox/blueprints/ is committed and pushed to GitHub. Run bbox check to verify your setup.`}
          action={
            <button
              onClick={refresh}
              className="px-3 py-1.5 text-sm border rounded-md hover:bg-accent"
            >
              Refresh
            </button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No matches"
          description={
            projectFilter !== "all"
              ? `No blueprints found in ${projectFilter}. This project may not have any blueprints yet. Use /scaffold to create one.`
              : "No blueprints match the current filters. Try adjusting your type or project filters."
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead
                className="cursor-pointer select-none hover:text-foreground"
                onClick={() => handleSort("title")}
              >
                Name{sortIndicator("title")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none hover:text-foreground"
                onClick={() => handleSort("type")}
              >
                Type{sortIndicator("type")}
              </TableHead>
              <TableHead>Asana</TableHead>
              <TableHead>PR</TableHead>
              <TableHead
                className="cursor-pointer select-none hover:text-foreground"
                onClick={() => handleSort("lastUpdated")}
              >
                Last Updated{sortIndicator("lastUpdated")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((b) => (
              <TableRow key={`${b.repo.owner}/${b.repo.repo}/${b.type}/${b.name}`}>
                <TableCell className="text-muted-foreground">
                  {b.repo.owner}/{b.repo.repo}
                </TableCell>
                <TableCell>
                  <Link
                    to={`/blueprint/${b.repo.owner}/${b.repo.repo}/${b.type}/${b.name}`}
                    className="font-medium hover:underline"
                  >
                    {b.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <TypeBadge type={b.type} />
                </TableCell>
                <TableCell>
                  {b.asana ? (
                    <a
                      href={b.asana}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      Open
                    </a>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {b.pr ? (
                    <a
                      href={b.pr}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      View
                    </a>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(b.lastUpdated)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
