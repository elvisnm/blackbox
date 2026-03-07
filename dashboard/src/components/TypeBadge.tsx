import { Badge } from "@/components/ui/badge";
import type { BlueprintType } from "@/services/parser";

const typeColors: Record<BlueprintType, string> = {
  feat: "bg-indigo-100 text-indigo-700 border-indigo-300",
  fix: "bg-red-100 text-red-700 border-red-300",
  improve: "bg-amber-100 text-amber-700 border-amber-300",
  hotfix: "bg-rose-100 text-rose-700 border-rose-300",
};

export default function TypeBadge({ type }: { type: BlueprintType }) {
  return (
    <Badge variant="outline" className={typeColors[type] || ""}>
      {type}
    </Badge>
  );
}
