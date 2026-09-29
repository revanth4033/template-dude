"use client";

import { useEffect, useMemo, useState } from "react";
import { Search as SearchIcon, X } from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { TemplateCard } from "@/components/cards/template-card";
import { EmptyState } from "@/components/grids/template-grid";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { search } from "@/lib/search";
import { emotionById } from "@/data/emotions";
import { cn } from "@/lib/utils";

/**
 * Search results (PRD §17).
 *
 * Searching runs on every keystroke against the in-memory index — no round trip, no
 * debounce, because 300 records score in well under a frame. The URL is kept in sync
 * so a result set stays shareable and the back button behaves, but via
 * `history.replaceState` rather than the router: a router push per keystroke would
 * spam history and re-render the tree for no benefit.
 */

const ALL = "__all__";

/** PRD §17: four filters, one per metadata dimension. No more. */
type Facets = { dialogue: string; movie: string; actor: string; emotion: string };
const NO_FACETS: Facets = { dialogue: ALL, movie: ALL, actor: ALL, emotion: ALL };

export function SearchExperience({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);

  // Facets are stored against the query they were chosen for. A new query makes the
  // old selections meaningless (they may not even exist in the new results), so this
  // derives the reset during render instead of firing an effect to undo it.
  const [facetState, setFacetState] = useState<{ query: string; facets: Facets }>({
    query: initialQuery,
    facets: NO_FACETS,
  });
  const facets = facetState.query === query ? facetState.facets : NO_FACETS;
  const setFacets = (update: (previous: Facets) => Facets) =>
    setFacetState({ query, facets: update(facets) });

  // Keep the address bar in step with what's on screen.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (query.trim()) url.searchParams.set("q", query.trim());
    else url.searchParams.delete("q");
    window.history.replaceState(null, "", url);
  }, [query]);

  const results = useMemo(() => search(query), [query]);

  // Facet options come from the unfiltered result set, so choosing one filter never
  // empties out the others' dropdowns.
  const options = useMemo(() => {
    const dialogue = new Set<string>();
    const movie = new Map<string, string>();
    const actor = new Map<string, string>();
    const emotion = new Set<string>();
    for (const { template } of results) {
      dialogue.add(template.dialogue);
      movie.set(template.movie.id, template.movie.name);
      actor.set(template.actor.id, template.actor.name);
      emotion.add(template.emotion);
    }
    return {
      dialogue: [...dialogue].sort((a, b) => a.localeCompare(b)),
      movie: [...movie].sort((a, b) => a[1].localeCompare(b[1])),
      actor: [...actor].sort((a, b) => a[1].localeCompare(b[1])),
      emotion: [...emotion].sort(),
    };
  }, [results]);

  const filtered = useMemo(
    () =>
      results.filter(({ template }) => {
        if (facets.dialogue !== ALL && template.dialogue !== facets.dialogue) return false;
        if (facets.movie !== ALL && template.movie.id !== facets.movie) return false;
        if (facets.actor !== ALL && template.actor.id !== facets.actor) return false;
        if (facets.emotion !== ALL && template.emotion !== facets.emotion) return false;
        return true;
      }),
    [results, facets],
  );

  const hasQuery = query.trim().length > 0;
  const facetsActive = Object.values(facets).some((v) => v !== ALL);

  return (
    <PageShell>
      <div className="gutter pb-6">
        <label htmlFor="search-input" className="sr-only">
          Search templates
        </label>
        <div className="relative max-w-2xl">
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="search-input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            placeholder="Search movies, dialogues, actors..."
            className="w-full rounded-sm border border-input bg-surface py-3.5 pr-4 pl-12 text-base text-white placeholder:text-muted-foreground focus:border-white/50 focus:outline-none"
          />
        </div>

        {hasQuery && (
          <div className="mt-6">
            <h1 className="text-sm text-muted-foreground">
              Search results for{" "}
              <span className="text-xl font-bold text-white sm:text-2xl">“{query.trim()}”</span>
            </h1>
            <p className="mt-2 text-sm font-semibold text-white" aria-live="polite">
              {filtered.length.toLocaleString()}{" "}
              {filtered.length === 1 ? "Template" : "Templates"}
              {facetsActive && results.length !== filtered.length && (
                <span className="font-normal text-muted-foreground">
                  {" "}
                  of {results.length.toLocaleString()}
                </span>
              )}
            </p>
          </div>
        )}

        {hasQuery && results.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Facet
              label="Dialogue"
              value={facets.dialogue}
              onChange={(v) => setFacets((f) => ({ ...f, dialogue: v }))}
              items={options.dialogue.map((d) => ({ value: d, label: d }))}
            />
            <Facet
              label="Movie"
              value={facets.movie}
              onChange={(v) => setFacets((f) => ({ ...f, movie: v }))}
              items={options.movie.map(([id, name]) => ({ value: id, label: name }))}
            />
            <Facet
              label="Actor"
              value={facets.actor}
              onChange={(v) => setFacets((f) => ({ ...f, actor: v }))}
              items={options.actor.map(([id, name]) => ({ value: id, label: name }))}
            />
            <Facet
              label="Emotion"
              value={facets.emotion}
              onChange={(v) => setFacets((f) => ({ ...f, emotion: v }))}
              items={options.emotion.map((id) => ({
                value: id,
                label: emotionById.get(id as never)?.name ?? id,
              }))}
            />
            {facetsActive && (
              <button
                type="button"
                onClick={() => setFacets(() => NO_FACETS)}
                className="inline-flex items-center gap-1 rounded-sm px-2 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
              >
                <X className="size-3.5" aria-hidden="true" />
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {!hasQuery ? (
        <EmptyState
          title="Search the library"
          hint="Try a dialogue, a movie, an actor, an emotion — or combine them, like “mahesh angry”."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={`No templates match “${query.trim()}”`}
          hint={
            facetsActive
              ? "Try clearing the filters, or search for a movie, actor or emotion."
              : "Try a movie name, an actor, or an emotion like angry or happy."
          }
        />
      ) : (
        <div className="gutter grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map(({ template }) => (
            <TemplateCard
              key={template.id}
              template={template}
              sizes="(max-width: 768px) 46vw, (max-width: 1024px) 30vw, (max-width: 1280px) 23vw, 18vw"
            />
          ))}
        </div>
      )}
    </PageShell>
  );
}

function Facet({
  label,
  value,
  onChange,
  items,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  items: { value: string; label: string }[];
}) {
  // A filter with one option can't filter anything — don't show a dead control.
  if (items.length < 2) return null;

  // Base UI's Select.Value renders the raw value unless given children, which would
  // surface the ALL sentinel in the trigger. Resolve the display label ourselves.
  const selected = items.find((item) => item.value === value);
  const display = selected ? `${label}: ${selected.label}` : `${label}: All`;

  return (
    // This Select can emit null (clearing the value); treat that as "All".
    <Select value={value} onValueChange={(next) => onChange(next ?? ALL)}>
      <SelectTrigger
        aria-label={`Filter by ${label.toLowerCase()}`}
        className={cn(
          "h-9 w-auto min-w-[9rem] max-w-[16rem] border-input bg-surface text-xs text-white",
          value !== ALL && "border-brand/70",
        )}
      >
        <SelectValue>{display}</SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-72">
        <SelectItem value={ALL}>{label}: All</SelectItem>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
