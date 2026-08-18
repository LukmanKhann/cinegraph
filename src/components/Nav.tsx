import Link from "next/link";

export default function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-edge/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold tracking-tight">CineGraph</span>
          <span className="hidden text-xs text-muted sm:inline">
            a graph database demo
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/"
            className="rounded-md px-3 py-1.5 text-muted transition-colors hover:bg-surface2 hover:text-foreground"
          >
            Browse
          </Link>
          <Link
            href="/connect"
            className="rounded-md px-3 py-1.5 text-muted transition-colors hover:bg-surface2 hover:text-foreground"
          >
            Connections
          </Link>
        </nav>
      </div>
    </header>
  );
}