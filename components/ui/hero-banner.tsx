import { cn } from "@/lib/utils";

interface HeroBannerProps {
  size?: "sm" | "md";
  className?: string;
}

export function HeroBanner({ size = "md", className }: HeroBannerProps) {
  const isSm = size === "sm";
  return (
    <div
      className={cn(
        "relative w-full bg-gradient-to-br from-primary/80 via-primary to-primary/60",
        isSm ? "h-40" : "h-52",
        className
      )}
    >
      <div
        className={cn(
          "absolute bottom-0 right-0 rounded-full bg-white/10",
          isSm ? "w-32 h-32" : "w-40 h-40"
        )}
      />
      <div
        className={cn(
          "absolute rounded-full bg-white/10",
          isSm ? "top-4 right-10 w-16 h-16" : "top-6 right-12 w-20 h-20"
        )}
      />
    </div>
  );
}
