import { Button } from '../ui/button'

export function Header() {
  return (
    <header className="border-b bg-white">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded bg-black" />
          <span className="font-semibold tracking-tight">ShapMI</span>
        </div>
        <div className="flex items-center gap-2">
          <a className="text-sm text-muted-foreground hover:text-foreground" href="#pricing">Pricing</a>
          <a className="text-sm text-muted-foreground hover:text-foreground" href="#docs">Docs</a>
          <Button variant="secondary">Sign in</Button>
        </div>
      </div>
    </header>
  )
}


