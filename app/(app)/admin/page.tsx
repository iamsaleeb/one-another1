import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UserRole } from "@prisma/client";
import { PageHeader } from "@/components/ui/page-header";
import { getChurchesByAdmin, getOrganisersByChurch } from "@/lib/actions/data";
import { AdminChurchCard } from "./_components/admin-church-card";

export default async function AdminPage() {
  const session = await auth();

  if (session?.user?.role !== UserRole.ADMIN) {
    redirect("/");
  }

  const churches = await getChurchesByAdmin(session.user.id);
  const churchesWithOrganisers = await Promise.all(
    churches.map(async (church) => ({
      ...church,
      organisers: await getOrganisersByChurch(church.id),
    }))
  );

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Church Admin" />
      <div className="px-4 pb-6 flex flex-col gap-4">
        {churchesWithOrganisers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            You have not been assigned as admin for any church.
          </p>
        ) : (
          churchesWithOrganisers.map((church) => (
            <AdminChurchCard key={church.id} church={church} />
          ))
        )}
      </div>
    </div>
  );
}
