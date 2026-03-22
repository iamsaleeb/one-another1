import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { UserRole } from "@prisma/client";
import { getSeriesById, getChurches } from "@/lib/actions/data";
import { PageHeader } from "@/components/ui/page-header";
import { EditSeriesForm } from "./_components/edit-series-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditSeriesPage({ params }: Props) {
  const { id } = await params;
  const [series, session, churches] = await Promise.all([
    getSeriesById(id),
    auth(),
    getChurches(),
  ]);

  if (session?.user?.role !== UserRole.ORGANISER) redirect("/");
  if (!series) notFound();

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Edit Series" />
      <div className="px-4 py-4">
        <EditSeriesForm
          series={{
            id: series.id,
            name: series.name,
            description: series.description,
            cadence: series.cadence,
            location: series.location,
            host: series.host,
            tag: series.tag,
            churchId: series.churchId,
          }}
          churches={churches}
        />
      </div>
    </div>
  );
}
