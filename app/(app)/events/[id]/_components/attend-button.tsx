"use client";

import { useOptimistic, useTransition } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { attendEventAction, unattendEventAction } from "@/lib/actions/events";

interface AttendButtonProps {
  eventId: string;
  isAttending: boolean;
}

export function AttendButton({ eventId, isAttending }: AttendButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticAttending, setOptimisticAttending] = useOptimistic(isAttending);

  function handleClick() {
    startTransition(async () => {
      setOptimisticAttending(!optimisticAttending);
      if (optimisticAttending) {
        await unattendEventAction(eventId);
      } else {
        await attendEventAction(eventId);
      }
    });
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isPending}
      variant={optimisticAttending ? "outline" : "default"}
      className={optimisticAttending ? "gap-1.5" : ""}
    >
      {optimisticAttending && <Check className="size-4" />}
      {optimisticAttending ? "Attending" : "Attend"}
    </Button>
  );
}
