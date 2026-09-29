/**
 * Generates every placeholder image the MVP needs.
 *
 *   npm run placeholders
 *
 * Writes real PNG files at the real paths the app references:
 *   public/templates/tpl-NNN.png   1280×720  (16:9 still)
 *   public/movies/<slug>.png        600×900  (2:3 poster)
 *   public/actors/<slug>.png        600×600  (1:1 portrait)
 *
 * Why real files rather than CSS gradients: next/image, download-as-file and OG
 * images all then work exactly as they will with real screenshots. Swapping in real
 * assets later means dropping files at these paths — no component changes.
 *
 * Each image's colours are derived from a hash of its id, so every card looks
 * distinct and regenerating never reshuffles the palette.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

import { templates } from "../src/data/templates";
import { movies } from "../src/data/movies";
import { actors } from "../src/data/actors";
import { emotionById } from "../src/data/emotions";

const PUBLIC = resolve(import.meta.dirname, "../public");

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Two dark, saturated stops — dark enough that white type stays readable. */
function gradient(seed: string): [string, string] {
  const h = hash(seed);
  const hue = h % 360;
  const hue2 = (hue + 35 + (h % 40)) % 360;
  return [`hsl(${hue} 55% 22%)`, `hsl(${hue2} 60% 8%)`];
}

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!,
  );
}

/**
 * SVG has no automatic text wrapping, so lines are broken here. Width is estimated
 * from an average glyph advance — good enough for placeholder art, and it keeps the
 * script free of a font-metrics dependency.
 */
function wrap(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = w;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

const FONT = "Helvetica Neue, Helvetica, Arial, sans-serif";

async function write(path: string, svg: string) {
  // Palette quantisation: these are flat gradients, so 256 colours with dithering
  // is visually indistinguishable and cuts the library from ~31MB to ~4MB.
  const buf = await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9, palette: true, colours: 256, dither: 1 })
    .toBuffer();
  writeFileSync(path, buf);
}

// ── Template stills ──────────────────────────────────────────────────────────

function templateSvg(
  id: string,
  dialogue: string,
  movie: string,
  actor: string,
  emotion: string,
): string {
  const [a, b] = gradient(id);
  const lines = wrap(dialogue, 26);
  const size = lines.length > 3 ? 62 : lines.length > 2 ? 74 : 86;
  const lineHeight = size * 1.2;
  const blockTop = 360 - ((lines.length - 1) * lineHeight) / 2;

  const dialogueTspans = lines
    .map(
      (l, i) =>
        `<text x="640" y="${blockTop + i * lineHeight}" text-anchor="middle" font-family="${FONT}" font-size="${size}" font-weight="700" fill="#ffffff" letter-spacing="-1">${escapeXml(l)}</text>`,
    )
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${a}"/>
      <stop offset="100%" stop-color="${b}"/>
    </linearGradient>
    <radialGradient id="v" cx="50%" cy="42%" r="75%">
      <stop offset="55%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.65"/>
    </radialGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#g)"/>
  <rect width="1280" height="720" fill="url(#v)"/>
  <text x="640" y="150" text-anchor="middle" font-family="${FONT}" font-size="26" font-weight="600" fill="#ffffff" fill-opacity="0.55" letter-spacing="6">${escapeXml(movie.toUpperCase())}</text>
  ${dialogueTspans}
  <text x="640" y="600" text-anchor="middle" font-family="${FONT}" font-size="30" font-weight="500" fill="#ffffff" fill-opacity="0.8">${escapeXml(actor)}</text>
  <text x="640" y="645" text-anchor="middle" font-family="${FONT}" font-size="24" font-weight="500" fill="#ffffff" fill-opacity="0.45" letter-spacing="3">${escapeXml(emotion.toUpperCase())}</text>
  <text x="640" y="695" text-anchor="middle" font-family="${FONT}" font-size="16" font-weight="500" fill="#ffffff" fill-opacity="0.25" letter-spacing="2">PLACEHOLDER · ${escapeXml(id.toUpperCase())}</text>
</svg>`;
}

// ── Movie posters ────────────────────────────────────────────────────────────

function posterSvg(id: string, name: string, year: number): string {
  const [a, b] = gradient(`movie-${id}`);
  const lines = wrap(name, 14);
  const size = lines.length > 2 ? 52 : 64;
  const lineHeight = size * 1.15;
  const top = 470 - ((lines.length - 1) * lineHeight) / 2;

  const title = lines
    .map(
      (l, i) =>
        `<text x="300" y="${top + i * lineHeight}" text-anchor="middle" font-family="${FONT}" font-size="${size}" font-weight="800" fill="#ffffff" letter-spacing="-1">${escapeXml(l)}</text>`,
    )
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0%" stop-color="${a}"/>
      <stop offset="100%" stop-color="${b}"/>
    </linearGradient>
  </defs>
  <rect width="600" height="900" fill="url(#g)"/>
  <rect x="0" y="600" width="600" height="300" fill="#000" fill-opacity="0.35"/>
  ${title}
  <text x="300" y="${top + lines.length * lineHeight + 26}" text-anchor="middle" font-family="${FONT}" font-size="30" font-weight="500" fill="#ffffff" fill-opacity="0.6" letter-spacing="4">${year}</text>
</svg>`;
}

// ── Actor portraits ──────────────────────────────────────────────────────────

function portraitSvg(id: string, name: string): string {
  const [a, b] = gradient(`actor-${id}`);
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${a}"/>
      <stop offset="100%" stop-color="${b}"/>
    </linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#g)"/>
  <text x="300" y="330" text-anchor="middle" font-family="${FONT}" font-size="200" font-weight="800" fill="#ffffff" fill-opacity="0.9" letter-spacing="-6">${escapeXml(initials)}</text>
  <text x="300" y="520" text-anchor="middle" font-family="${FONT}" font-size="34" font-weight="600" fill="#ffffff" fill-opacity="0.75">${escapeXml(name)}</text>
</svg>`;
}

// ── Run ──────────────────────────────────────────────────────────────────────

async function main() {
  for (const dir of ["templates", "movies", "actors"]) {
    mkdirSync(resolve(PUBLIC, dir), { recursive: true });
  }

  for (const t of templates) {
    const emotion = emotionById.get(t.emotion)!;
    await write(
      resolve(PUBLIC, "templates", `${t.id}.png`),
      templateSvg(t.id, t.dialogue, t.movie.name, t.actor.name, emotion.name),
    );
  }
  console.log(`✓ ${templates.length} template stills → public/templates/`);

  for (const m of movies) {
    await write(resolve(PUBLIC, "movies", `${m.id}.png`), posterSvg(m.id, m.name, m.year));
  }
  console.log(`✓ ${movies.length} movie posters → public/movies/`);

  for (const a of actors) {
    await write(resolve(PUBLIC, "actors", `${a.id}.png`), portraitSvg(a.id, a.name));
  }
  console.log(`✓ ${actors.length} actor portraits → public/actors/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
