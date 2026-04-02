import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { UserRole } from "@prisma/client";
import { format } from "date-fns";
import { tz } from "@date-fns/tz";
import { getEventById, getChurchesByManager } from "@/lib/actions/data";
import { getUserTimezone } from "@/lib/timezone";
import { PageHeader } from "@/components/ui/page-header";
import { EditEventForm } from "./_components/edit-event-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: Props) {
  const { id } = await params;
  const [event, session] = await Promise.all([getEventById(id), auth()]);

  if (session?.user?.role !== UserRole.ORGANISER && session?.user?.role !== UserRole.ADMIN) redirect("/");
  if (!event) notFound();

  const [churches, timezone] = await Promise.all([
    getChurchesByManager(session.user.id),
    getUserTimezone(),
  ]);
  if (!churches.some((c) => c.id === event.churchId)) notFound();

  const tzOpt = { in: tz(timezone) };
  const date = format(event.datetime, "yyyy-MM-dd", tzOpt);
  const time = format(event.datetime, "HH:mm", tzOpt);

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Edit Event" />
      <div className="px-4 pb-6">
        <div className="rounded-2xl bg-white shadow-card p-5">
          <EditEventForm
          event={{
            id: event.id,
            title: event.title,
            date,
            time,
            location: event.location,
            host: event.host,
            tag: event.tag,
            description: event.description,
            churchId: event.churchId,
            seriesId: event.seriesId,
            seriesName: event.series?.name,
            requiresRegistration: event.requiresRegistration,
            capacity: event.capacity,
            collectPhone: event.collectPhone,
            collectNotes: event.collectNotes,
            price: event.price,
            isDraft: event.isDraft,
            photoUrl: event.photoUrl,
          }}
          churches={churches}
        />
        </div>
      </div>
    </div>
  );
}
