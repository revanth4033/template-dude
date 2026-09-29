/**
 * Client-side search (PRD §31).
 *
 * No external engine, as the PRD requires — with 300 records a scored linear scan
 * is faster than the network call any hosted index would need, and it means search
 * works with the tab offline.
 *
 * The ranking rule that matters is PRD §31's "rank results matching multiple terms
 * first". That is enforced structurally rather than by weighting: `matchedTerms` is
 * the primary sort key, so a template matching both "mahesh" and "angry" always
 * outranks one matching only "mahesh", no matter how strong that single match is.
 *
 * On top of that, an all-terms match is treated as a filter when one exists: if any
 * template matches every term, only those are returned. That is what makes
 * "mahesh angry" behave like a filter rather than like "everything Mahesh Babu".
 * When nothing matches everything, it degrades to partial matches rather than
 * showing an empty page.
 */
import { getAllTemplates } from "@/lib/queries";
import { emotionById } from "@/data/emotions";
import type { Template } from "@/lib/types";

export type SearchField = "dialogue" | "movie" | "actor" | "emotion";

export type SearchResult = {
  template: Template;
  score: number;
  matchedTerms: number;
  /** Which of the four dimensions this template matched on — drives result hints. */
  fields: SearchField[];
};

/** PRD §4's four dimensions, weighted by how specific a match on each one is. */
const FIELD_WEIGHTS: Record<SearchField, number> = {
  dialogue: 5,
  actor: 4,
  movie: 4,
  emotion: 3,
};

export function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(input: string): string[] {
  const n = normalize(input);
  return n ? n.split(" ") : [];
}

type IndexEntry = {
  template: Template;
  text: Record<SearchField, string>;
  tokens: Record<SearchField, string[]>;
};

/** Built once at module load — 300 entries, so cost is negligible. */
const index: IndexEntry[] = getAllTemplates().map((template) => {
  const emotion = emotionById.get(template.emotion);
  const text: Record<SearchField, string> = {
    dialogue: normalize(template.dialogue),
    movie: normalize(template.movie.name),
    actor: normalize(template.actor.name),
    emotion: normalize(emotion?.name ?? template.emotion),
  };
  return {
    template,
    text,
    tokens: {
      dialogue: text.dialogue.split(" ").filter(Boolean),
      movie: text.movie.split(" ").filter(Boolean),
      actor: text.actor.split(" ").filter(Boolean),
      emotion: text.emotion.split(" ").filter(Boolean),
    },
  };
});

const FIELDS: SearchField[] = ["dialogue", "movie", "actor", "emotion"];

/** How well one query term matches one field: exact token > prefix > substring. */
function matchQuality(entry: IndexEntry, field: SearchField, term: string): number {
  const tokens = entry.tokens[field];
  if (tokens.includes(term)) return 1;
  if (tokens.some((t) => t.startsWith(term))) return 0.7;
  if (entry.text[field].includes(term)) return 0.4;
  return 0;
}

export function search(query: string, fields: SearchField[] = FIELDS): SearchResult[] {
  const terms = tokenize(query);
  if (terms.length === 0) return [];

  const fullQuery = normalize(query);
  const results: SearchResult[] = [];

  for (const entry of index) {
    let score = 0;
    let matchedTerms = 0;
    const matchedFields = new Set<SearchField>();

    for (const term of terms) {
      let best = 0;
      for (const field of fields) {
        const quality = matchQuality(entry, field, term);
        if (quality === 0) continue;
        matchedFields.add(field);
        best = Math.max(best, quality * FIELD_WEIGHTS[field]);
      }
      if (best > 0) {
        matchedTerms += 1;
        score += best;
      }
    }

    if (matchedTerms === 0) continue;

    // A whole-phrase hit on the dialogue is the strongest possible signal — it means
    // the user typed the line they already had in mind (PRD §15's fourth example).
    if (fields.includes("dialogue")) {
      if (entry.text.dialogue === fullQuery) score += 50;
      else if (entry.text.dialogue.startsWith(fullQuery)) score += 20;
      else if (entry.text.dialogue.includes(fullQuery)) score += 10;
    }

    results.push({
      template: entry.template,
      score,
      matchedTerms,
      fields: FIELDS.filter((f) => matchedFields.has(f)),
    });
  }

  // Prefer the strict all-terms interpretation when it yields anything.
  const complete = results.filter((r) => r.matchedTerms === terms.length);
  const pool = complete.length > 0 ? complete : results;

  return pool.sort(
    (a, b) =>
      b.matchedTerms - a.matchedTerms ||
      b.score - a.score ||
      b.template.downloads - a.template.downloads ||
      a.template.id.localeCompare(b.template.id),
  );
}
