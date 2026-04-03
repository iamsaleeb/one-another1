export interface CampAgendaItem {
  id: string;
  date: string;        // ISO date YYYY-MM-DD
  time?: string;       // HH:mm, optional
  title: string;
  description?: string;
}

export interface EventMetadata {
  registration: {
    capacity: number | null;
    collectPhone: boolean;
    collectNotes: boolean;
  };
  camp?: {
    endDate: string;                   // ISO date YYYY-MM-DD
    allowPartialRegistration: boolean;
    agenda: CampAgendaItem[];
  };
}

export interface EventAttendeeMetadata {
  selectedDays?: string[]; // ISO dates the attendee will attend
}

export function parseEventMetadata(raw: unknown): EventMetadata {
  const obj =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};
  const reg =
    obj.registration &&
    typeof obj.registration === "object" &&
    !Array.isArray(obj.registration)
      ? (obj.registration as Record<string, unknown>)
      : {};

  let camp: EventMetadata["camp"] | undefined;
  if (
    obj.camp &&
    typeof obj.camp === "object" &&
    !Array.isArray(obj.camp)
  ) {
    const c = obj.camp as Record<string, unknown>;
    camp = {
      endDate: typeof c.endDate === "string" ? c.endDate : "",
      allowPartialRegistration:
        typeof c.allowPartialRegistration === "boolean"
          ? c.allowPartialRegistration
          : false,
      agenda: Array.isArray(c.agenda)
        ? (c.agenda as unknown[]).filter(
            (item): item is CampAgendaItem => {
              if (item === null || typeof item !== "object") return false;
              const i = item as Record<string, unknown>;
              return (
                typeof i.id === "string" &&
                typeof i.date === "string" &&
                typeof i.title === "string" &&
                (i.time === undefined || typeof i.time === "string") &&
                (i.description === undefined || typeof i.description === "string")
              );
            }
          )
        : [],
    };
  }

  return {
    registration: {
      capacity: typeof reg.capacity === "number" ? reg.capacity : null,
      collectPhone:
        typeof reg.collectPhone === "boolean" ? reg.collectPhone : false,
      collectNotes:
        typeof reg.collectNotes === "boolean" ? reg.collectNotes : false,
    },
    ...(camp ? { camp } : {}),
  };
}

export function parseEventAttendeeMetadata(raw: unknown): EventAttendeeMetadata {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const obj = raw as Record<string, unknown>;
  return {
    selectedDays: Array.isArray(obj.selectedDays)
      ? (obj.selectedDays as unknown[]).filter((d): d is string => typeof d === "string")
      : undefined,
  };
}
