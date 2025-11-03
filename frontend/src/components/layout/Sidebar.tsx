import { NavLink } from 'react-router-dom'
import { Home, GitBranch, LineChart } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/pipeline', label: 'Pipeline', icon: GitBranch },
  { to: '/nrr', label: 'Net Revenue Retention', icon: LineChart },
]

export function Sidebar({ className }: { className?: string }) {
  return (
    <aside className={cn('border-r bg-white', className)}>
      <div className="h-14 flex items-center px-4">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-black" />
          <span className="text-sm font-medium tracking-tight">Cubert</span>
        </div>
      </div>
      <Separator />
      <ScrollArea className="h-[calc(100vh-56px)] px-2 py-3">
        <TooltipProvider>
          <nav className="grid gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Tooltip delayDuration={300} key={to}>
                <TooltipTrigger asChild>
                  <NavLink to={to} className={({ isActive }) => cn('px-2', isActive && 'font-medium')}>
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="truncate">{label}</span>
                    </Button>
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            ))}
          </nav>
        </TooltipProvider>
      </ScrollArea>
    </aside>
  )
}


