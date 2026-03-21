"use client";

import { usePathname, useParams } from "next/navigation";

export function useIsDetailPage(): boolean {
  const pathname = usePathname();
  const params = useParams();
  const id = params?.id ?? null;
  return (pathname.startsWith("/events/") || pathname.startsWith("/churches/")) && id !== null;
}
