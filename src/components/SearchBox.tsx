"use client";

import { useEffect, useRef, useState } from "react";
import type { MovieSummary } from "@/lib/types";
import Link from "next/link";

interface Suggestion {
  id: string;
  title: string;
  year: number;
}

export default function SearchBox({
  onSelect,
  placeholder = "Search movies…",
  autoFocus = false,
}: {
  onSelect?: (movie: MovieSummary) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const q = query.trim();
      if (q.length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/movies?q=${encodeURIComponent(q)}`, {
          cache: "no-store",
        });
        const data = await res.json();
        setResults(
          (data.movies ?? []).map((movie: MovieSummary) => ({
            id: movie.id,
            title: movie.title,
            year: movie.year,
          })),
        );
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const pick = (suggestion: Suggestion) => {
    setQuery(suggestion.title);
    setOpen(false);
    onSelect?.({
      id: suggestion.id,
      title: suggestion.title,
      year: suggestion.year,
      genres: [],
      cast: [],
    });
  };

  return (
    <div ref={boxRef} className="relative w-full">
      <div className="flex items-center gap-2 rounded-xl border border-edge bg-surface px-3.5 py-2.5 focus-within:border-accent/70">
        <svg
          className="h-4 w-4 shrink-0 text-muted"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          value={query}
          autoFocus={autoFocus}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(-1);
          }}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActive((a) => Math.min(a + 1, results.length - 1));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActive((a) => Math.max(a - 1, -1));
            } else if (event.key === "Enter" && active >= 0 && results[active]) {
              pick(results[active]);
            } else if (event.key === "Escape") {
              setOpen(false);
            }
          }}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
          aria-label="Search movies"
        />
        {loading && (
          <span className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-edge border-t-accent" />
        )}
      </div>

      {open && query.trim().length >= 2 && (
        <ul className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-xl border border-edge bg-surface shadow-xl">
          {results.length === 0 && !loading ? (
            <li className="px-4 py-3 text-sm text-muted">
              No movies match “{query.trim()}”.
            </li>
          ) : (
            results.map((suggestion, index) => (
              <li key={suggestion.id}>
                <button
                  type="button"
                  onClick={() => pick(suggestion)}
                  onMouseEnter={() => setActive(index)}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
                    index === active ? "bg-surface2" : ""
                  }`}
                >
                  <span className="truncate">{suggestion.title}</span>
                  <span className="shrink-0 text-xs text-muted">
                    {suggestion.year}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}

      <Link
        href="/connect"
        className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-accent"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        or explore how people are connected
      </Link>
    </div>
  );
}