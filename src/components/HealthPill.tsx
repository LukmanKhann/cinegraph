"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";

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

  const color = health === "ok" ? "#3DDC97" : health === "down" ? "#FF4D6D" : "#6B6B6B";

  return (
    <Box
      component="span"
      className="inline-flex items-center gap-1.5 border-2 border-[#0B0B0B] bg-[#FFFFFF] px-2 py-0.5 shadow-[2px_2px_0_#0B0B0B]"
      title={
        health === "ok"
          ? "Connected to the live CognoDB graph"
          : "Graph database unreachable"
      }
    >
      <Box
        component="span"
        sx={{
          width: 9,
          height: 9,
          bgcolor: color,
          border: "1.5px solid #0B0B0B",
          animation: health === "checking" ? "pulse-soft 1.2s infinite" : "none",
          "@keyframes pulse-soft": {
            "0%,100%": { opacity: 1 },
            "50%": { opacity: 0.35 },
          },
        }}
      />
      <span className="text-[11px] font-bold uppercase tracking-wide">
        {health === "checking" ? "graph …" : health === "ok" ? "graph online" : "graph offline"}
      </span>
    </Box>
  );
}