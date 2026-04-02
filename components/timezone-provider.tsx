"use client";

import { useEffect } from "react";

export function TimezoneProvider() {
  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    document.cookie = `user-timezone=${timezone}; path=/; max-age=31536000; SameSite=Lax`;
  }, []);
  return null;
}
