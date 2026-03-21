import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";
import { CreateSeriesForm } from "./_components/create-series-form";

export default async function CreateSeriesPage() {
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
      <h1 className="mb-6 text-2xl font-bold">Create Series</h1>
      <div className="rounded-2xl bg-white shadow-card p-5">
        <CreateSeriesForm churches={churches} />
      </div>
    </div>
  );
}
