import { z } from "zod";

export interface CampAgendaItem {
  id: string;
  date: string;
  time?: string;
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
    endDate: string;
    allowPartialRegistration: boolean;
    agenda: CampAgendaItem[];
  };
}

export interface EventAttendeeMetadata {
  selectedDays?: string[];
}

const registrationDefault = { capacity: null, collectPhone: false, collectNotes: false };

const eventMetadataSchema = z
  .object({
    registration: z
      .object({
        capacity: z.number().nullable().catch(null),
        collectPhone: z.boolean().catch(false),
        collectNotes: z.boolean().catch(false),
      })
      .catch(registrationDefault),
    camp: z
      .object({
        endDate: z.string(),
        allowPartialRegistration: z.boolean().default(false),
        agenda: z
          .array(
            z.object({
              id: z.string(),
              date: z.string(),
              time: z.string().optional(),
              title: z.string(),
              description: z.string().optional(),
            })
          )
          .default([]),
      })
      .optional()
      .catch(undefined),
  })
  .catch({ registration: registrationDefault });

export function parseEventMetadata(raw: unknown): EventMetadata {
  return eventMetadataSchema.parse(raw);
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
