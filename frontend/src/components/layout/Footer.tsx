export function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="container flex h-14 items-center justify-between text-sm text-muted-foreground">
        <span>© {new Date().getFullYear()} ShapMI</span>
        <div className="flex items-center gap-4">
          <a className="hover:text-foreground" href="#privacy">Privacy</a>
          <a className="hover:text-foreground" href="#terms">Terms</a>
        </div>
      </div>
    </footer>
  )
}


