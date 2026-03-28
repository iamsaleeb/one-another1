import { Suspense } from "react";
import { auth } from "@/auth";
import { BottomNav } from "@/components/bottom-nav";
import { TopNav } from "@/components/top-nav";
import { CreateEventFAB } from "@/components/create-event-fab";
import { UserRole } from "@prisma/client";

async function NavShell() {
  const session = await auth();
  const isOrganiser = session?.user?.role === UserRole.ORGANISER;
  const isAdmin = session?.user?.role === UserRole.ADMIN;
  return (
    <>
      <TopNav user={session?.user} />
      <BottomNav isOrganiser={isOrganiser} isAdmin={isAdmin} />
      <CreateEventFAB isOrganiser={isOrganiser || isAdmin} />
    </>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Suspense>
        <NavShell />
      </Suspense>
      <main className="pb-nav">{children}</main>
    </div>
  );
}
