"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import type { GraphData, GraphNode } from "@/lib/types";

const WIDTH = 1000;
const PAD_X = 60;
const NODE_SPACING = 64;

const INK = "var(--cg-ink)";

interface Position {
  x: number;
  y: number;
}

interface LayoutResult {
  positions: Map<string, Position>;
  height: number;
}

function layersFrom(data: GraphData, startId: string): Map<string, number> {
  const dist = new Map<string, number>();
  dist.set(startId, 0);
  const queue = [startId];
  while (queue.length > 0) {
    const current = queue.shift() as string;
    const d = dist.get(current) ?? 0;
    for (const link of data.links) {
      const next =
        link.source === current
          ? link.target
          : link.target === current
            ? link.source
            : null;
      if (next && !dist.has(next)) {
        dist.set(next, d + 1);
        queue.push(next);
      }
    }
  }
  return dist;
}

/**
 * Layered (sugiyama-ish) layout with:
 * - dynamic height so layers with many nodes never overlap
 * - column width proportional to how many nodes a layer holds
 * - barycenter ordering to keep edges from crossing
 */
function layout(data: GraphData, startId: string): LayoutResult {
  const dist = layersFrom(data, startId);
  const byLayer = new Map<number, string[]>();
  const adj = new Map<string, string[]>();
  for (const node of data.nodes) {
    const layer = dist.get(node.id) ?? 0;
    const list = byLayer.get(layer) ?? [];
    list.push(node.id);
    byLayer.set(layer, list);
  }
  for (const link of data.links) {
    for (const [a, b] of [
      [link.source, link.target],
      [link.target, link.source],
    ]) {
      const list = adj.get(a) ?? [];
      list.push(b);
      adj.set(a, list);
    }
  }

  const layers = [...byLayer.keys()].sort((a, b) => a - b);

  const weights = layers.map((layer) => byLayer.get(layer)!.length + 1);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const available = WIDTH - PAD_X * 2;
  const layerX = new Map<number, number>();
  let cursor = PAD_X;
  layers.forEach((layer, index) => {
    const width = (available * weights[index]) / totalWeight;
    layerX.set(layer, cursor + width / 2);
    cursor += width;
  });

  const positions = new Map<string, Position>();
  const barycenterOf = (id: string): number => {
    const neighbors = (adj.get(id) ?? []).filter((other) => {
      const d = dist.get(other);
      return d != null && d === (dist.get(id) ?? 0) - 1;
    });
    if (neighbors.length === 0) return 0;
    const sum = neighbors.reduce(
      (acc, other) => acc + (positions.get(other)?.y ?? 0),
      0,
    );
    return sum / neighbors.length;
  };

  let maxCount = 1;
  for (let li = 0; li < layers.length; li++) {
    const layer = layers[li];
    const ids = byLayer.get(layer)!;
    const count = ids.length;
    maxCount = Math.max(maxCount, count);
    const ordered =
      li === 0
        ? ids
        : [...ids].sort((a, b) => barycenterOf(a) - barycenterOf(b));
    ordered.forEach((id, index) => {
      const y = (index - (count - 1) / 2) * NODE_SPACING;
      positions.set(id, { x: layerX.get(layer)!, y });
    });
  }

  const height = Math.max(440, maxCount * NODE_SPACING + NODE_SPACING * 2);
  for (const [id, pos] of positions) {
    positions.set(id, { x: pos.x, y: pos.y + height / 2 });
  }
  return { positions, height };
}

function truncate(label: string, max = 18): string {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label;
}

export default function GraphView({
  data,
  startId,
}: {
  data: GraphData;
  startId: string;
}) {
  const router = useRouter();
  const { positions, height, endId } = useMemo(() => {
    const { positions: layoutPositions, height: layoutHeight } = layout(data, startId);
    const endId =
      data.nodes.length > 0
        ? data.nodes.reduce((a, b) =>
            (layoutPositions.get(b.id)?.x ?? 0) >
            (layoutPositions.get(a.id)?.x ?? 0)
              ? b
              : a,
          ).id
        : startId;
    return { positions: layoutPositions, height: layoutHeight, endId };
  }, [data, startId]);

  if (data.nodes.length === 0) {
    return null;
  }

  const edgePath = (link: GraphData["links"][number], index: number) => {
    const a = positions.get(link.source);
    const b = positions.get(link.target);
    if (!a || !b) return null;
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const bend = (Math.max(18, Math.min(60, len * 0.18)) * (index % 2 === 0 ? 1 : -1));
    const ox = (-dy / len) * bend;
    const oy = (dx / len) * bend;
    return { d: `M ${a.x} ${a.y} Q ${mx + ox} ${my + oy} ${b.x} ${b.y}` };
  };

  const onNodeClick = (node: GraphNode) => {
    router.push(node.kind === "person" ? `/person/${node.id}` : `/movie/${node.id}`);
  };

  const isEndpoint = (node: GraphNode) =>
    node.id === startId || node.id === endId;

  return (
    <div className="w-full border-2 border-[var(--cg-ink)] bg-[var(--cg-bg)] shadow-[5px_5px_0_var(--cg-shadow)]">
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        className="block h-auto w-full"
        role="img"
        aria-label="Graph visualisation of connections"
      >
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 9 5 L 0 9 z" fill="var(--cg-ink)" />
          </marker>
        </defs>

        {data.links.map((link, index) => {
          const path = edgePath(link, index);
          if (!path) return null;
          return (
            <path
              key={`${link.source}-${link.target}-${index}`}
              d={path.d}
              fill="none"
              stroke="var(--cg-ink)"
              strokeWidth={2}
              strokeLinecap="round"
              markerEnd="url(#arrow)"
            >
              <title>
                {link.type} · {link.role ?? "—"}
              </title>
            </path>
          );
        })}

        {data.nodes.map((node) => {
          const pos = positions.get(node.id);
          if (!pos) return null;
          const endpoint = isEndpoint(node);
          const isPerson = node.kind === "person";
          return (
            <g
              key={node.id}
              transform={`translate(${pos.x}, ${pos.y})`}
              className="cursor-pointer"
              onClick={() => onNodeClick(node)}
            >
              <title>
                {node.label}
                {node.sub ? ` (${node.sub})` : ""}
              </title>
              {isPerson ? (
                <circle
                  r={22}
                  fill="var(--cg-light)"
                  stroke={INK}
                  strokeWidth={2.5}
                  style={{ filter: "drop-shadow(2px 2px 0 var(--cg-shadow))" }}
                />
              ) : (
                <rect
                  x={-62}
                  y={-19}
                  width={124}
                  height={38}
                  rx={2}
                  fill="var(--cg-dark)"
                  stroke={INK}
                  strokeWidth={2.5}
                  style={{ filter: "drop-shadow(2px 2px 0 var(--cg-shadow))" }}
                />
              )}
              <text
                textAnchor="middle"
                y={isPerson ? 3 : -3}
                fontSize={isPerson ? 12 : 10.5}
                fontWeight={800}
                fill={isPerson ? "var(--cg-ink)" : "var(--cg-paper)"}
              >
                {isPerson
                  ? truncate(node.label.split(" ")[0], 10)
                  : truncate(node.label, 16)}
              </text>
              {!isPerson && (
                <text
                  textAnchor="middle"
                  y={14}
                  fontSize={9}
                  fontWeight={700}
                  fill="var(--cg-paper)"
                >
                  {node.year ?? ""}
                </text>
              )}
              {endpoint && (
                <circle
                  r={29}
                  fill="none"
                  stroke="var(--cg-secondary)"
                  strokeWidth={2.5}
                  strokeDasharray="5 4"
                />
              )}
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t-2 border-[var(--cg-ink)] bg-[var(--cg-paper)] px-4 py-2.5">
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--cg-ink)]">
          <span className="h-3.5 w-3.5 rounded-full border-2 border-[var(--cg-ink)] bg-[var(--cg-light)]" />
          Person
        </span>
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--cg-ink)]">
          <span className="h-3.5 w-5 border-2 border-[var(--cg-ink)] bg-[var(--cg-dark)]" />
          Movie
        </span>
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--cg-ink)]">
          <span className="h-3.5 w-3.5 rounded-full border-2 border-dashed border-[var(--cg-secondary)]" />
          Start / end
        </span>
        <span className="ml-auto hidden text-[11px] font-bold uppercase tracking-wide text-[var(--cg-muted)] sm:block">
          click any node to explore
        </span>
      </div>
    </div>
  );
}