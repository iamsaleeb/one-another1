import { Skeleton } from "@/components/ui/skeleton";

export default function ChurchesLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="h-14 bg-primary" />
      <div className="grid grid-cols-4 gap-3 px-4 py-2 pb-24">
        <Skeleton className="aspect-[2/4] rounded-lg" />
        <Skeleton className="aspect-[2/4] rounded-lg" />
        <Skeleton className="aspect-[2/4] rounded-lg" />
        <Skeleton className="aspect-[2/4] rounded-lg" />
        <Skeleton className="aspect-[2/4] rounded-lg" />
        <Skeleton className="aspect-[2/4] rounded-lg" />
        <Skeleton className="aspect-[2/4] rounded-lg" />
        <Skeleton className="aspect-[2/4] rounded-lg" />
      </div>
    </div>
  );
}
