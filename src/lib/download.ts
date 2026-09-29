import { slugify } from "@/lib/slug";
import type { Template } from "@/lib/types";

/**
 * Filename a template saves as. Images live in /public, so downloads are same-origin
 * and a plain `<a download>` is enough — no blob juggling, which keeps PRD §42's
 * "fewest clicks between search and download" honest.
 */
export function downloadFileName(template: Template): string {
  const parts = [template.dialogue, template.movie.name].map(slugify).filter(Boolean);
  return `${parts.join("-")}.png`;
}
