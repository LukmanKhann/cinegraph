"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import type { ConnectionResult } from "@/lib/types";
import GraphView from "@/components/GraphView";
import AsyncPicker, { type PickerItem } from "@/components/AsyncPicker";
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
      <span className="inline-block border-2 border-[var(--cg-ink)] bg-[var(--cg-secondary)] px-2.5 py-1 text-xs font-black uppercase tracking-[0.2em] text-white shadow-[3px_3px_0_var(--cg-shadow)]">
        The flagship query
      </span>
      <Typography variant="h1" component="h1" sx={{ mt: 2 }}>
        Connection explorer
      </Typography>
      <Typography sx={{ mt: 2, maxWidth: 620, fontWeight: 600 }}>
        Pick any two people (or films) and CineGraph will ask the database for
        the <strong>shortest path</strong> between them — a variable-length graph
        traversal that a relational database would struggle to express.
      </Typography>

      <Box
        sx={{
          mt: 5,
          p: { xs: 2, sm: 3 },
          border: "2px solid var(--cg-ink)",
          bgcolor: "var(--cg-paper)",
          boxShadow: "6px 6px 0 var(--cg-shadow)",
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          alignItems: { lg: "flex-end" },
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
          <Typography variant="caption" sx={{ fontWeight: 800, textTransform: "uppercase" }}>
            Connecting
          </Typography>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={kind}
            onChange={(_event, next) => next && setKind(next)}
          >
            <ToggleButton value="person">People</ToggleButton>
            <ToggleButton value="movie">Films</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <AsyncPicker
            kind={kind}
            value={from}
            onChange={setFrom}
            placeholder={kind === "person" ? "First person…" : "First film…"}
            excludeId={to?.id}
          />
        </Box>

        <Typography variant="h5" sx={{ lineHeight: 1, px: 1, pb: 0.5 }}>
          ↔
        </Typography>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <AsyncPicker
            kind={kind}
            value={to}
            onChange={setTo}
            placeholder={kind === "person" ? "Second person…" : "Second film…"}
            excludeId={from?.id}
          />
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
          <Typography variant="caption" sx={{ fontWeight: 800, textTransform: "uppercase" }}>
            Max hops
          </Typography>
          <ButtonGroup size="small" variant="outlined">
            {[2, 4, 6, 8].map((hops) => (
              <Button
                key={hops}
                onClick={() => setMaxHops(hops)}
                sx={{
                  bgcolor: maxHops === hops ? "var(--cg-primary)" : "var(--cg-paper)",
                  color: maxHops === hops ? "var(--cg-paper)" : "var(--cg-ink)",
                  boxShadow: maxHops === hops ? "3px 3px 0 var(--cg-shadow)" : "none",
                  borderWidth: "2px",
                }}
              >
                {hops}
              </Button>
            ))}
          </ButtonGroup>
        </Box>

        <Button
          variant="contained"
          color="secondary"
          onClick={run}
          disabled={!from || !to || status === "loading"}
          sx={{ px: 4, py: 1.5 }}
        >
          Find the path ⏎
        </Button>
      </Box>

      {status === "loading" && (
        <Box sx={{ mt: 8 }}>
          <Spinner label="Walking the graph…" />
        </Box>
      )}

      {status === "error" && (
        <Box sx={{ mt: 8 }}>
          <ErrorState message={errorMessage} onRetry={run} />
        </Box>
      )}

      {status === "ready" && result && (
        <Box sx={{ mt: 8 }}>
          {result.found ? (
            <Box>
              <Box
                className="mb-5 flex items-center gap-3"
                sx={{ borderBottom: "3px solid var(--cg-ink)", pb: 1 }}
              >
                <span className="border-2 border-[var(--cg-ink)] bg-[var(--cg-dark)] px-2.5 py-1 text-xs font-black uppercase shadow-[3px_3px_0_var(--cg-shadow)]">
                  Connected
                </span>
                <Typography variant="h5" component="h2">
                  {result.depth / 2} step{result.depth / 2 === 1 ? "" : "s"} ·{" "}
                  {result.depth} relationship{result.depth === 1 ? "" : "s"} in
                  the graph
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 3, fontWeight: 600 }}>
                This is the answer to{" "}
                <code className="border-[1.5px] border-[var(--cg-ink)] bg-[var(--cg-bg)] px-1.5 py-0.5 text-xs">
                  MATCH p = shortestPath(…) RETURN p
                </code>{" "}
                — no SQL joins, no recursion. Click any node to keep exploring.
              </Typography>
              <GraphView data={result.graph} startId={result.fromId} />

              <Box className="mt-10 max-w-2xl">
                <Typography variant="h5" component="h3" sx={{ mb: 3 }}>
                  Step by step
                </Typography>
                <Box component="ol" sx={{ p: 0, m: 0, listStyle: "none" }}>
                  {result.steps.map((step, index) => (
                    <Box component="li" key={index} sx={{ display: "flex", gap: 2 }}>
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <span className="grid h-7 w-7 shrink-0 place-items-center border-2 border-[var(--cg-ink)] bg-[var(--cg-primary)] text-xs font-black shadow-[2px_2px_0_var(--cg-shadow)]">
                          {index + 1}
                        </span>
                        {index < result.steps.length - 1 && (
                          <span className="w-0.5 flex-1 bg-[var(--cg-ink)]" />
                        )}
                      </Box>
                      <Box sx={{ pb: 4 }}>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                          <Link
                            href={`/${step.fromKind === "person" ? "person" : "movie"}/${step.fromId}`}
                            className="underline decoration-[var(--cg-secondary)] decoration-2 underline-offset-2 hover:decoration-[var(--cg-ink)]"
                          >
                            {step.from}
                          </Link>
                          {" → "}
                          <Link
                            href={`/${step.viaKind === "person" ? "person" : "movie"}/${step.viaId}`}
                            className="underline decoration-[var(--cg-secondary)] decoration-2 underline-offset-2 hover:decoration-[var(--cg-ink)]"
                          >
                            {step.via}
                          </Link>
                          {" → "}
                          <Link
                            href={`/${step.toKind === "person" ? "person" : "movie"}/${step.toId}`}
                            className="underline decoration-[var(--cg-secondary)] decoration-2 underline-offset-2 hover:decoration-[var(--cg-ink)]"
                          >
                            {step.to}
                          </Link>
                        </Typography>
                        <Typography variant="body2" sx={{ color: "var(--cg-muted)", fontWeight: 600 }}>
                          {step.detail}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          ) : (
            <Box
              className="flex flex-col items-center gap-2 px-6 py-12 text-center"
              sx={{ border: "3px dashed var(--cg-ink)", bgcolor: "var(--cg-paper)" }}
            >
              <span className="grid h-14 w-14 place-items-center border-2 border-[var(--cg-ink)] bg-[var(--cg-light)] text-2xl shadow-[3px_3px_0_var(--cg-shadow)]">
                🕸️
              </span>
              <Typography variant="h6" component="p">
                No connection found within {maxHops} hops
              </Typography>
              <Typography variant="body2" sx={{ maxWidth: 420, color: "var(--cg-muted)", fontWeight: 600 }}>
                That’s a real answer too — the graph proved there is no path of
                that length. Try a deeper search (8 hops) or a different pair.
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </div>
  );
}