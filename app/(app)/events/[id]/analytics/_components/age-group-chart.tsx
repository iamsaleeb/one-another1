"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { AgeGroupDataPoint } from "@/lib/actions/analytics";

interface AgeGroupChartProps {
  data: AgeGroupDataPoint[];
}

const chartConfig = {
  count: {
    label: "Attendees",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

// Fixed order so unknown always appears last
const GROUP_ORDER = ["Under 18", "18–25", "26–35", "36–50", "51+", "Unknown"];

export function AgeGroupChart({ data }: AgeGroupChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        No attendee age data yet.
      </div>
    );
  }

  const sorted = [...data].sort(
    (a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group),
  );

  return (
    <ChartContainer config={chartConfig} className="h-48 w-full">
      <BarChart
        data={sorted}
        margin={{ left: -16, right: 4, top: 4, bottom: 0 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="group"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
          allowDecimals={false}
          width={32}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar
          dataKey="count"
          fill="var(--color-count)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
