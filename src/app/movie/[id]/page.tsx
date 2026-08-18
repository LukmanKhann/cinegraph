"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import type { GraphData, MovieDetail, Recommendation } from "@/lib/types";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";
import MovieCard, { gradientFor } from "@/components/MovieCard";
import GraphView from "@/components/GraphView";

interface MovieResponse {
  movie: MovieDetail;
  recommendations: Recommendation[];
  network: GraphData;
}

function formatRuntime(minutes: number | null): string | null {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <Box className="mb-4 flex items-center" sx={{ borderBottom: "3px solid var(--cg-ink)", pb: 1 }}>
      <Typography variant="h5" component="h2">
        {children}
      </Typography>
    </Box>
  );
}

export default function MoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<MovieResponse | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "missing">(
    "loading",
  );

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/movie/${id}`, { cache: "no-store" });
      if (res.status === 404) {
        setStatus("missing");
        return;
      }
      if (!res.ok) throw new Error("movie failed");
      setData(await res.json());
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [id]);

  useEffect(() => {
    // fetch-on-mount: all setState calls happen after await, so no cascading render
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  if (status === "loading") {
    return (
      <div className="pt-10 space-y-6">
        <Skeleton variant="rectangular" height={180} sx={{ border: "2px solid var(--cg-ink)", boxShadow: "5px 5px 0 var(--cg-shadow)" }} />
        <Skeleton variant="text" width="50%" sx={{ fontSize: "2rem" }} />
        <Skeleton variant="text" width="70%" sx={{ fontSize: "1rem" }} />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} variant="rectangular" height={150} sx={{ border: "2px solid var(--cg-ink)" }} />
          ))}
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="pt-10">
        <ErrorState
          message="We couldn't load this movie — the graph database seems unreachable."
          onRetry={() => {
            setStatus("loading");
            load();
          }}
        />
      </div>
    );
  }

  if (status === "missing" || !data) {
    return (
      <div className="pt-10">
        <EmptyState
          title="We couldn't find that movie"
          hint="It may not be part of the seeded graph. Try browsing from the home page."
        />
      </div>
    );
  }

  const { movie, recommendations, network } = data;
  const [gradientFrom, gradientTo] = gradientFor(movie.id);

  return (
    <div className="fade-up pt-6">
      <Box
        className="relative overflow-hidden px-6 py-10 sm:px-10 sm:py-14"
        sx={{
          border: "2px solid var(--cg-ink)",
          boxShadow: "7px 7px 0 var(--cg-shadow)",
          background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
        }}
      >
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {movie.genres.map((genre) => (
            <Chip
              key={genre}
              label={genre}
              size="small"
              sx={{
                bgcolor: "var(--cg-ink)",
                color: "var(--cg-paper)",
                border: "2px solid var(--cg-ink)",
                fontWeight: 800,
                textTransform: "uppercase",
                "&:hover": { boxShadow: "none" },
              }}
            />
          ))}
        </Box>
        <Typography
          variant="h2"
          component="h1"
          sx={{ mt: 3, maxWidth: 760, fontSize: { xs: "1.8rem", sm: "2.6rem" } }}
        >
          {movie.title}
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, fontStyle: "italic", fontWeight: 700, maxWidth: 620 }}>
          “{movie.tagline}”
        </Typography>
        <Typography variant="body1" sx={{ mt: 1.5, fontWeight: 800 }}>
          {movie.year} · {formatRuntime(movie.runtimeMinutes) ?? "—"}
        </Typography>
        {movie.directors.length > 0 && (
          <Typography variant="body1" sx={{ mt: 0.5, fontWeight: 800 }}>
            Directed by{" "}
            {movie.directors.map((director, index) => (
              <span key={director.id}>
                {index > 0 && ", "}
                <Link href={`/person/${director.id}`} className="underline decoration-black/50 decoration-2 underline-offset-2 hover:decoration-black">
                  {director.name}
                </Link>
              </span>
            ))}
          </Typography>
        )}
      </Box>

      <section className="mt-10">
        <SectionHeading>
          Cast <span className="text-sm text-[var(--cg-muted)]">· {movie.cast.length} actors</span>
        </SectionHeading>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {movie.cast.map((member) => (
            <Link
              key={member.id}
              href={`/person/${member.id}`}
              className="group flex items-center gap-3 border-2 border-[var(--cg-ink)] bg-[var(--cg-paper)] p-3 shadow-[3px_3px_0_var(--cg-shadow)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_var(--cg-shadow)]"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center border-2 border-[var(--cg-ink)] bg-[var(--cg-light)] text-xs font-black shadow-[2px_2px_0_var(--cg-shadow)]">
                {member.name
                  .split(" ")
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("")}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-extrabold group-hover:underline group-hover:decoration-[var(--cg-secondary)] group-hover:decoration-2">
                  {member.name}
                </span>
                {member.role && (
                  <span className="block truncate text-xs font-semibold text-[var(--cg-muted)]">
                    as {member.role}
                  </span>
                )}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {recommendations.length > 0 && (
        <section className="mt-10">
          <SectionHeading>You might also like</SectionHeading>
          <Typography variant="body2" sx={{ mb: 3, fontWeight: 600, maxWidth: 640 }}>
            Found by walking the graph: every suggestion shares at least one cast
            member or genre with {movie.title} — a two-hop traversal from this
            movie’s node.
          </Typography>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {recommendations.map(({ movie: other, sharedActors, sharedGenres }) => (
              <div key={other.id} className="relative">
                <MovieCard movie={other} />
                <span className="absolute -top-2 right-2 border-2 border-[var(--cg-ink)] bg-[var(--cg-light)] px-1.5 py-0.5 text-[10px] font-black uppercase shadow-[2px_2px_0_var(--cg-shadow)]">
                  {sharedActors > 0 && sharedGenres > 0
                    ? `👥 ${sharedActors} · 🏷 ${sharedGenres}`
                    : sharedActors > 0
                      ? `👥 ${sharedActors} shared`
                      : `🏷 shared genre`}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-14 mb-8">
        <SectionHeading>Cast network</SectionHeading>
        <Typography variant="body2" sx={{ mb: 3, fontWeight: 600, maxWidth: 640 }}>
          {movie.title} in the middle, its cast around it, and the other films
          each cast member has appeared in on the outside. Click any node.
        </Typography>
        <GraphView data={network} startId={movie.id} />
      </section>
    </div>
  );
}