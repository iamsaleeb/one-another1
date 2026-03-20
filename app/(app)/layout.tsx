import { auth } from "@/auth";
import { BottomNav } from "@/components/bottom-nav";
import { TopNav } from "@/components/top-nav";
import { CreateEventFAB } from "@/components/create-event-fab";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isOrganiser = session?.user?.role === "ORGANISER";

  return (
    <div className="min-h-screen">
      <TopNav user={session?.user} />
      <main className="pb-16">{children}</main>
      <BottomNav />
      <CreateEventFAB isOrganiser={isOrganiser} />
    </div>
  );
}
