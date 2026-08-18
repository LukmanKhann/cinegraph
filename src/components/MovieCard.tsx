import Link from "next/link";
import type { MovieSummary } from "@/lib/types";

const GRADIENTS = [
  "from-rose-600/70 via-rose-900/40 to-slate-950",
  "from-violet-600/70 via-violet-900/40 to-slate-950",
  "from-sky-600/70 via-sky-900/40 to-slate-950",
  "from-emerald-600/70 via-emerald-900/40 to-slate-950",
  "from-amber-600/70 via-amber-900/40 to-slate-950",
  "from-cyan-600/70 via-cyan-900/40 to-slate-950",
  "from-fuchsia-600/70 via-fuchsia-900/40 to-slate-950",
  "from-red-600/70 via-red-900/40 to-slate-950",
];

export function gradientFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) % 997;
  }
  return GRADIENTS[hash % GRADIENTS.length];
}

export default function MovieCard({ movie }: { movie: MovieSummary }) {
  return (
    <Link
      href={`/movie/${movie.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-edge bg-surface transition-colors hover:border-accent/60"
    >
      <div
        className={`relative flex h-28 items-end bg-gradient-to-br ${gradientFor(movie.id)} px-3 pb-2`}
      >
        <p className="text-[11px] font-semibold tracking-[0.2em] text-white/70">
          {movie.year}
        </p>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="text-sm font-semibold leading-snug group-hover:text-accent">
          {movie.title}
        </h3>
        <div className="flex flex-wrap gap-1">
          {movie.genres.slice(0, 3).map((genre) => (
            <span
              key={genre}
              className="rounded-full border border-edge px-1.5 py-0.5 text-[10px] text-muted"
            >
              {genre}
            </span>
          ))}
        </div>
        {movie.cast.length > 0 && (
          <p className="mt-auto line-clamp-2 text-xs text-muted">
            {movie.cast.slice(0, 4).join(" · ")}
          </p>
        )}
      </div>
    </Link>
  );
}