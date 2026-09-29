/**
 * The single data-access boundary.
 *
 * Pages and components must never import from `src/data/*` directly — everything
 * goes through here. That one indirection is what makes the roadmap's "real
 * database" phase (PRD §40) a rewrite of this file rather than of the whole app.
 *
 * All indexes are built once at module load. With 300 templates that is trivial,
 * and it keeps every call site a synchronous map lookup.
 */
import { templates } from "@/data/templates";
import { movies, movieById } from "@/data/movies";
import { actors, actorById } from "@/data/actors";
import { emotions, emotionById } from "@/data/emotions";
import { dialogueSlug } from "@/lib/slug";
import type { Actor, Emotion, EmotionId, Movie, Template } from "@/lib/types";

// ── Indexes ──────────────────────────────────────────────────────────────────

const byId = new Map<string, Template>();
const byMovie = new Map<string, Template[]>();
const byActor = new Map<string, Template[]>();
const byEmotion = new Map<string, Template[]>();
const byDialogueSlug = new Map<string, Template[]>();

for (const t of templates) {
  byId.set(t.id, t);
  push(byMovie, t.movie.id, t);
  push(byActor, t.actor.id, t);
  push(byEmotion, t.emotion, t);
  push(byDialogueSlug, dialogueSlug(t.dialogue), t);
}

function push(map: Map<string, Template[]>, key: string, t: Template) {
  const list = map.get(key);
  if (list) list.push(t);
  else map.set(key, [t]);
}

// ── Ordering helpers ─────────────────────────────────────────────────────────

/** Most-downloaded first; id breaks ties so ordering is stable across renders. */
const byPopularity = (a: Template, b: Template) =>
  b.downloads - a.downloads || a.id.localeCompare(b.id);

/** Newest first, falling back to popularity for same-day templates. */
const byRecency = (a: Template, b: Template) =>
  b.createdAt.localeCompare(a.createdAt) || byPopularity(a, b);

// ── Templates ────────────────────────────────────────────────────────────────

export function getAllTemplates(): Template[] {
  return templates;
}

export function getTemplate(id: string): Template | undefined {
  return byId.get(id);
}

export function getTemplateCount(): number {
  return templates.length;
}

export function getTrendingTemplates(limit = 20): Template[] {
  return [...templates].sort(byPopularity).slice(0, limit);
}

export function getLatestTemplates(limit = 20): Template[] {
  return [...templates].sort(byRecency).slice(0, limit);
}

export function getTemplatesByMovie(movieId: string, limit?: number): Template[] {
  const list = [...(byMovie.get(movieId) ?? [])].sort(byPopularity);
  return limit ? list.slice(0, limit) : list;
}

export function getTemplatesByActor(actorId: string, limit?: number): Template[] {
  const list = [...(byActor.get(actorId) ?? [])].sort(byPopularity);
  return limit ? list.slice(0, limit) : list;
}

export function getTemplatesByEmotion(emotion: EmotionId, limit?: number): Template[] {
  const list = [...(byEmotion.get(emotion) ?? [])].sort(byPopularity);
  return limit ? list.slice(0, limit) : list;
}

/**
 * PRD §20: related content on a template page is three rails — more from this
 * movie, more from this actor, more of this emotion. The current template is always
 * excluded; a rail with nothing left in it is returned empty so the page can skip it.
 */
export function getRelatedTemplates(template: Template, limit = 12) {
  const exclude = (list: Template[]) => list.filter((t) => t.id !== template.id).slice(0, limit);
  return {
    fromMovie: exclude(getTemplatesByMovie(template.movie.id)),
    fromActor: exclude(getTemplatesByActor(template.actor.id)),
    sameEmotion: exclude(getTemplatesByEmotion(template.emotion)),
  };
}

// ── Movies ───────────────────────────────────────────────────────────────────

export type MovieSummary = Movie & {
  templateCount: number;
  downloads: number;
  poster: string;
  leadActorName: string;
};

function summariseMovie(movie: Movie): MovieSummary {
  const list = byMovie.get(movie.id) ?? [];
  return {
    ...movie,
    templateCount: list.length,
    downloads: list.reduce((sum, t) => sum + t.downloads, 0),
    poster: `/movies/${movie.id}.png`,
    leadActorName: actorById.get(movie.leadActorId)?.name ?? "",
  };
}

export function getAllMovies(): MovieSummary[] {
  return movies.map(summariseMovie).sort((a, b) => a.name.localeCompare(b.name));
}

export function getMovie(id: string): MovieSummary | undefined {
  const movie = movieById.get(id);
  return movie ? summariseMovie(movie) : undefined;
}

export function getPopularMovies(limit = 12): MovieSummary[] {
  return movies
    .map(summariseMovie)
    .sort((a, b) => b.downloads - a.downloads || a.name.localeCompare(b.name))
    .slice(0, limit);
}

// ── Actors ───────────────────────────────────────────────────────────────────

export type ActorSummary = Actor & {
  templateCount: number;
  downloads: number;
  portrait: string;
};

function summariseActor(actor: Actor): ActorSummary {
  const list = byActor.get(actor.id) ?? [];
  return {
    ...actor,
    templateCount: list.length,
    downloads: list.reduce((sum, t) => sum + t.downloads, 0),
    portrait: `/actors/${actor.id}.png`,
  };
}

export function getAllActors(): ActorSummary[] {
  return actors.map(summariseActor).sort((a, b) => a.name.localeCompare(b.name));
}

export function getActor(id: string): ActorSummary | undefined {
  const actor = actorById.get(id);
  return actor ? summariseActor(actor) : undefined;
}

export function getPopularActors(limit = 12): ActorSummary[] {
  return actors
    .map(summariseActor)
    .sort((a, b) => b.downloads - a.downloads || a.name.localeCompare(b.name))
    .slice(0, limit);
}

// ── Emotions ─────────────────────────────────────────────────────────────────

export type EmotionSummary = Emotion & { templateCount: number; downloads: number };

function summariseEmotion(emotion: Emotion): EmotionSummary {
  const list = byEmotion.get(emotion.id) ?? [];
  return {
    ...emotion,
    templateCount: list.length,
    downloads: list.reduce((sum, t) => sum + t.downloads, 0),
  };
}

export function getAllEmotions(): EmotionSummary[] {
  return emotions.map(summariseEmotion);
}

export function getEmotion(id: string): EmotionSummary | undefined {
  const emotion = emotionById.get(id as EmotionId);
  return emotion ? summariseEmotion(emotion) : undefined;
}

export function getPopularEmotions(limit = 15): EmotionSummary[] {
  return emotions
    .map(summariseEmotion)
    .sort((a, b) => b.templateCount - a.templateCount)
    .slice(0, limit);
}

/** The emotions actually present in a set — drives the per-emotion rails in PRD §22/§24. */
export function getEmotionsPresentIn(list: Template[]): EmotionSummary[] {
  const present = new Set(list.map((t) => t.emotion));
  return emotions.filter((e) => present.has(e.id)).map(summariseEmotion);
}

// ── Dialogues ────────────────────────────────────────────────────────────────

export type DialogueSummary = {
  slug: string;
  text: string;
  /** The most popular template using this line — what the dialogue card shows. */
  lead: Template;
  templateCount: number;
  downloads: number;
};

function summariseDialogue(slug: string, list: Template[]): DialogueSummary {
  const sorted = [...list].sort(byPopularity);
  return {
    slug,
    text: sorted[0].dialogue,
    lead: sorted[0],
    templateCount: sorted.length,
    downloads: sorted.reduce((sum, t) => sum + t.downloads, 0),
  };
}

export function getAllDialogues(): DialogueSummary[] {
  return [...byDialogueSlug.entries()]
    .map(([slug, list]) => summariseDialogue(slug, list))
    .sort((a, b) => b.downloads - a.downloads);
}

export function getDialogue(slug: string): DialogueSummary | undefined {
  const list = byDialogueSlug.get(slug);
  return list ? summariseDialogue(slug, list) : undefined;
}

export function getTemplatesByDialogue(slug: string): Template[] {
  return [...(byDialogueSlug.get(slug) ?? [])].sort(byPopularity);
}

export function getPopularDialogues(limit = 20): DialogueSummary[] {
  return getAllDialogues().slice(0, limit);
}

// ── Hero ─────────────────────────────────────────────────────────────────────

/** PRD §13: the hero features one template. Most-downloaded, deterministically. */
export function getHeroTemplate(): Template {
  return getTrendingTemplates(1)[0];
}

export { emotionById };
