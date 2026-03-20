import Link from "next/link";
import { notFound } from "next/navigation";
import { Globe, MapPin, Facebook, Share2, CalendarDays, ChevronDown, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getChurchById } from "@/lib/actions/data";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const church = await getChurchById(id);
  return { title: church ? `${church.name} — One Another` : "Church Not Found" };
}

export default async function ChurchDetailPage({ params }: Props) {
  const { id } = await params;
  const church = await getChurchById(id);

  if (!church) notFound();

  const upcomingEvents = church.events;

  // Group service times by day, preserving insertion order
  const servicesByDay = church.serviceTimes.reduce<
    Record<string, typeof church.serviceTimes>
  >((acc, service) => {
    if (!acc[service.day]) acc[service.day] = [];
    acc[service.day].push(service);
    return acc;
  }, {});

  const SHOW_PER_DAY = 2;

  return (
    <div className="bg-muted/20 min-h-screen pb-8">
      {/* Church Info Card */}
      <div className="px-4 pt-5 pb-3">
        <Card className="rounded-2xl border-0 shadow-none overflow-hidden" style={{ backgroundColor: "#F3614D0D" }}>
          <CardContent className="flex flex-col items-center gap-4 pt-6 pb-5 px-5">
            {/* Circular Avatar */}
            <Avatar className="size-24 ring-4 ring-primary/10">
              <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                {church.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            {/* Church Name */}
            <h1 className="text-xl font-bold text-primary text-center leading-snug px-2">
              {church.name}
            </h1>

            {/* Icon Link Buttons */}
            <div className="flex items-center gap-5">
              <a
                href={`https://${church.website}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Website"
              >
                <div className="flex items-center justify-center w-11 h-11 rounded-full border-2 border-border hover:border-primary transition-colors">
                  <Globe className="w-5 h-5 text-foreground" />
                </div>
              </a>
              <a
                href={`https://maps.google.com?q=${encodeURIComponent(church.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Location"
              >
                <div className="flex items-center justify-center w-11 h-11 rounded-full border-2 border-border hover:border-primary transition-colors">
                  <MapPin className="w-5 h-5 text-foreground" />
                </div>
              </a>
              <div className="flex items-center justify-center w-11 h-11 rounded-full border-2 border-border">
                <Facebook className="w-5 h-5 text-foreground" />
              </div>
            </div>

            {/* Follow Alert */}
            <Alert className="border-primary/20 bg-primary/5 text-primary">
              <Bell />
              <AlertDescription className="text-primary/80">
                Following this church will notify you about upcoming events and services.
              </AlertDescription>
            </Alert>

            {/* Follow Button */}
            <Button
              variant="outline"
            >
              Follow
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Service Schedule */}
      <section className="px-4 mb-5">
        <h2 className="text-lg font-bold mb-3">Service Schedule</h2>

        {Object.entries(servicesByDay).map(([day, services]) => (
          <div key={day} className="mb-4">
            <p className="text-sm font-semibold text-foreground mb-2">{day}</p>
            <div className="space-y-2">
              {services.slice(0, SHOW_PER_DAY).map((service) => (
                <Card key={service.id} className="rounded-xl border-0 shadow-none">
                  <CardContent className="px-4 py-3">
                    <p className="text-sm font-semibold text-primary">{service.time}</p>
                    <p className="text-sm font-bold text-foreground mt-0.5">{service.type}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        <button className="flex items-center gap-1 text-sm font-semibold text-primary mt-1">
          See More <ChevronDown className="w-4 h-4" />
        </button>
      </section>

      {/* Upcoming Events */}
      <section className="px-4">
        <h2 className="text-lg font-bold mb-3">Upcoming Events</h2>

        {upcomingEvents.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10">
            <CalendarDays className="w-8 h-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No upcoming events</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <Card className="rounded-xl border-0 shadow-none">
                  <CardContent className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                        {event.datetime}
                      </p>
                      <button
                        onClick={(e) => e.preventDefault()}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="Share"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-base font-bold leading-snug">{event.title}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
