import { AppShell } from '@/components/layout/AppShell'
import { KpiCard } from '@/components/layout/KpiCard'

export default function NRRPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-[1.4rem] font-medium tracking-tight">Net Revenue Retention</h1>
          <p className="text-sm font-light text-muted-foreground">Expansion vs churn</p>
        </div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="NRR" value="112%" delta={{ value: '+2.1%', positive: true }} />
          <KpiCard title="Gross Retention" value="93%" />
          <KpiCard title="Expansion" value="+12%" />
          <KpiCard title="Contractions" value="-5%" />
        </div>
      </div>
    </AppShell>
  )
}


