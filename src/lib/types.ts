/**
 * Core domain types.
 *
 * PRD §4 and §5: a template has exactly four pieces of metadata — dialogue, movie,
 * actor, emotion. There is deliberately no `situation`, `description` or `useCase`
 * field. The dialogue *is* the scene description. Resist adding more here; extra
 * fields dilute the search index and invite inconsistent authoring.
 */

export type EmotionId =
  | "angry"
  | "happy"
  | "sad"
  | "confused"
  | "shocked"
  | "excited"
  | "frustrated"
  | "disappointed"
  | "emotional"
  | "scared"
  | "surprised"
  | "laughing"
  | "crying"
  | "love"
  | "serious";

export type Emotion = {
  id: EmotionId;
  name: string;
  emoji: string;
  /** Hex accent used for emotion cards and badge tinting. */
  accent: string;
};

export type Actor = {
  /** Slug — doubles as the /actors/:slug route segment. */
  id: string;
  name: string;
};

export type Movie = {
  /** Slug — doubles as the /movies/:slug route segment. */
  id: string;
  name: string;
  year: number;
  leadActorId: string;
};

/** Movie as denormalised onto a template (PRD §29). */
export type MovieRef = Pick<Movie, "id" | "name" | "year">;
export type ActorRef = Pick<Actor, "id" | "name">;

export type Template = {
  id: string;
  image: string;
  dialogue: string;
  movie: MovieRef;
  actor: ActorRef;
  emotion: EmotionId;
  downloads: number;
  /** ISO date (YYYY-MM-DD). Drives the "Latest Templates" rail. */
  createdAt: string;
};

/** An entry in the curated dialogue pool that the seed script expands into templates. */
export type DialogueSeed = {
  text: string;
  movieId: string;
  actorId: string;
  emotion: EmotionId;
};
