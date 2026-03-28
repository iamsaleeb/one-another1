import { Suspense } from "react";
import { EventCard } from "@/components/event-card";
import { getEvents, getPastEvents } from "@/lib/actions/data";
import { PageHeader } from "@/components/ui/page-header";

async function MyEventsContent() {
  const [upcomingEvents, pastEvents] = await Promise.all([
    getEvents(),
    getPastEvents(),
  ]);

  return (
    <div className="flex flex-col gap-6 px-4 py-2">
      {/* Upcoming */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">Upcoming</h2>
        {upcomingEvents.length > 0 ? (
          upcomingEvents.map((event) => (
            <EventCard key={event.id} event={{ ...event, badge: event.tag, seriesName: event.series?.name }} />
          ))
        ) : (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No upcoming events
          </p>
        )}
      </section>

      {/* Past */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">Past</h2>
        {pastEvents.length > 0 ? (
          pastEvents.map((event) => (
            <EventCard key={event.id} event={{ ...event, badge: event.tag, seriesName: event.series?.name }} />
          ))
        ) : (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No past events
          </p>
        )}
      </section>
    </div>
  );
}

export default function MyEventsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="My Events" description="Upcoming events" />
      <Suspense>
        <MyEventsContent />
      </Suspense>
    </div>
  );
}
