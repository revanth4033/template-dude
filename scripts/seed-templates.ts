/**
 * Expands the curated dialogue pool into the full template library.
 *
 *   npm run seed
 *
 * Writes src/data/templates.ts. Deterministic: a fixed RNG seed means re-running
 * produces byte-identical output, so the generated file diffs cleanly and template
 * ids stay stable across runs (important — ids are URLs).
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { dialogueSeeds } from "../src/data/dialogues";
import { emotions } from "../src/data/emotions";
import { movieById } from "../src/data/movies";
import { actorById } from "../src/data/actors";
import type { EmotionId, Template } from "../src/lib/types";

const TARGET_COUNT = 300;
const RNG_SEED = 20260921;
/** Templates are dated backwards from here so "Latest" is meaningful. */
const CATALOGUE_DATE = new Date("2026-09-21T00:00:00Z");
const CATALOGUE_WINDOW_DAYS = 180;

/** mulberry32 — small, fast, deterministic. */
function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = makeRng(RNG_SEED);

/**
 * Download counts follow a power law rather than a uniform spread. A flat
 * distribution makes the "Trending" rail look arbitrary — real libraries have a
 * handful of runaway templates and a long tail of rarely-used ones.
 */
function downloadCount(): number {
  return Math.max(12, Math.round(8000 * Math.pow(rng(), 5)));
}

function createdAt(): string {
  const daysAgo = Math.floor(rng() * CATALOGUE_WINDOW_DAYS);
  const d = new Date(CATALOGUE_DATE);
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function pad(n: number): string {
  return String(n).padStart(3, "0");
}

// ── Build ────────────────────────────────────────────────────────────────────

const templates: Template[] = [];
const seen = new Set<string>(); // guards against duplicate dialogue+emotion pairs

function push(text: string, movieId: string, actorId: string, emotion: EmotionId) {
  const key = `${text}::${emotion}`;
  if (seen.has(key)) return false;

  const movie = movieById.get(movieId);
  const actor = actorById.get(actorId);
  if (!movie) throw new Error(`Unknown movie id "${movieId}" for dialogue "${text}"`);
  if (!actor) throw new Error(`Unknown actor id "${actorId}" for dialogue "${text}"`);

  seen.add(key);
  const id = `tpl-${pad(templates.length + 1)}`;
  templates.push({
    id,
    image: `/templates/${id}.png`,
    dialogue: text,
    movie: { id: movie.id, name: movie.name, year: movie.year },
    actor: { id: actor.id, name: actor.name },
    emotion,
    downloads: downloadCount(),
    createdAt: createdAt(),
  });
  return true;
}

// One template per curated dialogue.
for (const seed of dialogueSeeds) {
  push(seed.text, seed.movieId, seed.actorId, seed.emotion);
}

/*
 * Pad to TARGET_COUNT with emotion variants of existing dialogues. This isn't
 * padding for its own sake: one scene genuinely yields several usable frames, and
 * the same line delivered at a different beat is a different template. The variant
 * emotion is drawn from a neighbour set so "Thaggede le" can be angry or serious
 * but never "love".
 */
const variantNeighbours: Record<EmotionId, EmotionId[]> = {
  angry: ["frustrated", "serious", "shocked"],
  happy: ["laughing", "excited", "love"],
  sad: ["crying", "emotional", "disappointed"],
  confused: ["surprised", "shocked", "serious"],
  shocked: ["surprised", "scared", "confused"],
  excited: ["happy", "surprised", "laughing"],
  frustrated: ["angry", "disappointed", "serious"],
  disappointed: ["sad", "frustrated", "serious"],
  emotional: ["sad", "love", "crying"],
  scared: ["shocked", "confused", "sad"],
  surprised: ["shocked", "excited", "confused"],
  laughing: ["happy", "excited"],
  crying: ["sad", "emotional"],
  love: ["emotional", "happy"],
  serious: ["angry", "confused", "disappointed"],
};

const emotionCounts = new Map<EmotionId, number>();
for (const t of templates) {
  emotionCounts.set(t.emotion, (emotionCounts.get(t.emotion) ?? 0) + 1);
}

let guard = 0;
while (templates.length < TARGET_COUNT && guard < 20000) {
  guard += 1;
  const seed = dialogueSeeds[Math.floor(rng() * dialogueSeeds.length)];

  /*
   * Pick the *least represented* neighbour rather than a random one. The curated
   * pool leans heavily on a few emotions (a lot of lines read as "serious"), and
   * random padding amplifies that skew instead of correcting it — leaving browse
   * pages like /emotions/crying with two templates on them, which reads as broken.
   * Biasing toward thin emotions keeps every one of the 15 worth visiting while
   * still only ever assigning an emotion that fits the line.
   */
  const emotion = [...variantNeighbours[seed.emotion]].sort(
    (a, b) => (emotionCounts.get(a) ?? 0) - (emotionCounts.get(b) ?? 0) || a.localeCompare(b),
  )[0];

  if (push(seed.text, seed.movieId, seed.actorId, emotion)) {
    emotionCounts.set(emotion, (emotionCounts.get(emotion) ?? 0) + 1);
  }
}

if (templates.length < TARGET_COUNT) {
  throw new Error(
    `Only produced ${templates.length}/${TARGET_COUNT} templates — the dialogue pool ` +
      `is too small to fill the target without duplicates. Add more dialogues.`,
  );
}

// ── Emit ─────────────────────────────────────────────────────────────────────

const body = templates
  .map((t) => {
    const dialogue = JSON.stringify(t.dialogue);
    return `  {
    id: ${JSON.stringify(t.id)},
    image: ${JSON.stringify(t.image)},
    dialogue: ${dialogue},
    movie: { id: ${JSON.stringify(t.movie.id)}, name: ${JSON.stringify(t.movie.name)}, year: ${t.movie.year} },
    actor: { id: ${JSON.stringify(t.actor.id)}, name: ${JSON.stringify(t.actor.name)} },
    emotion: ${JSON.stringify(t.emotion)},
    downloads: ${t.downloads},
    createdAt: ${JSON.stringify(t.createdAt)},
  },`;
  })
  .join("\n");

const file = `// GENERATED FILE — do not edit by hand.
// Run \`npm run seed\` to regenerate from src/data/dialogues.ts.
import type { Template } from "@/lib/types";

export const templates: Template[] = [
${body}
];
`;

const out = resolve(import.meta.dirname, "../src/data/templates.ts");
writeFileSync(out, file, "utf8");

// A quick distribution report, so a bad seed is obvious at generation time.
const perEmotion = new Map<string, number>();
for (const t of templates) perEmotion.set(t.emotion, (perEmotion.get(t.emotion) ?? 0) + 1);
const missing = emotions.filter((e) => !perEmotion.has(e.id));

console.log(`✓ ${templates.length} templates → src/data/templates.ts`);
console.log(`  movies covered:   ${new Set(templates.map((t) => t.movie.id)).size}`);
console.log(`  actors covered:   ${new Set(templates.map((t) => t.actor.id)).size}`);
console.log(`  emotions covered: ${perEmotion.size}/${emotions.length}`);
if (missing.length) {
  console.warn(`  ⚠ no templates for: ${missing.map((e) => e.name).join(", ")}`);
}
