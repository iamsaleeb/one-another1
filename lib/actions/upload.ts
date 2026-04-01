"use server";

import { UTApi } from "uploadthing/server";
import { auth } from "@/auth";
import { UserRole } from "@prisma/client";

const utapi = new UTApi();

const ALLOWED_HOSTS = ["utfs.io", "ufs.sh"];

function extractFileKey(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  if (parsed.protocol !== "https:") return null;

  const hostAllowed =
    ALLOWED_HOSTS.includes(parsed.hostname) ||
    ALLOWED_HOSTS.some((h) => parsed.hostname.endsWith(`.${h}`));
  if (!hostAllowed) return null;

  if (!parsed.pathname.startsWith("/f/")) return null;

  const key = parsed.pathname.slice(3);
  return key || null;
}

export async function deleteUploadedFileAction(url: string): Promise<void> {
  const session = await auth();
  if (
    session?.user?.role !== UserRole.ORGANISER &&
    session?.user?.role !== UserRole.ADMIN
  ) {
    return;
  }

  const key = extractFileKey(url);
  if (!key) return;

  await utapi.deleteFiles(key);
}
