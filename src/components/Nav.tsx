import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-[var(--cg-ink)] bg-[var(--cg-bg)]">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center border-2 border-[var(--cg-ink)] bg-[var(--cg-primary)] text-sm font-black text-[var(--cg-paper)] shadow-[2px_2px_0_var(--cg-shadow)]">
            CG
          </span>
          <span className="text-base font-black tracking-tight sm:text-lg">
            Cine<span className="underline decoration-[var(--cg-secondary)] decoration-4">Graph</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2.5 sm:gap-3">
          <ThemeToggle />
          <Link
            href="/"
            className="border-2 border-[var(--cg-ink)] bg-[var(--cg-paper)] px-2.5 py-1.5 text-sm font-bold shadow-[3px_3px_0_var(--cg-shadow)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_var(--cg-shadow)] sm:px-3"
          >
            Browse
          </Link>
          <Link
            href="/connect"
            className="border-2 border-[var(--cg-ink)] bg-[var(--cg-secondary)] px-2.5 py-1.5 text-sm font-bold text-[var(--cg-paper)] shadow-[3px_3px_0_var(--cg-shadow)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_var(--cg-shadow)] sm:px-3"
          >
            Connections<span className="hidden sm:inline"> →</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}