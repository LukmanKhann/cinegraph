"use client";

import { useEffect, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import SearchIcon from "@mui/icons-material/Search";

export interface PickerItem {
  id: string;
  label: string;
  sub?: string | null;
}

interface PersonLike {
  id: string;
  name: string;
  born: number | null;
}

interface MovieLike {
  id: string;
  title: string;
  year: number;
}

export default function AsyncPicker({
  kind,
  placeholder,
  value = null,
  onChange,
  onSelect,
  excludeId = null,
  autoFocus = false,
}: {
  kind: "person" | "movie";
  placeholder: string;
  value?: PickerItem | null;
  onChange?: (item: PickerItem | null) => void;
  onSelect?: (item: PickerItem) => void;
  excludeId?: string | null;
  autoFocus?: boolean;
}) {
  const [options, setOptions] = useState<PickerItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value?.label ?? "");

  useEffect(() => {
    const timer = setTimeout(async () => {
      const q = inputValue.trim();
      if (q.length < 2) {
        setOptions([]);
        return;
      }
      setLoading(true);
      try {
        const endpoint = kind === "person" ? "people" : "movies";
        const res = await fetch(`/api/${endpoint}?q=${encodeURIComponent(q)}`, {
          cache: "no-store",
        });
        const data = await res.json();
        const list: PickerItem[] =
          kind === "person"
            ? (data.people ?? []).map((p: PersonLike) => ({
                id: p.id,
                label: p.name,
                sub: p.born ? `b. ${p.born}` : null,
              }))
            : (data.movies ?? []).map((m: MovieLike) => ({
                id: m.id,
                label: m.title,
                sub: String(m.year),
              }));
        setOptions(list.filter((item) => item.id !== excludeId));
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue, kind, excludeId]);

  return (
    <Autocomplete<PickerItem, false, false, false>
      autoHighlight={false}
      options={options}
      value={value}
      inputValue={inputValue}
      onChange={(_event, item) => {
        if (item) {
          onChange?.(item);
          onSelect?.(item);
        } else {
          onChange?.(null);
        }
      }}
      onInputChange={(_event, nextValue) => setInputValue(nextValue)}
      getOptionLabel={(option) => option.label}
      loading={loading}
      isOptionEqualToValue={(option, selected) => option.id === selected.id}
      noOptionsText={`No ${kind === "person" ? "people" : "movies"} match`}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;
        return (
          <li key={key} {...optionProps} className="!font-bold">
            <span className="min-w-0 flex-1 truncate">{option.label}</span>
            {option.sub && (
              <span className="shrink-0 text-xs font-semibold text-[var(--cg-muted)]">
                {option.sub}
              </span>
            )}
          </li>
        );
      }}
      renderInput={(params) => {
        const inputProps = params.slotProps.input;
        return (
          <TextField
            {...params}
            placeholder={placeholder}
            autoFocus={autoFocus}
            slotProps={{
              ...params.slotProps,
              input: {
                ...inputProps,
                startAdornment: (
                  <>
                    <SearchIcon sx={{ mr: 1, color: "var(--cg-muted)" }} fontSize="small" />
                    {inputProps?.startAdornment}
                  </>
                ),
                endAdornment: (
                  <>
                    {loading ? (
                      <CircularProgress size={16} sx={{ color: "var(--cg-ink)" }} />
                    ) : null}
                    {inputProps?.endAdornment}
                  </>
                ),
              },
            }}
          />
        );
      }}
    />
  );
}