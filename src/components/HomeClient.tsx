"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { BrowseData } from "@/lib/types";
import MovieCard from "@/components/MovieCard";
import SearchBox from "@/components/SearchBox";
import { SkeletonRows } from "@/components/Skeleton";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";

export default function HomeClient() {
  const router = useRouter();
  const [data, setData] = useState<BrowseData | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/browse", { cache: "no-store" });
      if (!res.ok) throw new Error("browse failed");
      setData(await res.json());
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    // fetch-on-mount: all setState calls happen after await, so no cascading render
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  return (
    <div className="fade-up">
      <section className="pt-12 pb-8 sm:pt-16">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
          Backed by CognoDB · openCypher over Bolt
        </p>
        <h1 className="mt-3 max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          Movies are just the start.
          <br />
          <span className="text-muted">Their connections are the story.</span>
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
          Every card below is a node in a graph. Every “you might also like” is
          a two-hop traversal. And in the Connections explorer you can ask the
          database to find the shortest path between any two people.
        </p>
        <div className="mt-6 max-w-xl">
          <SearchBox
            placeholder="Try “The Matrix”, “Inception”, “Toy Story”…"
            onSelect={(movie) => router.push(`/movie/${movie.id}`)}
          />
        </div>
      </section>

      {data && (
        <section className="flex flex-wrap gap-x-10 gap-y-3 border-y border-edge/70 py-5 text-sm">
          <span>
            <strong className="text-xl font-bold text-accent">
              {data.stats.movies}
            </strong>{" "}
            <span className="text-muted">films</span>
          </span>
          <span>
            <strong className="text-xl font-bold text-accent">
              {data.stats.people}
            </strong>{" "}
            <span className="text-muted">actors &amp; directors</span>
          </span>
          <span>
            <strong className="text-xl font-bold text-accent">
              {data.stats.relationships}
            </strong>{" "}
            <span className="text-muted">typed relationships</span>
          </span>
        </section>
      )}

      <section className="mt-8">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Recently added</h2>
          <p className="text-xs text-muted">the whole filmography</p>
        </div>

        {status === "loading" && !data && <SkeletonRows count={8} />}

        {status === "error" && (
          <ErrorState
            message="We couldn't reach the movie graph database."
            onRetry={() => {
              setStatus("loading");
              load();
            }}
          />
        )}

        {status === "ready" && data && (
          data.movies.length === 0 ? (
            <EmptyState
              title="The graph is empty"
              hint="Run `npm run seed` after connecting your CognoDB instance to load the dataset."
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {data.movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )
        )}
      </section>
    </div>
  );
}