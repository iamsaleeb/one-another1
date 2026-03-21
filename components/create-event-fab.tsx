"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useIsDetailPage } from "@/lib/hooks/use-is-detail-page";

export function CreateEventFAB({ isOrganiser }: { isOrganiser: boolean }) {
  const isDetailPage = useIsDetailPage();

  if (!isOrganiser || isDetailPage) {
    return null;
  }

  return (
    <Link
      href="/events/create"
      className="fixed bottom-20 right-4 z-50 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
      aria-label="Create event"
    >
      <Plus className="size-6" />
    </Link>
  );
}
