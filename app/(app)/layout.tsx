import { BottomNav } from "@/components/bottom-nav"
import { TopNav } from "@/components/top-nav"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="pb-16">{children}</main>
      <BottomNav />
    </div>
  )
}
