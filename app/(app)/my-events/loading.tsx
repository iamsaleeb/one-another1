import { Skeleton } from "@/components/ui/skeleton";

export default function MyEventsLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="h-14 bg-primary" />
      <div className="flex flex-col gap-3 px-4 py-2 pb-24">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    </div>
  );
}
