import "server-only";
import { prisma } from "@/lib/db";

/**
 * Returns true if the user has an explicit ChurchAdmin assignment
 * for the given church. Returns false for any falsy input.
 */
export async function isAdminForChurch(
  userId: string | null | undefined,
  churchId: string | null | undefined
): Promise<boolean> {
  if (!userId || !churchId) return false;
  const record = await prisma.churchAdmin.findUnique({
    where: { userId_churchId: { userId, churchId } },
    select: { userId: true },
  });
  return record !== null;
}

/**
 * Returns true if the user can manage the given church — either as an
 * organiser or as an admin. Returns false for any falsy input.
 */
export async function canManageChurch(
  userId: string | null | undefined,
  role: string | null | undefined,
  churchId: string | null | undefined
): Promise<boolean> {
  if (role === "ORGANISER") return isOrganiserForChurch(userId, churchId);
  if (role === "ADMIN") return isAdminForChurch(userId, churchId);
  return false;
}

/**
 * Returns true if the user has an explicit ChurchOrganiser assignment
 * for the given church. Returns false for any falsy input.
 */
export async function isOrganiserForChurch(
  userId: string | null | undefined,
  churchId: string | null | undefined
): Promise<boolean> {
  if (!userId || !churchId) return false;
  const record = await prisma.churchOrganiser.findUnique({
    where: { userId_churchId: { userId, churchId } },
    select: { userId: true },
  });
  return record !== null;
}
