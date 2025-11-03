import { AppShell } from '@/components/layout/AppShell'
import { KpiCard } from '@/components/layout/KpiCard'

export default function PipelinePage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-[1.4rem] font-medium tracking-tight">Pipeline</h1>
          <p className="text-sm font-light text-muted-foreground">Health and coverage</p>
        </div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="Open Pipeline" value="$1.1M" />
          <KpiCard title="Coverage" value="3.1x" delta={{ value: '+0.2x', positive: true }} />
          <KpiCard title="Win Rate" value="27%" />
          <KpiCard title="Cycle Length" value="42d" />
        </div>
      </div>
    </AppShell>
  )
}


