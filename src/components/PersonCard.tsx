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
      className="group flex items-center gap-3 rounded-xl border border-edge bg-surface p-3 transition-colors hover:border-accent/60"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface2 text-xs font-bold text-accent">
        {initials}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold group-hover:text-accent">
          {name}
        </span>
        {sub && <span className="block text-xs text-muted">{sub}</span>}
      </span>
    </Link>
  );
}