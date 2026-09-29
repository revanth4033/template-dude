/**
 * Slug helpers.
 *
 * Movies, actors and emotions use their slug as their id, so they need no conversion.
 * Dialogues have no id of their own — PRD §37 routes them at /dialogues/:slug — so a
 * dialogue's slug is derived from its text and must round-trip reliably.
 */

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['"’”“]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function dialogueSlug(dialogue: string): string {
  return slugify(dialogue);
}
