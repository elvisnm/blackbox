import { Skeleton } from "@/components/ui/skeleton";

export default function BlueprintListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3">
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-5 w-[50px] rounded-full" />
          <Skeleton className="h-5 w-[80px] rounded-full" />
          <Skeleton className="h-4 w-[60px]" />
          <Skeleton className="h-4 w-[100px]" />
        </div>
      ))}
    </div>
  );
}
