import type { Metadata } from "next";
import { Suspense } from "react";
import { auth } from "@/auth";
import { signOutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { LogOut, Mail, User } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { InfoField } from "@/components/ui/info-field";
import { HeroBanner } from "@/components/ui/hero-banner";

export const metadata: Metadata = {
  title: "Profile — One Another",
};

async function ProfilePageContent() {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="bg-background min-h-screen">
      <HeroBanner size="sm" />

      <div className="px-4">
        {/* Avatar overlapping banner */}
        <div className="-mt-12 mb-4">
          <div className="flex items-center justify-center w-24 h-24 rounded-2xl bg-primary text-primary-foreground shadow-md text-2xl font-bold">
            {getInitials(user?.name, user?.email)}
          </div>
        </div>

        {/* Name & email */}
        <div className="mb-6">
          <h1 className="text-xl font-bold">{user?.name ?? "User"}</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>

        {/* Info card */}
        <div className="rounded-2xl bg-white shadow-card divide-y divide-border overflow-hidden mb-6">
          <div className="px-4 py-3">
            <InfoField icon={User} label="Name" iconClassName="w-3.5 h-3.5 text-primary">
              {user?.name ?? "—"}
            </InfoField>
          </div>
          <div className="px-4 py-3">
            <InfoField icon={Mail} label="Email" iconClassName="w-3.5 h-3.5 text-primary">
              {user?.email ?? "—"}
            </InfoField>
          </div>
        </div>

        {/* Sign out */}
        <form action={signOutAction}>
          <Button
            type="submit"
            variant="outline"
            className="w-full h-11 rounded-xl font-semibold gap-2 text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense>
      <ProfilePageContent />
    </Suspense>
  );
}
