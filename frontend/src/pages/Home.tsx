import { AppShell } from '@/components/layout/AppShell'
import { KpiCard } from '@/components/layout/KpiCard'
import { Separator } from '@/components/ui/separator'

export default function HomePage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-[1.4rem] font-medium tracking-tight">Home</h1>
          <p className="text-sm font-light text-muted-foreground">Revenue intelligence overview</p>
        </div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="ARR" value="$2.4M" delta={{ value: '+4.2%', positive: true }} />
          <KpiCard title="NRR" value="112%" delta={{ value: '+2.1%', positive: true }} />
          <KpiCard title="Gross Churn" value="3.6%" delta={{ value: '-0.4%', positive: true }} />
          <KpiCard title="Pipeline Coverage" value="3.1x" delta={{ value: '+0.2x', positive: true }} />
        </div>
        <Separator />
        <div className="text-sm text-muted-foreground">Add charts and tables here.</div>
      </div>
    </AppShell>
  )
}


