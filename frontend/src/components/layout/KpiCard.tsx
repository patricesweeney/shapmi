import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function KpiCard({ title, value, delta, className }: { title: string; value: string; delta?: { value: string; positive?: boolean }; className?: string }) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-normal text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-medium tracking-tight">{value}</div>
          {delta ? (
            <Badge variant={delta.positive ? 'success' : 'warning'}>{delta.value}</Badge>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}


