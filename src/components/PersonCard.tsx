import Link from "next/link";

export default function PersonCard({
  id,
  name,
  sub,
}: {
  id: string;
  name: string;
  sub?: string | null;
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  return (
    <Link
      href={`/person/${id}`}
      className="group flex items-center gap-3 border-2 border-[var(--cg-ink)] bg-[var(--cg-paper)] p-3 shadow-[3px_3px_0_var(--cg-shadow)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_var(--cg-shadow)]"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center border-2 border-[var(--cg-ink)] bg-[var(--cg-primary)] text-xs font-black shadow-[2px_2px_0_var(--cg-shadow)]">
        {initials}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-extrabold group-hover:underline group-hover:decoration-[var(--cg-secondary)] group-hover:decoration-2">
          {name}
        </span>
        {sub && (
          <span className="block text-xs font-semibold text-[var(--cg-muted)]">{sub}</span>
        )}
      </span>
    </Link>
  );
}