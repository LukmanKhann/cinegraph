"use client";

import { useEffect, useRef, useState } from "react";

export interface PickerItem {
  id: string;
  label: string;
  sub?: string | null;
}

export default function PersonPicker({
  value,
  onChange,
  kind,
  placeholder,
  excludeId,
}: {
  value: PickerItem | null;
  onChange: (item: PickerItem | null) => void;
  kind: "person" | "movie";
  placeholder: string;
  excludeId?: string | null;
}) {
  const [query, setQuery] = useState(value?.label ?? "");
  const [results, setResults] = useState<PickerItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const q = query.trim();
      if (q.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const endpoint = kind === "person" ? "people" : "movies";
        const res = await fetch(`/api/${endpoint}?q=${encodeURIComponent(q)}`, {
          cache: "no-store",
        });
        const data = await res.json();
        const list: PickerItem[] = kind === "person"
          ? (data.people ?? []).map((p: { id: string; name: string; born: number | null }) => ({
              id: p.id,
              label: p.name,
              sub: p.born ? `b. ${p.born}` : null,
            }))
          : (data.movies ?? []).map((m: { id: string; title: string; year: number }) => ({
              id: m.id,
              label: m.title,
              sub: String(m.year),
            }));
        setResults(list.filter((item) => item.id !== excludeId));
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, kind, excludeId]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const pick = (item: PickerItem) => {
    setQuery(item.label);
    setOpen(false);
    onChange(item);
  };

  return (
    <div ref={boxRef} className="relative w-full">
      <input
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setActive(-1);
          if (value && value.label !== event.target.value) onChange(null);
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
        className="w-full rounded-xl border border-edge bg-surface px-3.5 py-2.5 text-sm outline-none placeholder:text-muted focus:border-accent/70"
        aria-label={placeholder}
      />
      {loading && (
        <span className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin rounded-full border-2 border-edge border-t-accent" />
      )}
      {open && query.trim().length >= 2 && (
        <ul className="absolute z-30 mt-1.5 max-h-56 w-full overflow-y-auto rounded-xl border border-edge bg-surface shadow-xl">
          {results.length === 0 && !loading ? (
            <li className="px-4 py-3 text-sm text-muted">
              No {kind === "person" ? "people" : "movies"} match “{query.trim()}”.
            </li>
          ) : (
            results.map((item, index) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => pick(item)}
                  onMouseEnter={() => setActive(index)}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
                    index === active ? "bg-surface2" : ""
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                  {item.sub && (
                    <span className="shrink-0 text-xs text-muted">{item.sub}</span>
                  )}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}