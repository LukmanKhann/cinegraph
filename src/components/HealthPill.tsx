"use client";

import { useEffect, useState } from "react";

type Health = "checking" | "ok" | "down";

export default function HealthPill() {
  const [health, setHealth] = useState<Health>("checking");

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch("/api/health", { cache: "no-store" });
        if (!cancelled) setHealth(res.ok ? "ok" : "down");
      } catch {
        if (!cancelled) setHealth("down");
      }
    };
    check();
    return () => {
      cancelled = true;
    };
  }, []);

  if (health === "checking") {
    return (
      <span className="inline-flex items-center gap-1.5 pulse-soft">
        <span className="h-1.5 w-1.5 rounded-full bg-muted" />
        graph …
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1.5"
      title={
        health === "ok"
          ? "Connected to the live CognoDB graph"
          : "Graph database unreachable"
      }
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          health === "ok" ? "bg-emerald-400" : "bg-danger"
        }`}
      />
      {health === "ok" ? "graph online" : "graph offline"}
    </span>
  );
}