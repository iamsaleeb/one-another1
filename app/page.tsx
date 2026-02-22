import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-5 pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Home</h1>
      </header>

      {/* Body */}
      <div className="flex flex-col gap-6 px-4 py-2">
        <section className="flex flex-col gap-3">
          {[
            {
              datetime: "MON, 10 MAY | 7:30 PM",
              title: "The Cross of Forgiveness",
              location: "St Mary Church",
              host: "Fr Dan Fanous",
              tag: "Bible Study",
            },
            {
              datetime: "FRI, 14 MAY | 6:30 PM",
              title: "Youth Fellowship",
              location: "St George Church",
              host: "Fr Mark Mikhail",
              tag: "Meeting",
            },
            {
              datetime: "SAT, 15 MAY | 9:00 AM",
              title: "Community Outreach",
              location: "Downtown Community Center",
              host: "Deacon Peter",
              tag: "Outreach",
            },
          ].map((item) => (
            <Card key={item.title} className="rounded-2xl border-0 bg-white py-0 shadow-[4px_4px_10px_0px_#E8E8E866]">
              <CardContent className="flex items-start justify-between p-4">
                <div className="flex flex-col gap-0.5">
                  <p className="text-xs text-muted-foreground font-medium">{item.datetime}</p>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.location}</p>
                  <p className="text-xs text-muted-foreground">{item.host}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary whitespace-nowrap ml-3">
                  {item.tag}
                </span>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </div>
  );
}
