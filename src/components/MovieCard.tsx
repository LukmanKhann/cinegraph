import Link from "next/link";
import Box from "@mui/material/Box";
import type { MovieSummary } from "@/lib/types";
import { movieGradients } from "@/lib/theme";

export function gradientFor(id: string): [string, string] {
  const keys = Object.keys(movieGradients);
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) % 997;
  }
  return movieGradients[keys[hash % keys.length]];
}

export default function MovieCard({ movie }: { movie: MovieSummary }) {
  const [from, to] = gradientFor(movie.id);
  return (
    <Link
      href={`/movie/${movie.id}`}
      className="group flex flex-col overflow-hidden border-2 border-[var(--cg-ink)] bg-[var(--cg-paper)] shadow-[4px_4px_0_var(--cg-shadow)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_var(--cg-shadow)]"
    >
      <Box
        className="relative flex h-28 items-end px-3 pb-2"
        sx={{
          background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
        }}
      >
        <span className="border-2 border-[var(--cg-ink)] bg-[var(--cg-ink)] px-1.5 py-0.5 text-[11px] font-black tracking-widest text-white">
          {movie.year}
        </span>
      </Box>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="text-sm font-extrabold leading-snug group-hover:underline group-hover:decoration-[var(--cg-secondary)] group-hover:decoration-2">
          {movie.title}
        </h3>
        <div className="flex flex-wrap gap-1">
          {movie.genres.slice(0, 3).map((genre) => (
            <span
              key={genre}
              className="border-[1.5px] border-[var(--cg-ink)] bg-[var(--cg-bg)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            >
              {genre}
            </span>
          ))}
        </div>
        {movie.cast.length > 0 && (
          <p className="mt-auto line-clamp-2 text-xs font-semibold text-[var(--cg-muted)]">
            {movie.cast.slice(0, 4).join(" · ")}
          </p>
        )}
      </div>
    </Link>
  );
}