import { cacheTag, cacheLife } from "next/cache";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { CacheTag } from "@/lib/cache-tags";
import type { Prisma } from "@prisma/client";
import { startOfDay, endOfDay, addDays, getDay } from "date-fns";
import type { WhenFilter, TypeFilter } from "@/types/search";

export interface SearchFilters {
  query: string;
  type?: TypeFilter;
  category?: string;
  when?: WhenFilter;
}

function getDateRange(when: WhenFilter): { gte: Date; lte: Date } {
  const now = new Date();
  if (when === "today") {
    return { gte: startOfDay(now), lte: endOfDay(now) };
  }
  if (when === "tomorrow") {
    const tomorrow = addDays(now, 1);
    return { gte: startOfDay(tomorrow), lte: endOfDay(tomorrow) };
  }
  // weekend: next Saturday + Sunday
  const day = getDay(now); // 0=Sun, 6=Sat
  let daysUntilSat: number;
  if (day === 6) daysUntilSat = 0;
  else if (day === 0) daysUntilSat = 6;
  else daysUntilSat = 6 - day;
  const saturday = addDays(now, daysUntilSat);
  const sunday = addDays(saturday, 1);
  return { gte: startOfDay(saturday), lte: endOfDay(sunday) };
}

export async function getEvents() {
  "use cache";
  cacheLife("hours");
  cacheTag(CacheTag.events);
  return prisma.event.findMany({
    where: { isPast: false },
    orderBy: { createdAt: "asc" },
    include: { series: { select: { name: true } } },
  });
}

export async function getPastEvents() {
  "use cache";
  cacheLife("hours");
  cacheTag(CacheTag.events);
  return prisma.event.findMany({
    where: { isPast: true },
    orderBy: { createdAt: "asc" },
    include: { series: { select: { name: true } } },
  });
}

export async function getEventById(id: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(CacheTag.events, CacheTag.event(id));
  return prisma.event.findUnique({
    where: { id },
    include: {
      series: { select: { id: true, name: true } },
      attendees: { select: { userId: true } },
      _count: { select: { attendees: true } },
    },
  });
}

export async function getChurchesByAdmin(userId: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(CacheTag.userChurches(userId));
  const assignments = await prisma.churchAdmin.findMany({
    where: { userId },
    select: { church: { select: { id: true, name: true } } },
    orderBy: { church: { name: "asc" } },
  });
  return assignments.map((a) => a.church);
}

export async function getOrganisersByChurch(churchId: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(CacheTag.churchOrganisers(churchId));
  const assignments = await prisma.churchOrganiser.findMany({
    where: { churchId },
    select: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { user: { name: "asc" } },
  });
  return assignments.map((a) => a.user);
}

export async function getChurchesByManager(userId: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(CacheTag.userChurches(userId));
  const [organiserRows, adminRows] = await Promise.all([
    prisma.churchOrganiser.findMany({
      where: { userId },
      select: { church: { select: { id: true, name: true } } },
    }),
    prisma.churchAdmin.findMany({
      where: { userId },
      select: { church: { select: { id: true, name: true } } },
    }),
  ]);
  const seen = new Set<string>();
  const churches: Array<{ id: string; name: string }> = [];
  for (const row of [...organiserRows, ...adminRows]) {
    if (!seen.has(row.church.id)) {
      seen.add(row.church.id);
      churches.push(row.church);
    }
  }
  return churches.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getChurchesByOrganiser(userId: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(CacheTag.userChurches(userId));
  const assignments = await prisma.churchOrganiser.findMany({
    where: { userId },
    select: { church: { select: { id: true, name: true } } },
    orderBy: { church: { name: "asc" } },
  });
  return assignments.map((a) => a.church);
}

export async function getChurches() {
  "use cache";
  cacheLife("hours");
  cacheTag(CacheTag.churches);
  return prisma.church.findMany({
    include: {
      serviceTimes: true,
      events: {
        where: { isPast: false },
        select: { id: true, title: true, datetime: true, location: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getChurchById(id: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(CacheTag.churches, CacheTag.church(id));
  return prisma.church.findUnique({
    where: { id },
    include: {
      serviceTimes: true,
      events: { where: { isPast: false } },
      series: {
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { events: { where: { isPast: false } } } },
        },
      },
      followers: { select: { userId: true } },
      _count: { select: { followers: true } },
    },
  });
}

// Dynamic search — per-request deduplication only (varies by search params)
export const searchEventsAndChurches = cache(async function searchEventsAndChurches(filters: SearchFilters) {
  const { query, type = "all", category, when } = filters;
  const hasFilters = !!(query || category || when);

  if (!hasFilters) return { events: [], churches: [] };

  const shouldFetchEvents = type === "all" || type === "events";
  const shouldFetchChurches = type === "all" || type === "churches";

  // Build event where clause
  const eventWhere: Prisma.EventWhereInput = { isPast: false };
  if (query) {
    eventWhere.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { location: { contains: query, mode: "insensitive" } },
      { host: { contains: query, mode: "insensitive" } },
      { tag: { contains: query, mode: "insensitive" } },
    ];
  }
  if (category) {
    eventWhere.tag = { equals: category, mode: "insensitive" };
  }
  if (when) {
    const { gte, lte } = getDateRange(when);
    eventWhere.datetime = { gte, lte };
  }

  // Build church where clause
  const churchWhere: Prisma.ChurchWhereInput = {};
  if (query) {
    churchWhere.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { denomination: { contains: query, mode: "insensitive" } },
      { address: { contains: query, mode: "insensitive" } },
    ];
  }

  const [events, churches] = await Promise.all([
    shouldFetchEvents
      ? prisma.event.findMany({
          where: eventWhere,
          include: { series: { select: { name: true } } },
          orderBy: { datetime: "asc" },
        })
      : Promise.resolve([]),
    shouldFetchChurches && (query || type === "churches")
      ? prisma.church.findMany({ where: churchWhere })
      : Promise.resolve([]),
  ]);

  return { events, churches };
});

export async function getSeries() {
  "use cache";
  cacheLife("hours");
  cacheTag(CacheTag.series);
  return prisma.series.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { events: { where: { isPast: false } } },
      },
    },
  });
}

export async function getSeriesById(id: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(CacheTag.series, CacheTag.seriesItem(id));
  return prisma.series.findUnique({
    where: { id },
    include: {
      church: { select: { id: true, name: true } },
      events: {
        where: { isPast: false },
        orderBy: { datetime: "asc" },
      },
      followers: { select: { userId: true } },
      _count: { select: { followers: true } },
    },
  });
}

export async function getSeriesByChurchId(churchId: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(CacheTag.series, CacheTag.churchSeries(churchId));
  return prisma.series.findMany({
    where: { churchId },
    include: {
      _count: {
        select: { events: { where: { isPast: false } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getEventsByCreator(userId: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(CacheTag.events, CacheTag.userEvents(userId));
  return prisma.event.findMany({
    where: { isPast: false, createdById: userId },
    orderBy: { createdAt: "asc" },
    include: {
      series: { select: { name: true } },
      createdBy: { select: { name: true } },
    },
  });
}

export async function getSeriesByCreator(userId: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(CacheTag.series, CacheTag.userSeries(userId));
  return prisma.series.findMany({
    where: { createdById: userId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { events: { where: { isPast: false } } } },
      createdBy: { select: { name: true } },
    },
  });
}

export async function getEventsNotByCreator(userId: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(CacheTag.events);
  return prisma.event.findMany({
    where: {
      isPast: false,
      OR: [{ createdById: { not: userId } }, { createdById: null }],
    },
    orderBy: { createdAt: "asc" },
    include: {
      series: { select: { name: true } },
      createdBy: { select: { name: true } },
    },
  });
}

export async function getEventAttendees(eventId: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag(CacheTag.eventAttendees(eventId));
  return prisma.eventAttendee.findMany({
    where: { eventId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });
}

export async function getSeriesNotByCreator(userId: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(CacheTag.series);
  return prisma.series.findMany({
    where: {
      OR: [{ createdById: { not: userId } }, { createdById: null }],
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { events: { where: { isPast: false } } } },
      createdBy: { select: { name: true } },
    },
  });
}
