"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import type { CoStar, PersonDetail } from "@/lib/types";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";

interface PersonResponse {
  person: PersonDetail;
  coStars: CoStar[];
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <Box className="mb-4 flex items-center" sx={{ borderBottom: "3px solid #0B0B0B", pb: 1 }}>
      <Typography variant="h5" component="h2">
        {children}
      </Typography>
    </Box>
  );
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
      <div className="pt-10 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton variant="rectangular" width={64} height={64} sx={{ border: "2px solid #0B0B0B" }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="45%" sx={{ fontSize: "2rem" }} />
            <Skeleton variant="text" width="30%" sx={{ fontSize: "1rem" }} />
          </Box>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} variant="rectangular" height={88} sx={{ border: "2px solid #0B0B0B" }} />
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
        <span className="grid h-16 w-16 place-items-center border-2 border-[#0B0B0B] bg-[#FFE600] text-xl font-black shadow-[4px_4px_0_#0B0B0B]">
          {initials}
        </span>
        <Box sx={{ minWidth: 220 }}>
          <Typography variant="h3" component="h1">
            {person.name}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: "#6B6B6B" }}>
            {person.born ? `Born ${person.born}` : "Birth year unknown"} ·{" "}
            {person.actedIn.length} films as actor · {person.directed.length} as
            director
          </Typography>
        </Box>
        <Box sx={{ ml: "auto" }}>
          <Button variant="contained" color="secondary" href={`/connect?from=${person.id}`}>
            Find their connections →
          </Button>
        </Box>
      </section>

      {person.actedIn.length > 0 && (
        <section className="mt-10">
          <SectionHeading>Filmography</SectionHeading>
          <Box component="ul" sx={{ p: 0, m: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 1 }}>
            {person.actedIn.map((item) => (
              <Box component="li" key={item.id}>
                <Link
                  href={`/movie/${item.id}`}
                  className="group flex flex-wrap items-baseline gap-x-3 border-2 border-[#0B0B0B] bg-[#FFFFFF] px-4 py-2.5 shadow-[3px_3px_0_#0B0B0B] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#0B0B0B]"
                >
                  <span className="border-2 border-[#0B0B0B] bg-[#0B0B0B] px-1.5 py-0.5 text-[10px] font-black text-white">
                    {item.year}
                  </span>
                  <span className="text-sm font-extrabold group-hover:underline group-hover:decoration-[#FF4D6D] group-hover:decoration-2">
                    {item.title}
                  </span>
                  {item.role && (
                    <span className="text-xs font-semibold text-[#6B6B6B]">
                      as {item.role}
                    </span>
                  )}
                  {item.director && (
                    <span className="ml-auto text-xs font-semibold text-[#6B6B6B]">
                      dir. {item.director}
                    </span>
                  )}
                </Link>
              </Box>
            ))}
          </Box>
        </section>
      )}

      {coStars.length > 0 && (
        <section className="mt-10">
          <SectionHeading>Most frequent co-stars</SectionHeading>
          <Typography variant="body2" sx={{ mb: 3, fontWeight: 600, maxWidth: 640 }}>
            Ranked by counting shared movies — a 2-hop traversal from{" "}
            {person.name}’s node.
          </Typography>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {coStars.map((coStar) => (
              <Link
                key={coStar.id}
                href={`/person/${coStar.id}`}
                className="group flex items-center gap-3 border-2 border-[#0B0B0B] bg-[#FFFFFF] p-3 shadow-[3px_3px_0_#0B0B0B] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#0B0B0B]"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center border-2 border-[#0B0B0B] bg-[#3DDC97] text-xs font-black shadow-[2px_2px_0_#0B0B0B]">
                  {coStar.name
                    .split(" ")
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-extrabold group-hover:underline group-hover:decoration-[#FF4D6D] group-hover:decoration-2">
                    {coStar.name}
                  </span>
                  <span className="block truncate text-xs font-semibold text-[#6B6B6B]">
                    together in {coStar.with.join(" · ")}
                  </span>
                </span>
                <span className="shrink-0 border-2 border-[#0B0B0B] bg-[#FFE600] px-1.5 py-0.5 text-[11px] font-black shadow-[2px_2px_0_#0B0B0B]">
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