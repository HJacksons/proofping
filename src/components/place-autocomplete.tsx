"use client";

import { useEffect, useId, useRef, useState } from "react";

import type { PlaceSuggestion } from "@/lib/places/validation";

type PlaceAutocompleteProps = {
  label: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  helpText?: string;
  required?: boolean;
  inputClassName?: string;
};

export function PlaceAutocomplete({
  label,
  name,
  value,
  onChange,
  placeholder = "Start typing a place…",
  maxLength = 160,
  helpText,
  required = false,
  inputClassName = "min-h-12 w-full rounded-md border border-line bg-background px-4 text-base outline-none focus:border-accent",
}: PlaceAutocompleteProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [highlight, setHighlight] = useState(-1);

  useEffect(() => {
    const query = value.trim();

    if (query.length < 2) {
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError(null);

      void fetch(`/api/places?q=${encodeURIComponent(query)}&limit=6`)
        .then(async (response) => {
          const payload = (await response.json()) as {
            places?: PlaceSuggestion[];
            error?: string;
          };

          if (cancelled) {
            return;
          }

          if (!response.ok) {
            setSuggestions([]);
            setError(payload.error ?? "Unable to search places.");
            return;
          }

          setSuggestions(payload.places ?? []);
          setOpen(true);
          setHighlight(-1);
        })
        .catch(() => {
          if (!cancelled) {
            setSuggestions([]);
            setError("Unable to search places.");
          }
        })
        .finally(() => {
          if (!cancelled) {
            setLoading(false);
          }
        });
    }, 280);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [value]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function pick(place: PlaceSuggestion) {
    onChange(place.label);
    setSuggestions([]);
    setOpen(false);
    setHighlight(-1);
    setError(null);
  }

  function handleChange(next: string) {
    onChange(next);

    if (next.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
      setError(null);
      setHighlight(-1);
      return;
    }

    setOpen(true);
  }

  return (
    <div className="relative grid gap-1.5" ref={rootRef}>
      <label className="grid gap-1.5">
        <span className="text-sm font-semibold">{label}</span>
        {helpText ? <span className="text-sm text-muted">{helpText}</span> : null}
        <input
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={open && suggestions.length > 0}
          autoComplete="off"
          className={inputClassName}
          maxLength={maxLength}
          name={name}
          onChange={(event) => handleChange(event.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) {
              setOpen(true);
            }
          }}
          onKeyDown={(event) => {
            if (!open || suggestions.length === 0) {
              return;
            }

            if (event.key === "ArrowDown") {
              event.preventDefault();
              setHighlight((current) =>
                current < suggestions.length - 1 ? current + 1 : 0,
              );
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setHighlight((current) =>
                current > 0 ? current - 1 : suggestions.length - 1,
              );
            } else if (event.key === "Enter" && highlight >= 0) {
              event.preventDefault();
              const place = suggestions[highlight];
              if (place) {
                pick(place);
              }
            } else if (event.key === "Escape") {
              setOpen(false);
            }
          }}
          placeholder={placeholder}
          required={required}
          role="combobox"
          value={value}
        />
      </label>

      {loading ? (
        <p className="text-xs text-muted" role="status">
          Searching places…
        </p>
      ) : null}

      {error ? (
        <p className="text-xs text-amber-800" role="alert">
          {error}
        </p>
      ) : null}

      {open && suggestions.length > 0 ? (
        <ul
          className="absolute top-full z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border border-line bg-surface py-1 shadow-lg"
          id={listId}
          role="listbox"
        >
          {suggestions.map((place, index) => (
            <li
              aria-selected={highlight === index}
              key={place.id}
              role="option"
            >
              <button
                className={[
                  "grid w-full gap-0.5 px-3 py-2.5 text-left text-sm",
                  highlight === index
                    ? "bg-accent-soft text-accent-strong"
                    : "hover:bg-foreground/5",
                ].join(" ")}
                onMouseDown={(event) => {
                  event.preventDefault();
                  pick(place);
                }}
                type="button"
              >
                <span className="font-semibold">{place.label}</span>
                {place.detail ? (
                  <span className="text-xs text-muted">{place.detail}</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
