"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { RegistrationDataPoint } from "@/lib/actions/analytics";
import { format, parseISO } from "date-fns";

interface RegistrationsChartProps {
  data: RegistrationDataPoint[];
}

const chartConfig = {
  registrations: {
    label: "Registrations",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function RegistrationsChart({ data }: RegistrationsChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        No registration data yet.
      </div>
    );
  }

  const formatted = data.map((d) => ({
    ...d,
    label: format(parseISO(d.date), "d MMM"),
  }));

  return (
    <ChartContainer config={chartConfig} className="h-48 w-full">
      <AreaChart data={formatted} margin={{ left: -16, right: 4, top: 4, bottom: 0 }}>
        <defs>
          <linearGradient id="regGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-registrations)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--color-registrations)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
          interval="preserveStartEnd"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
          allowDecimals={false}
          width={32}
        />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <Area
          type="monotone"
          dataKey="registrations"
          stroke="var(--color-registrations)"
          strokeWidth={2}
          fill="url(#regGradient)"
          dot={false}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ChartContainer>
  );
}
