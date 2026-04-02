import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BarChart2, Eye, Percent, UserCheck, Users } from "lucide-react";
import { auth } from "@/auth";
import { getEventById } from "@/lib/actions/data";
import { getEventAnalytics } from "@/lib/actions/analytics";
import { canManageChurch } from "@/lib/permissions";
import { RegistrationsChart } from "./_components/registrations-chart";
import { AgeGroupChart } from "./_components/age-group-chart";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) return { title: "Not Found" };
  return { title: `Analytics — ${event.title}` };
}

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
}

function StatCard({ label, value, sub, icon }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-white shadow-card p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {label}
        </p>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export default async function EventAnalyticsPage({ params }: Props) {
  const { id } = await params;

  const [event, session] = await Promise.all([getEventById(id), auth()]);

  if (!event) notFound();

  const canManage = await canManageChurch(
    session?.user?.id,
    session?.user?.role,
    event.churchId,
  );
  if (!canManage) notFound();

  const analytics = await getEventAnalytics(id);

  const conversionDisplay =
    analytics.totalViews === 0
      ? "—"
      : `${analytics.conversionRate.toFixed(1)}%`;

  return (
    <div className="bg-background min-h-screen pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4">
        <Link
          href={`/events/${id}`}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Back to event"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <BarChart2 className="size-5 text-primary" />
            Analytics
          </h1>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {event.title}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-5 px-4">
        {/* Stat cards grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Total Views"
            value={analytics.totalViews}
            sub="All page loads"
            icon={<Eye className="size-4" />}
          />
          <StatCard
            label="Unique Viewers"
            value={analytics.uniqueViews}
            sub="Signed-in users"
            icon={<Users className="size-4" />}
          />
          <StatCard
            label="Registrations"
            value={analytics.totalRegistrations}
            sub={
              event.capacity
                ? `of ${event.capacity} capacity`
                : "Total sign-ups"
            }
            icon={<UserCheck className="size-4" />}
          />
          <StatCard
            label="Conversion"
            value={conversionDisplay}
            sub="Views → registrations"
            icon={<Percent className="size-4" />}
          />
        </div>

        {/* Registrations over time */}
        <div className="rounded-2xl bg-white shadow-card p-4 flex flex-col gap-3">
          <div>
            <h2 className="text-sm font-semibold">Registrations Over Time</h2>
            <p className="text-xs text-muted-foreground">
              Cumulative sign-ups by day
            </p>
          </div>
          <RegistrationsChart data={analytics.registrationsChart} />
        </div>

        {/* Age group distribution */}
        <div className="rounded-2xl bg-white shadow-card p-4 flex flex-col gap-3">
          <div>
            <h2 className="text-sm font-semibold">Attendee Age Groups</h2>
            <p className="text-xs text-muted-foreground">
              Based on date of birth provided at sign-up
            </p>
          </div>
          <AgeGroupChart data={analytics.ageGroupsChart} />
        </div>
      </div>
    </div>
  );
}
