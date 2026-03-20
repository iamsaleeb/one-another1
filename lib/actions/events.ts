"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createEventSchema } from "@/lib/validations/event";

export type CreateEventState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createEventAction(
  _prevState: CreateEventState,
  formData: FormData
): Promise<CreateEventState> {
  const raw = {
    title: formData.get("title"),
    date: formData.get("date"),
    time: formData.get("time"),
    location: formData.get("location"),
    host: formData.get("host"),
    tag: formData.get("tag"),
    description: formData.get("description"),
    churchId: formData.get("churchId") || undefined,
  };

  const parsed = createEventSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { title, date, time, location, host, tag, description, churchId } =
    parsed.data;

  const datetime = `${date}T${time}`;

  await prisma.event.create({
    data: {
      title,
      datetime,
      location,
      host,
      tag,
      description,
      isPast: false,
      ...(churchId ? { churchId } : {}),
    },
  });

  redirect("/my-events");
}
