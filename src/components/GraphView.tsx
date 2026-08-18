"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import type { GraphData, GraphNode } from "@/lib/types";

const WIDTH = 1000;
const HEIGHT = 440;
const PAD_X = 70;
const PAD_Y = 56;

interface Position {
  x: number;
  y: number;
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

function layout(data: GraphData, startId: string): Map<string, Position> {
  const dist = layersFrom(data, startId);
  const positions = new Map<string, Position>();
  const byLayer = new Map<number, string[]>();
  for (const node of data.nodes) {
    const layer = dist.get(node.id) ?? 0;
    const list = byLayer.get(layer) ?? [];
    list.push(node.id);
    byLayer.set(layer, list);
  }
  const maxLayer = Math.max(0, ...byLayer.keys());
  for (const [layer, ids] of byLayer) {
    const x = PAD_X + (layer / Math.max(maxLayer, 1)) * (WIDTH - PAD_X * 2);
    ids.forEach((id, index) => {
      const count = ids.length;
      const y = HEIGHT / 2 + (index - (count - 1) / 2) * Math.min(84, (HEIGHT - PAD_Y * 2) / Math.max(count, 1));
      positions.set(id, { x, y });
    });
  }
  return positions;
}

const BLACK = "#0B0B0B";
const YELLOW = "#FFE600";
const BLUE = "#4D7CFE";

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
  const positioned = useMemo(() => {
    const positions = layout(data, startId);
    const endId =
      data.nodes.length > 0
        ? data.nodes.reduce((a, b) =>
            (positions.get(b.id)?.x ?? 0) > (positions.get(a.id)?.x ?? 0) ? b : a,
          ).id
        : startId;
    return { positions, endId };
  }, [data, startId]);

  if (data.nodes.length === 0) {
    return null;
  }

  const { positions, endId } = positioned;

  const edgePath = (link: GraphData["links"][number]) => {
    const a = positions.get(link.source);
    const b = positions.get(link.target);
    if (!a || !b) return null;
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const bend = Math.max(18, Math.min(60, len * 0.18));
    const ox = (-dy / len) * bend;
    const oy = (dx / len) * bend;
    return { d: `M ${a.x} ${a.y} Q ${mx + ox} ${my + oy} ${b.x} ${b.y}`, a, b };
  };

  const onNodeClick = (node: GraphNode) => {
    router.push(node.kind === "person" ? `/person/${node.id}` : `/movie/${node.id}`);
  };

  const isEndpoint = (node: GraphNode) =>
    node.id === startId || node.id === endId;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="w-full border-2 border-[#0B0B0B] bg-[#FFF8E7] shadow-[5px_5px_0_#0B0B0B]"
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
          <path d="M 0 1 L 9 5 L 0 9 z" fill="#0B0B0B" />
        </marker>
      </defs>

      {data.links.map((link, index) => {
        const path = edgePath(link);
        if (!path) return null;
        return (
          <path
            key={`${link.source}-${link.target}-${index}`}
            d={path.d}
            fill="none"
            stroke="#0B0B0B"
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
                r={19}
                fill={YELLOW}
                stroke={BLACK}
                strokeWidth={2.5}
                style={{ filter: "drop-shadow(2px 2px 0 #0B0B0B)" }}
              />
            ) : (
              <rect
                x={-58}
                y={-16}
                width={116}
                height={32}
                rx={2}
                fill={BLUE}
                stroke={BLACK}
                strokeWidth={2.5}
                style={{ filter: "drop-shadow(2px 2px 0 #0B0B0B)" }}
              />
            )}
            <text
              textAnchor="middle"
              y={isPerson ? 5 : 4}
              fontSize={isPerson ? 13 : 11}
              fontWeight={800}
              fill={isPerson ? BLACK : "#FFFFFF"}
            >
              {isPerson ? node.label.split(" ")[0] : truncate(node.label, 17)}
            </text>
            {!isPerson && (
              <text textAnchor="middle" y={24} fontSize={9} fontWeight={700} fill={BLACK}>
                {node.year ?? ""}
              </text>
            )}
            {endpoint && (
              <circle
                r={25}
                fill="none"
                stroke={BLACK}
                strokeWidth={2}
                strokeDasharray="4 3"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
