import type { Metadata } from "next";

import { PageHeader, PageShell } from "@/components/layout/page-shell";
import { MovieCard } from "@/components/cards/movie-card";
import { getAllMovies } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Movies",
  description: "Browse Telugu meme templates by movie.",
};

/** Movies index (PRD §21): poster grid. */
export default function MoviesPage() {
  const movies = getAllMovies();

  return (
    <PageShell>
      <PageHeader title="Movies" subtitle="Browse templates by the film they came from." />
      <div className="gutter grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            sizes="(max-width: 640px) 30vw, (max-width: 768px) 23vw, (max-width: 1024px) 18vw, 13vw"
          />
        ))}
      </div>
    </PageShell>
  );
}
