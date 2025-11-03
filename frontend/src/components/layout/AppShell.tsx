import { Sidebar } from '@/components/layout/Sidebar'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <Sidebar />
      <div className="min-h-screen bg-white">
        <div className="h-14 border-b border-neutral-200 px-6" />
        <main className="px-6 py-6">{children}</main>
      </div>
    </div>
  )
}


