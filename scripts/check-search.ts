/** Sanity-checks search ranking against the example queries in PRD §15–§16. */
import { search } from "../src/lib/search";

const queries = [
  "Mahesh Babu",
  "Guntur Kaaram",
  "Angry",
  "Aata chusthava",
  "Mahesh Babu angry",
  "Guntur Kaaram angry",
  "thaggede le",
  "pushpa",
];

for (const q of queries) {
  const results = search(q);
  console.log(`\n"${q}" → ${results.length} results`);
  for (const r of results.slice(0, 3)) {
    const t = r.template;
    console.log(
      `   ${t.dialogue} | ${t.movie.name} | ${t.actor.name} | ${t.emotion}  (score ${r.score.toFixed(1)}, terms ${r.matchedTerms})`,
    );
  }
}

// The combined-search promise of PRD §16: every result must satisfy both terms.
const combined = search("Mahesh Babu angry");
const allAngryMahesh = combined.every(
  (r) => r.template.actor.name === "Mahesh Babu" && r.template.emotion === "angry",
);
console.log(`\nPRD §16 — "Mahesh Babu angry" all results are Mahesh Babu + angry: ${allAngryMahesh}`);

const gk = search("Guntur Kaaram angry");
const allGkAngry = gk.every(
  (r) => r.template.movie.id === "guntur-kaaram" && r.template.emotion === "angry",
);
console.log(`PRD §16 — "Guntur Kaaram angry" all results are Guntur Kaaram + angry: ${allGkAngry}`);
