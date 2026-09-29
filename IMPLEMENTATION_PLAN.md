# Telugu Meme Template Library — MVP Implementation Plan

> Companion to `PRD.rtf`. The PRD defines **what** to build; this defines **how**, in what
> order, and what "done" means for each step.
>
> Scope: frontend-only MVP, dummy data, placeholder images, no backend, deploy to Vercel.

---

## 0. Guiding decisions

These are the calls this plan makes that the PRD left open. Each has a rationale, because
each one is reversible later and we should know what we're trading away.

| Decision | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | PRD §38. App Router gives us static generation of every detail page for free. |
| Data source | TypeScript modules in `src/data/`, not JSON | Type safety + autocomplete on a 4-field model costs nothing and catches bad seed data at build time. Shape stays JSON-identical (PRD §29) so a DB swap is mechanical. |
| Template images | Generated PNG placeholders, one real file per template | PRD assumes real files at `/templates/*.jpg`. Generating real files (rather than CSS gradients) means `next/image`, download-as-file, and OG images all work exactly as they will in production. Swapping in real screenshots later = drop files in, update one field. |
| Template count | 300 | Middle of PRD §32's 200–500. Enough to make rails, search ranking, and pagination behave realistically; small enough to ship in one static build. |
| Search | In-memory token scoring, built once at module load | PRD §31 — no external engine. 300 records is far below the point where anything smarter earns its weight. |
| Admin upload | Client-only: validates, previews, emits the JSON record, persists to `localStorage` | There is no backend in the MVP (PRD §39). The form proves the flow and produces a paste-ready record; it cannot truly persist. Called out as a known limitation, not hidden. |
| Download | Direct anchor download of the image file | Fewest clicks (PRD §42). No canvas, no blob juggling. |

### Two flags carried over from the PRD read

1. **Images are placeholders.** 300 real film screenshots can't be invented. Everything is
   built so real assets drop in without touching component code.
2. **Copyright.** Film stills are studio-owned. Irrelevant for a local prototype; worth a
   decision before a public production deploy.

---

## 1. Architecture

```
src/
├── app/
│   ├── layout.tsx                  Root: fonts, <Navbar>, <Footer>, dark theme
│   ├── page.tsx                    Home (PRD §12, §33)
│   ├── search/page.tsx             Search results (§17)  — client component
│   ├── templates/[id]/page.tsx     Template detail (§20)
│   ├── movies/page.tsx             Movies index (§21)
│   ├── movies/[slug]/page.tsx      Movie detail (§22)
│   ├── actors/page.tsx             Actors index (§23)
│   ├── actors/[slug]/page.tsx      Actor detail (§24)
│   ├── emotions/page.tsx           Emotions index (§25)
│   ├── emotions/[slug]/page.tsx    Emotion detail (§26)
│   ├── dialogues/page.tsx          Dialogues index (§27)
│   ├── dialogues/[slug]/page.tsx   Dialogue detail (§27)
│   └── admin/upload/page.tsx       Upload form (§28)
│
├── components/
│   ├── layout/    Navbar, SearchOverlay, Footer
│   ├── cards/     TemplateCard, MovieCard, ActorCard, EmotionCard, DialogueCard
│   ├── rails/     Rail (horizontal scroller + arrows), RailSection
│   ├── hero/      Hero
│   └── ui/        shadcn primitives (button, input, select, dialog, badge, skeleton)
│
├── data/
│   ├── movies.ts      ~25 movies
│   ├── actors.ts      ~18 actors
│   ├── emotions.ts    15 emotions + emoji + colour accent
│   ├── dialogues.ts   Curated dialogue pool, keyed by movie
│   └── templates.ts   GENERATED — 300 records, do not hand-edit
│
├── lib/
│   ├── types.ts       Template, Movie, Actor, Emotion
│   ├── queries.ts     All data access (byMovie, byActor, byEmotion, trending, latest, related)
│   ├── search.ts      Index build + query scoring
│   └── slug.ts        Deterministic name → slug, both directions
│
scripts/
├── seed-templates.mjs       Writes src/data/templates.ts
└── generate-placeholders.mjs Writes public/templates/*.png
```

**Rule:** pages never touch `src/data/*` directly. Everything goes through `lib/queries.ts`.
That single indirection is what makes the eventual database swap a one-file change.

---

## 2. Data model

Matches PRD §29 exactly. Four metadata fields, nothing else — no `situation`, no
`description`, no `useCase` (PRD §5 is emphatic, and it's the right call: extra fields
would dilute the search index and invite inconsistent authoring).

```ts
type Template = {
  id: string;            // "tpl-001"
  image: string;         // "/templates/tpl-001.png"
  dialogue: string;      // "Aata chusthava"
  movie: { id: string; name: string; year: number };
  actor: { id: string; name: string };
  emotion: EmotionId;    // "angry"
  downloads: number;     // seeded, drives "Trending"
  createdAt: string;     // ISO date, drives "Latest"
};
```

`Movie` and `Actor` are denormalised into each template (as the PRD shows) so a card renders
with zero lookups. `lib/queries.ts` owns the reverse indexes.

---

## 3. Seed data strategy

**Movies (~25)** and **actors (~18)** from PRD §32, hand-written with correct year and lead
actor. **Emotions (15)** from PRD §32, each with an emoji (§25) and an accent colour used
for emotion cards and badges.

**Dialogues** are the one thing that can't be randomly generated without producing nonsense.
Approach: a curated pool in `dialogues.ts` of real, well-known dialogues grouped by movie —
roughly 8–12 per movie — each pre-tagged with the actor who says it and a plausible emotion.

**`scripts/seed-templates.mjs`** then walks that pool and emits one template per dialogue,
padding to 300 by adding emotion variants of the same dialogue (a different frame of the
same scene — which is genuinely how a template library works). Seeded with a fixed RNG so
the dataset is reproducible across runs and diffs stay readable.

`downloads` is drawn from a long-tailed distribution rather than uniform — a flat
distribution makes "Trending" look arbitrary. `createdAt` spreads across the last ~6 months
so "Latest" is meaningful.

**`scripts/generate-placeholders.mjs`** renders one 1280×720 PNG per template via `sharp`
(SVG → PNG): a deterministic two-tone gradient derived from a hash of the template id, the
dialogue set in large type, and movie · actor in a smaller line beneath. Result: every card
looks distinct, the grid reads as a real content wall, and no card is ambiguous about what
it represents.

---

## 4. Design system

Straight from PRD §9–§10, as Tailwind theme tokens:

```
--bg          #000000    page
--surface     #141414    navbar-scrolled, sections
--card        #181818    cards
--brand       #E50914    primary actions, active nav
--fg          #FFFFFF
--fg-muted    #B3B3B3    metadata, secondary text
```

Type: **Inter** via `next/font`, tight tracking on display sizes. Section titles ~`text-2xl
font-bold`, hero title `clamp()`-scaled to ~`text-6xl`.

Motion: 200ms ease-out, transform/opacity only. PRD §35 asks for subtle and fast — card
hover scales to ~1.08, never more. Everything respects `prefers-reduced-motion`.

---

## 5. Build phases

Each phase ends in something runnable. No phase depends on a later one.

### Phase 1 — Scaffold
`create-next-app` (TS, Tailwind, App Router, `src/`), `shadcn init`, add the handful of
primitives we need, Inter via `next/font`, colour tokens wired into Tailwind, root layout
with black background and Navbar/Footer stubs.
**Done when:** `npm run dev` serves a black page in the right typeface.

### Phase 2 — Data layer
`lib/types.ts`, the four hand-written data files, both seed scripts, `lib/queries.ts`,
`lib/slug.ts`.
**Done when:** 300 templates and 300 PNGs exist, and a scratch page can print counts per
movie / actor / emotion that sum correctly.

### Phase 3 — Core components
`TemplateCard` + its hover expansion (§18, §19: scale, dark overlay, dialogue, movie ·
actor, emotion badge, View + Download), `Rail` (§34: overflow scroller, snap points, desktop
arrow buttons that hide at the ends, native swipe on touch), plus Movie/Actor/Emotion/
Dialogue cards.
**Done when:** a scratch page renders three rails that scroll and hover correctly at every
breakpoint.

### Phase 4 — Navbar + Homepage
Navbar (§11): logo, Home / Movies / Actors / Emotions, search icon, Upload; transparent over
the hero, solid `#141414` past ~80px scroll, sticky. Search icon expands to a full-width
overlay input.
Hero (§13): 70–80vh featured template, dark gradient overlay, movie title, dialogue, actor,
emotion badge, View Template + Download.
Homepage rails (§33): Trending → Popular Movies → Popular Actors → Popular Emotions →
Angry Templates → Latest.
**Done when:** the homepage matches §12's structure and feels like the reference.

### Phase 5 — Browse + detail pages
All index pages and all detail pages, each statically generated via `generateStaticParams`.
Template detail (§20): large image left, metadata right, Download primary CTA, then three
related rails — more from this movie, more from this actor, more of this emotion.
Movie detail (§22): title, year · lead actor, template count, then one rail per emotion
present in that movie.
Actor detail (§24): Popular rail, then per-emotion rails.
Emotion / Dialogue detail per §26, §27.
**Done when:** every route in PRD §37 resolves with real content and no dead links.

### Phase 6 — Search
`lib/search.ts` builds a token index once at module load. Query handling per PRD §16 and
§31: lowercase, strip punctuation, split on whitespace, then score each template —

- exact full-query match on dialogue → highest
- each query term matching a distinct field (dialogue / movie / actor / emotion) adds weight
- **all** terms matched ranks above **some** terms matched (this is what makes
  `mahesh angry` and `guntur kaaram angry` work)
- prefix matches count, mid-word substrings count less

Search page (§17): "Search results for {q}", the result count, the four filter controls
(Dialogue / Movie / Actor / Emotion — and only those four), results grid. Query lives in the
URL so results are shareable and the back button behaves.
**Done when:** all five PRD §15–§16 example queries return the right templates in a sane order.

### Phase 7 — Admin upload
`/admin/upload` (§28): image file input with local preview, dialogue text input, movie
select, actor select, emotion select, Publish. On submit: validate, append to a
`localStorage` store that `queries.ts` merges over the static data, redirect to the new
template's detail page, and show the generated JSON record for pasting into `templates.ts`.
**Done when:** a publish round-trips to a viewable detail page, and the limitation is stated
on the page itself.

### Phase 8 — Responsive, polish, deploy
Breakpoints per §36 (desktop 4–6 cards, tablet 3–4, mobile 2 / swipe). Keyboard focus states
on every card and rail arrow, alt text from dialogue + movie + actor, visible focus rings.
Loading skeletons, empty states ("No templates match {q}"), a 404. Lighthouse pass. Deploy
to Vercel.
**Done when:** every item in PRD §41 is demonstrable on the deployed URL.

---

## 6. Acceptance checklist (PRD §41)

**User can:** search by dialogue · by movie · by actor · by emotion · combine terms · filter results · browse movies · browse actors · browse emotions · browse dialogues · open a
template · see its four metadata fields · download it · reach related templates.

**Admin can:** upload an image · enter dialogue · select movie · select actor · select
emotion · publish.

**And, from §39, the build contains none of:** auth, profiles, likes, comments, following,
user uploads, AI tagging, AI search, meme editor, Instagram integration, payments,
subscriptions, backend database, recommendation engine.

---

## 7. Deliberately out of scope

Everything in PRD §40 (real database, favourites, analytics, AI search, meme creator,
community). The one thing worth building *toward*: `lib/queries.ts` as the sole data
boundary, so Phase 2 of the roadmap is a swap rather than a rewrite.

---

## 8. Build status — all phases complete

Verified: `tsc --noEmit` clean · `eslint --max-warnings=0` clean · `next build` green
(631 pages prerendered, only `/search` dynamic) · `npm run check-search` passes every
PRD §15–§16 example.

### Where the build departed from this plan

| Change | Why |
|---|---|
| Scaffolded into a subdirectory, then lifted to the root | `create-next-app` rejects the folder name (`templates dude` contains a space). |
| Tailwind v4 CSS-first theme, no `tailwind.config.js` | That's what current `create-next-app` ships; tokens live in `@theme` in `globals.css`. |
| **Dialogues added to the navbar** | PRD §11 lists four nav items, but PRD §27 gives dialogues a browse page. Left out of the nav, that page is reachable from exactly one rail link. Easy to revert if you want the PRD's four exactly. |
| 33 movies instead of 20–30 | Needed the extra films to give every listed actor real templates. |
| Seed biases emotion padding toward thin emotions | Random padding amplified the pool's skew and left `/emotions/crying` with 2 templates, which reads as broken. Now the minimum is 6. |
| Placeholder PNGs are palette-quantised | Cut the template library from 31MB to 16MB with no visible banding on flat gradients. |
| `/templates/[id]` falls back to a client-side draft view | The only way an upload can end on a real detail page with no backend. |

### Two bugs worth remembering

- **Rails need `scroll-padding-left` matching their gutter.** With `snap-mandatory`, the
  browser aligns the first card to the scrollport edge and scrolls the padding straight
  back out — the rail silently loses its left margin. Cost an hour to spot because the
  computed `padding-left` was correct the whole time; it was `scrollLeft` resting at 48.
- **Base UI's `Select.Value` renders the raw value,** not the matching item's label, so
  the filter triggers showed the `__all__` sentinel until given explicit children.
