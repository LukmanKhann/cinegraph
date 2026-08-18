"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
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
      <div className="pt-10">
        <div className="h-40 animate-pulse rounded-2xl bg-surface2" />
        <div className="mt-6 h-5 w-1/2 animate-pulse rounded bg-surface2" />
        <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-surface2" />
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-40 animate-pulse rounded-xl bg-surface2" />
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

  return (
    <div className="fade-up pt-6">
      <section
        className={`relative overflow-hidden rounded-2xl border border-edge bg-gradient-to-br ${gradientFor(movie.id)}`}
      >
        <div className="px-6 py-10 sm:px-10 sm:py-14">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {movie.genres.map((genre) => (
              <span
                key={genre}
                className="rounded-full border border-white/25 bg-black/25 px-2.5 py-1 text-white/90"
              >
                {genre}
              </span>
            ))}
          </div>
          <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">
            {movie.title}
          </h1>
          <p className="mt-3 max-w-xl text-sm italic text-white/80">
            “{movie.tagline}”
          </p>
          <p className="mt-3 text-sm text-white/70">
            {movie.year} · {formatRuntime(movie.runtimeMinutes) ?? "—"}
          </p>
          {movie.directors.length > 0 && (
            <p className="mt-1 text-sm text-white/80">
              Directed by{" "}
              {movie.directors.map((director, index) => (
                <span key={director.id}>
                  {index > 0 && ", "}
                  <Link
                    href={`/person/${director.id}`}
                    className="font-semibold underline decoration-white/40 underline-offset-2 hover:decoration-white"
                  >
                    {director.name}
                  </Link>
                </span>
              ))}
            </p>
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">
          Cast <span className="text-muted">· {movie.cast.length} actors</span>
        </h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {movie.cast.map((member) => (
            <Link
              key={member.id}
              href={`/person/${member.id}`}
              className="group flex items-center gap-3 rounded-xl border border-edge bg-surface p-3 transition-colors hover:border-accent/60"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface2 text-xs font-bold text-accent">
                {member.name
                  .split(" ")
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("")}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold group-hover:text-accent">
                  {member.name}
                </span>
                {member.role && (
                  <span className="block truncate text-xs text-muted">
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
          <h2 className="mb-1 text-lg font-semibold">
            You might also like{" "}
            <span className="text-xs font-normal text-muted">
              — found by walking the graph
            </span>
          </h2>
          <p className="mb-4 text-xs text-muted">
            Every suggestion shares at least one cast member or genre with{" "}
            {movie.title}: a two-hop traversal from this movie’s node.
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {recommendations.map(({ movie: other, sharedActors, sharedGenres }) => (
              <div key={other.id} className="relative">
                <MovieCard movie={other} />
                <span className="absolute -top-2 right-2 rounded-full bg-surface2 px-2 py-0.5 text-[10px] text-muted">
                  {sharedActors > 0 && sharedGenres > 0
                    ? `👥 ${sharedActors} shared · 🏷 ${sharedGenres}`
                    : sharedActors > 0
                      ? `👥 ${sharedActors} shared actor${sharedActors > 1 ? "s" : ""}`
                      : `🏷 shared genre${sharedGenres > 1 ? "s" : ""}`}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="mb-1 text-lg font-semibold">
          Cast network{" "}
          <span className="text-xs font-normal text-muted">
            — who else have they worked with?
          </span>
        </h2>
        <p className="mb-4 text-xs text-muted">
          {movie.title} in the middle, its cast around it, and the other films
          each cast member has appeared in on the outside. Click any node.
        </p>
        <GraphView data={network} startId={movie.id} />
      </section>
    </div>
  );
}