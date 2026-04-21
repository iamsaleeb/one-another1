'use client';

import { useEffect } from 'react';
import { Bell } from 'lucide-react';
import { NotificationItem } from '@/components/notifications/notification-item';
import { markReadAction } from '@/lib/actions/notifications';
import type { InboxNotification } from '@/lib/notifications/inbox';

export function NotificationList({ notifications }: { notifications: InboxNotification[] }) {
  const hasUnread = notifications.some((n) => n.readAt === null);

  useEffect(() => {
    if (hasUnread) {
      markReadAction().catch((err) =>
        console.error('[NotificationList] markReadAction failed:', err)
      );
    }
  }, [hasUnread]);

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <Bell className="size-10 text-muted-foreground/40" />
        <p className="text-base font-semibold">No notifications yet</p>
        <p className="text-sm text-muted-foreground">You&apos;re all caught up</p>
      </div>
    );
  }

  return (
    <div className="px-4">
      <div className="rounded-2xl bg-white shadow-card divide-y divide-border overflow-hidden">
        {notifications.map((n) => (
          <NotificationItem key={n.id} notification={n} />
        ))}
      </div>
    </div>
  );
}
