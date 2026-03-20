import { Building2, Calendar, Globe, MapPin, Phone, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { getChurchById } from "@/lib/actions/data";

type ChurchWithDetails = NonNullable<Awaited<ReturnType<typeof getChurchById>>>;

interface AboutTabProps {
  church: ChurchWithDetails;
}

export function AboutTab({ church }: AboutTabProps) {
  return (
    <div className="space-y-5">
      {/* Description */}
      <section>
        <h2 className="text-lg font-bold mb-2">About</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{church.description}</p>
      </section>

      <Separator />

      {/* Details */}
      <section>
        <h2 className="text-lg font-bold mb-3">Details</h2>
        <Card className="rounded-xl border-0 shadow-none">
          <CardContent className="px-4 py-3 space-y-4">
            <div className="flex items-start gap-3">
              <Building2 className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Denomination</p>
                <p className="text-sm font-medium">{church.denomination}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Founded</p>
                <p className="text-sm font-medium">{church.founded}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Members</p>
                <p className="text-sm font-medium">{church.members.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Address</p>
                <p className="text-sm font-medium">{church.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">{church.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Globe className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Website</p>
                <a
                  href={`https://${church.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {church.website}
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
