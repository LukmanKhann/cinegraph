"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { BrowseData } from "@/lib/types";
import MovieCard from "@/components/MovieCard";
import AsyncPicker from "@/components/AsyncPicker";
import { SkeletonRows } from "@/components/Skeleton";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";

function StatBox({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <Box
      sx={{
        border: "2px solid #0B0B0B",
        bgcolor: color,
        boxShadow: "4px 4px 0 #0B0B0B",
        px: 3,
        py: 2,
        transform: "rotate(-1deg)",
      }}
    >
      <Typography variant="h4" sx={{ lineHeight: 1 }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ fontWeight: 800, textTransform: "uppercase" }}>
        {label}
      </Typography>
    </Box>
  );
}

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
        <span className="inline-block border-2 border-[#0B0B0B] bg-[#B983FF] px-2.5 py-1 text-xs font-black uppercase tracking-[0.2em] shadow-[3px_3px_0_#0B0B0B]">
          Backed by CognoDB · openCypher over Bolt
        </span>
        <Typography
          variant="h1"
          component="h1"
          sx={{ mt: 3, maxWidth: 720, fontSize: { xs: "2.2rem", sm: "3.4rem" } }}
        >
          Movies are just the start.
          <br />
          <span
            className="inline-block bg-[#FFE600] px-2 pb-0.5 shadow-[4px_4px_0_#0B0B0B]"
          >
            Their connections are the story.
          </span>
        </Typography>
        <Typography sx={{ mt: 3, maxWidth: 560, fontWeight: 600 }}>
          Every card below is a node in a graph. Every “you might also like” is a
          two-hop traversal. And in the Connections explorer you can ask the
          database to find the shortest path between any two people.
        </Typography>
        <Box sx={{ mt: 4, maxWidth: 560 }}>
          <AsyncPicker
            kind="movie"
            placeholder="Try “The Matrix”, “Inception”, “Toy Story”…"
            onSelect={(movie) => router.push(`/movie/${movie.id}`)}
          />
        </Box>
        <Link
          href="/connect"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-extrabold text-[#0B0B0B] underline decoration-[#FF4D6D] decoration-2 underline-offset-4 hover:decoration-[#0B0B0B]"
        >
          …or explore how people are connected →
        </Link>
      </section>

      {data && (
        <section className="flex flex-wrap gap-6 py-6">
          <StatBox value={data.stats.movies} label="films" color="#FFE600" />
          <StatBox value={data.stats.people} label="actors & directors" color="#3DDC97" />
          <StatBox value={data.stats.relationships} label="typed relationships" color="#4D7CFE" />
        </section>
      )}

      <section className="mt-6">
        <Box
          className="mb-5 flex items-center justify-between"
          sx={{ borderBottom: "3px solid #0B0B0B", pb: 1 }}
        >
          <Typography variant="h5" component="h2">
            🍿 Recently added
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            the whole filmography
          </Typography>
        </Box>

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

        {status === "ready" && data &&
          (data.movies.length === 0 ? (
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
          ))}
      </section>
    </div>
  );
}