import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader, PageShell } from "@/components/layout/page-shell";
import { Rail } from "@/components/rails/rail";
import { TemplateCard } from "@/components/cards/template-card";
import {
  getAllMovies,
  getEmotionsPresentIn,
  getMovie,
  getTemplatesByMovie,
} from "@/lib/queries";

export function generateStaticParams() {
  return getAllMovies().map((m) => ({ slug: m.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/movies/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const movie = getMovie(slug);
  if (!movie) return { title: "Movie not found" };
  return {
    title: movie.name,
    description: `${movie.templateCount} meme templates from ${movie.name} (${movie.year}).`,
  };
}

/**
 * Movie detail (PRD §22). One rail for everything, then a rail per emotion.
 * The emotion rails are filters over the same set, not separate categories —
 * a template appears in "All Templates" and in exactly one emotion rail.
 */
export default async function MoviePage({ params }: PageProps<"/movies/[slug]">) {
  const { slug } = await params;
  const movie = getMovie(slug);
  if (!movie) notFound();

  const templates = getTemplatesByMovie(movie.id);
  const emotions = getEmotionsPresentIn(templates);

  return (
    <PageShell>
      <PageHeader
        title={movie.name}
        subtitle={`${movie.year} · ${movie.leadActorName}`}
        count={movie.templateCount}
      />

      <Rail title="All Templates">
        {templates.map((t) => (
          <TemplateCard key={t.id} template={t} />
        ))}
      </Rail>

      {emotions.map((emotion) => {
        const inEmotion = templates.filter((t) => t.emotion === emotion.id);
        return (
          <Rail
            key={emotion.id}
            title={`${emotion.emoji} ${emotion.name}`}
            href={`/emotions/${emotion.id}`}
          >
            {inEmotion.map((t) => (
              <TemplateCard key={t.id} template={t} />
            ))}
          </Rail>
        );
      })}
    </PageShell>
  );
}
