"use client";

import { format } from "date-fns";
import { tz } from "@date-fns/tz";

interface LocalTimeProps {
  isoString: string;
  formatStr: string;
  className?: string;
  uppercase?: boolean;
}

export function LocalTime({ isoString, formatStr, className, uppercase }: LocalTimeProps) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const formatted = format(new Date(isoString), formatStr, { in: tz(timezone) });
  return <span className={className}>{uppercase ? formatted.toUpperCase() : formatted}</span>;
}
