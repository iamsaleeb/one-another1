"use server";

import { cache } from "react";
import { prisma } from "@/lib/db";
import { startOfDay } from "date-fns";

/**
 * Records a view for an event.
 * For authenticated users, only records one view per user per day.
 * For anonymous users, always records.
 */
export async function recordEventView(
  eventId: string,
  userId?: string | null,
  source?: string | null,
) {
  try {
    if (userId) {
      const today = startOfDay(new Date());
      const existing = await prisma.eventView.findFirst({
        where: { eventId, userId, viewedAt: { gte: today } },
        select: { id: true },
      });
      if (existing) return;
    }

    await prisma.eventView.create({
      data: {
        eventId,
        userId: userId ?? null,
        source: source ?? null,
      },
    });
  } catch {
    // Non-critical — never let view tracking break the page
  }
}

export interface RegistrationDataPoint {
  date: string;
  registrations: number;
}

export interface AgeGroupDataPoint {
  group: string;
  count: number;
}

export interface EventAnalytics {
  totalViews: number;
  uniqueViews: number;
  totalRegistrations: number;
  conversionRate: number;
  registrationsChart: RegistrationDataPoint[];
  ageGroupsChart: AgeGroupDataPoint[];
}

export const getEventAnalytics = cache(async function getEventAnalytics(
  eventId: string,
): Promise<EventAnalytics> {
  const [views, attendees] = await Promise.all([
    prisma.eventView.findMany({
      where: { eventId },
      select: { userId: true, viewedAt: true },
      orderBy: { viewedAt: "asc" },
    }),
    prisma.eventAttendee.findMany({
      where: { eventId },
      include: {
        user: { select: { dateOfBirth: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // Total views
  const totalViews = views.length;

  // Unique views: count of distinct authenticated userIds
  const uniqueUserIds = new Set(
    views.filter((v) => v.userId).map((v) => v.userId as string),
  );
  const uniqueViews = uniqueUserIds.size;

  // Registrations
  const totalRegistrations = attendees.length;

  // Conversion rate: registrations / total views * 100
  const conversionRate =
    totalViews > 0
      ? Math.min(100, (totalRegistrations / totalViews) * 100)
      : 0;

  // Registrations over time, grouped by calendar day
  const regByDay: Record<string, number> = {};
  for (const att of attendees) {
    const day = att.createdAt.toISOString().split("T")[0];
    regByDay[day] = (regByDay[day] ?? 0) + 1;
  }
  const registrationsChart: RegistrationDataPoint[] = Object.entries(regByDay)
    .map(([date, registrations]) => ({ date, registrations }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Age group distribution of attendees
  const now = new Date();
  const ageGroups: Record<string, number> = {
    "Under 18": 0,
    "18–25": 0,
    "26–35": 0,
    "36–50": 0,
    "51+": 0,
    Unknown: 0,
  };

  for (const att of attendees) {
    if (!att.user.dateOfBirth) {
      ageGroups["Unknown"]++;
      continue;
    }
    const ageMsec = now.getTime() - new Date(att.user.dateOfBirth).getTime();
    const age = Math.floor(ageMsec / (365.25 * 24 * 60 * 60 * 1000));
    if (age < 18) ageGroups["Under 18"]++;
    else if (age <= 25) ageGroups["18–25"]++;
    else if (age <= 35) ageGroups["26–35"]++;
    else if (age <= 50) ageGroups["36–50"]++;
    else ageGroups["51+"]++;
  }

  const ageGroupsChart: AgeGroupDataPoint[] = Object.entries(ageGroups)
    .filter(([, count]) => count > 0)
    .map(([group, count]) => ({ group, count }));

  return {
    totalViews,
    uniqueViews,
    totalRegistrations,
    conversionRate,
    registrationsChart,
    ageGroupsChart,
  };
});
