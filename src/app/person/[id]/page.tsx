"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { CoStar, PersonDetail } from "@/lib/types";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";

interface PersonResponse {
  person: PersonDetail;
  coStars: CoStar[];
}

export default function PersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<PersonResponse | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "missing">(
    "loading",
  );

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/person/${id}`, { cache: "no-store" });
      if (res.status === 404) {
        setStatus("missing");
        return;
      }
      if (!res.ok) throw new Error("person failed");
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
      <div className="pt-10 space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 animate-pulse rounded-full bg-surface2" />
          <div className="space-y-2">
            <div className="h-5 w-48 animate-pulse rounded bg-surface2" />
            <div className="h-4 w-24 animate-pulse rounded bg-surface2" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-xl bg-surface2" />
          ))}
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="pt-10">
        <ErrorState
          message="We couldn't load this person — the graph database seems unreachable."
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
          title="We couldn't find that person"
          hint="They may not be part of the seeded graph. Try browsing from the home page."
        />
      </div>
    );
  }

  const { person, coStars } = data;
  const initials = person.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

  return (
    <div className="fade-up pt-8">
      <section className="flex flex-wrap items-center gap-5">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface2 text-xl font-bold text-accent">
          {initials}
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {person.name}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {person.born ? `Born ${person.born}` : "Birth year unknown"} ·{" "}
            {person.actedIn.length} films as actor · {person.directed.length}{" "}
            as director
          </p>
        </div>
        <Link
          href={`/connect?from=${person.id}`}
          className="ml-auto rounded-lg border border-edge px-4 py-2 text-xs font-semibold text-muted transition-colors hover:border-accent/60 hover:text-accent"
        >
          Find their connections →
        </Link>
      </section>

      {person.actedIn.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-lg font-semibold">Filmography</h2>
          <ul className="space-y-1.5">
            {person.actedIn.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/movie/${item.id}`}
                  className="group flex flex-wrap items-baseline gap-x-3 rounded-lg border border-edge bg-surface px-4 py-2.5 transition-colors hover:border-accent/60"
                >
                  <span className="text-xs tabular-nums text-muted">
                    {item.year}
                  </span>
                  <span className="text-sm font-semibold group-hover:text-accent">
                    {item.title}
                  </span>
                  {item.role && (
                    <span className="text-xs text-muted">as {item.role}</span>
                  )}
                  {item.director && (
                    <span className="ml-auto text-xs text-muted">
                      dir. {item.director}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {coStars.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-1 text-lg font-semibold">
            Most frequent co-stars{" "}
            <span className="text-xs font-normal text-muted">
              — ranked by counting shared movies (a 2-hop traversal)
            </span>
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {coStars.map((coStar) => (
              <Link
                key={coStar.id}
                href={`/person/${coStar.id}`}
                className="group flex items-center gap-3 rounded-xl border border-edge bg-surface p-3 transition-colors hover:border-accent/60"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface2 text-xs font-bold text-accent">
                  {coStar.name
                    .split(" ")
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold group-hover:text-accent">
                    {coStar.name}
                  </span>
                  <span className="block truncate text-xs text-muted">
                    together in {coStar.with.join(" · ")}
                  </span>
                </span>
                <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">
                  {coStar.moviesTogether}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}