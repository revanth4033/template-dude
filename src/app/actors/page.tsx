import type { Metadata } from "next";

import { PageHeader, PageShell } from "@/components/layout/page-shell";
import { ActorCard } from "@/components/cards/actor-card";
import { getAllActors } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Actors",
  description: "Browse Telugu meme templates by actor.",
};

/** Actors index (PRD §23). */
export default function ActorsPage() {
  const actors = getAllActors();

  return (
    <PageShell>
      <PageHeader title="Actors" subtitle="Browse templates by who's in the frame." />
      <div className="gutter grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
        {actors.map((actor) => (
          <ActorCard
            key={actor.id}
            actor={actor}
            sizes="(max-width: 640px) 30vw, (max-width: 768px) 23vw, (max-width: 1024px) 18vw, 12vw"
          />
        ))}
      </div>
    </PageShell>
  );
}
