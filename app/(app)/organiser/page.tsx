import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UserRole } from "@prisma/client";
import { PageHeader } from "@/components/ui/page-header";
import {
  getEventsByCreator,
  getSeriesByCreator,
  getEventsNotByCreator,
  getSeriesNotByCreator,
} from "@/lib/actions/data";
import { OrganiserTabs } from "./_components/organiser-tabs";

async function OrganiserPageContent() {
  const session = await auth();

  if (session?.user?.role !== UserRole.ORGANISER && session?.user?.role !== UserRole.ADMIN) {
    redirect("/");
  }

  const userId = session.user.id;

  const [myEvents, mySeries, communityEvents, communitySeries] = await Promise.all([
    getEventsByCreator(userId),
    getSeriesByCreator(userId),
    getEventsNotByCreator(userId),
    getSeriesNotByCreator(userId),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Organiser Tools" />
      <OrganiserTabs
        myEvents={myEvents}
        mySeries={mySeries}
        communityEvents={communityEvents}
        communitySeries={communitySeries}
      />
    </div>
  );
}

export default function OrganiserPage() {
  return (
    <Suspense>
      <OrganiserPageContent />
    </Suspense>
  );
}
