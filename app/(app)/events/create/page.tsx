import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { CreateEventForm } from "./_components/create-event-form";
import { UserRole } from "@prisma/client";

export default async function CreateEventPage() {
  const session = await auth();

  if (session?.user?.role !== UserRole.ORGANISER) {
    redirect("/");
  }

  const churches = await prisma.church.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">Create Event</h1>
      <div className="rounded-2xl bg-white shadow-card p-5">
        <CreateEventForm churches={churches} />
      </div>
    </div>
  );
}
