import { SessionProvider } from "./session-provider";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="flex min-h-svh flex-col bg-background pt-safe pb-safe">
        {children}
      </div>
    </SessionProvider>
  );
}
