import "server-only";

import { prisma } from "@/lib/db";
import { parseEventMetadata } from "@/lib/types/event-metadata";
import { scheduleEventReminder, cancelEventReminder } from "@/lib/schedule-notification";
interface DalError { error: string }

export async function attendEvent(
  eventId: string,
  userId: string
): Promise<DalError | Record<string, never>> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, title: true, datetime: true, isDraft: true },
  });
  if (!event || event.isDraft) return { error: "Event not found." };

  await prisma.eventAttendee.create({
    data: { eventId, userId },
  });

  try {
    await scheduleEventReminder(userId, event);
  } catch (err) {
    console.error("Failed to schedule event reminder:", err);
  }

  return {};
}

export async function unattendEvent(
  eventId: string,
  userId: string
): Promise<DalError | Record<string, never>> {
  await prisma.eventAttendee.delete({
    where: { eventId_userId: { eventId, userId } },
  });

  try {
    await cancelEventReminder(userId, eventId);
  } catch (err) {
    console.error("Failed to cancel event reminder:", err);
  }

  return {};
}

export interface RegisterEventData {
  phone?: string;
  notes?: string;
  selectedDays?: string[];
}

export async function registerEvent(
  eventId: string,
  userId: string,
  data: RegisterEventData
): Promise<DalError | { success: true }> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      title: true,
      datetime: true,
      isDraft: true,
      metadata: true,
      _count: { select: { attendees: true } },
    },
  });

  if (!event || event.isDraft) return { error: "Event not found." };

  const eventMeta = parseEventMetadata(event.metadata);
  const { capacity } = eventMeta.registration;
  if (capacity != null && event._count.attendees >= capacity) {
    return { error: "Sorry, this event is fully booked." };
  }

  let validatedSelectedDays: string[] | undefined;
  if (eventMeta.camp?.allowPartialRegistration && eventMeta.camp.endDate) {
    const startDate = event.datetime.toISOString().slice(0, 10);
    const endDate = eventMeta.camp.endDate;
    const inRange = (d: string) => d >= startDate && d <= endDate;

    const days = data.selectedDays ?? [];
    const filtered = days.filter(inRange);
    if (filtered.length === 0) {
      return { error: "Please select at least one valid day to attend." };
    }
    validatedSelectedDays = filtered;
  }

  await prisma.eventAttendee.create({
    data: {
      eventId,
      userId,
      phone: data.phone,
      notes: data.notes,
      ...(validatedSelectedDays ? { metadata: { selectedDays: validatedSelectedDays } } : {}),
    },
  });

  try {
    await scheduleEventReminder(userId, {
      id: event.id,
      title: event.title,
      datetime: event.datetime,
    });
  } catch (err) {
    console.error("Failed to schedule event reminder after registration:", err);
  }

  return { success: true };
}
