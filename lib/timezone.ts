import { cookies } from "next/headers";

export const DEFAULT_TIMEZONE = "Australia/Sydney";

export async function getUserTimezone(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.get("user-timezone")?.value ?? DEFAULT_TIMEZONE;
}
