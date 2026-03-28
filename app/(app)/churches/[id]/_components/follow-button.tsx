"use client";

import { useOptimistic, useTransition } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { followChurchAction, unfollowChurchAction } from "@/lib/actions/churches";

interface FollowButtonProps {
  churchId: string;
  isFollowing: boolean;
  followerCount: number;
}

export function FollowButton({ churchId, isFollowing, followerCount }: FollowButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticFollowing, setOptimisticFollowing] = useOptimistic(isFollowing);

  const displayCount = optimisticFollowing !== isFollowing
    ? optimisticFollowing ? followerCount + 1 : followerCount - 1
    : followerCount;

  function handleClick() {
    startTransition(async () => {
      setOptimisticFollowing(!optimisticFollowing);
      if (optimisticFollowing) {
        await unfollowChurchAction(churchId);
      } else {
        await followChurchAction(churchId);
      }
    });
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        onClick={handleClick}
        disabled={isPending}
        variant={optimisticFollowing ? "outline" : "default"}
        className={optimisticFollowing ? "gap-1.5" : ""}
      >
        {optimisticFollowing && <Check className="size-4" />}
        {optimisticFollowing ? "Following" : "Follow"}
      </Button>
      <span className="text-xs text-muted-foreground">
        {displayCount} {displayCount === 1 ? "follower" : "followers"}
      </span>
    </div>
  );
}
