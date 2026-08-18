"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import type { ConnectionResult } from "@/lib/types";
import GraphView from "@/components/GraphView";
import PersonPicker, { type PickerItem } from "@/components/PersonPicker";
import ErrorState from "@/components/ErrorState";
import { Spinner } from "@/components/Skeleton";

type Kind = "person" | "movie";

export default function ConnectExplorer({
  initialFrom,
}: {
  initialFrom?: string | null;
}) {
  const [kind, setKind] = useState<Kind>("person");
  const [from, setFrom] = useState<PickerItem | null>(() =>
    initialFrom ? { id: initialFrom, label: decodeURIComponent(initialFrom) } : null,
  );
  const [to, setTo] = useState<PickerItem | null>(null);
  const [maxHops, setMaxHops] = useState(4);
  const [result, setResult] = useState<ConnectionResult | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");

  const run = useCallback(async () => {
    if (!from || !to) return;
    setStatus("loading");
    try {
      const params = new URLSearchParams({
        from: from.id,
        to: to.id,
        kind,
        maxHops: String(maxHops),
      });
      const res = await fetch(`/api/connect?${params.toString()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data?.error?.message ?? "Something went wrong.");
        setStatus("error");
        return;
      }
      setResult(data);
      setStatus("ready");
    } catch {
      setErrorMessage("The graph database seems unreachable right now.");
      setStatus("error");
    }
  }, [from, to, kind, maxHops]);

  return (
    <div className="fade-up pt-10">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Connection explorer
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        Pick any two people (or films) and CineGraph will ask the database for
        the <em className="text-foreground">shortest path</em> between them — a
        variable-length graph traversal that a relational database would
        struggle to express.
      </p>

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Connecting
          </span>
          <div className="flex overflow-hidden rounded-lg border border-edge">
            <button
              type="button"
              onClick={() => setKind("person")}
              className={`px-3.5 py-2 text-xs font-semibold transition-colors ${
                kind === "person"
                  ? "bg-accent text-black"
                  : "bg-surface text-muted hover:text-foreground"
              }`}
            >
              People
            </button>
            <button
              type="button"
              onClick={() => setKind("movie")}
              className={`px-3.5 py-2 text-xs font-semibold transition-colors ${
                kind === "movie"
                  ? "bg-accent text-black"
                  : "bg-surface text-muted hover:text-foreground"
              }`}
            >
              Films
            </button>
          </div>
        </div>

        <div className="w-52 sm:w-64">
          <PersonPicker
            kind={kind}
            value={from}
            onChange={setFrom}
            placeholder={kind === "person" ? "First person…" : "First film…"}
            excludeId={to?.id}
          />
        </div>

        <span className="pb-2.5 text-muted">↔</span>

        <div className="w-52 sm:w-64">
          <PersonPicker
            kind={kind}
            value={to}
            onChange={setTo}
            placeholder={kind === "person" ? "Second person…" : "Second film…"}
            excludeId={from?.id}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Max hops
          </span>
          <div className="flex overflow-hidden rounded-lg border border-edge">
            {[2, 4, 6, 8].map((hops) => (
              <button
                key={hops}
                type="button"
                onClick={() => setMaxHops(hops)}
                className={`px-3 py-2 text-xs font-semibold transition-colors ${
                  maxHops === hops
                    ? "bg-accent text-black"
                    : "bg-surface text-muted hover:text-foreground"
                }`}
              >
                {hops}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={run}
          disabled={!from || !to || status === "loading"}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-40"
        >
          Find the path
        </button>
      </div>

      {status === "loading" && (
        <div className="mt-8">
          <Spinner label="Walking the graph…" />
        </div>
      )}

      {status === "error" && (
        <div className="mt-8">
          <ErrorState message={errorMessage} onRetry={run} />
        </div>
      )}

      {status === "ready" && result && (
        <div className="mt-8 space-y-8">
          {result.found ? (
            <>
              <section>
                <h2 className="mb-1 text-lg font-semibold">
                  Connected in {result.depth / 2} step
                  {result.depth / 2 === 1 ? "" : "s"}
                  <span className="text-xs font-normal text-muted">
                    {" "}
                    · {result.depth} relationship{result.depth === 1 ? "" : "s"} in the graph
                  </span>
                </h2>
                <p className="mb-4 text-xs text-muted">
                  This is the answer to{" "}
                  <code className="rounded bg-surface2 px-1.5 py-0.5 font-mono text-[11px]">
                    MATCH p = shortestPath(…) RETURN p
                  </code>{" "}
                  — no SQL joins, no recursion. Click any node to keep exploring.
                </p>
                <GraphView data={result.graph} startId={result.fromId} />
              </section>

              <section>
                <h2 className="mb-3 text-lg font-semibold">Step by step</h2>
                <ol className="space-y-0">
                  {result.steps.map((step, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex flex-col items-center">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-[11px] font-bold text-accent">
                          {index + 1}
                        </span>
                        {index < result.steps.length - 1 && (
                          <span className="w-px flex-1 bg-edge" />
                        )}
                      </span>
                      <p className="pb-5 text-sm leading-relaxed">
                        <Link
                          href={`/${step.fromKind === "person" ? "person" : "movie"}/${step.fromId}`}
                          className="font-semibold text-accent hover:underline"
                        >
                          {step.from}
                        </Link>
                        {" → "}
                        <Link
                          href={`/${step.viaKind === "person" ? "person" : "movie"}/${step.viaId}`}
                          className="font-semibold hover:underline"
                        >
                          {step.via}
                        </Link>
                        {" → "}
                        <Link
                          href={`/${step.toKind === "person" ? "person" : "movie"}/${step.toId}`}
                          className="font-semibold text-accent hover:underline"
                        >
                          {step.to}
                        </Link>
                        <span className="block text-xs text-muted">
                          {step.detail}
                        </span>
                      </p>
                    </li>
                  ))}
                </ol>
              </section>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-edge bg-surface/50 px-6 py-12 text-center">
              <span className="text-2xl">🕸️</span>
              <p className="text-sm font-semibold">
                No connection found within {maxHops} hops
              </p>
              <p className="max-w-sm text-xs text-muted">
                That’s a real answer too — the graph proved there is no path of
                that length. Try a deeper search (6 hops) or a different pair.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}