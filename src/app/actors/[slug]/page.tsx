import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader, PageShell } from "@/components/layout/page-shell";
import { Rail } from "@/components/rails/rail";
import { TemplateCard } from "@/components/cards/template-card";
import {
  getActor,
  getAllActors,
  getEmotionsPresentIn,
  getTemplatesByActor,
} from "@/lib/queries";

export function generateStaticParams() {
  return getAllActors().map((a) => ({ slug: a.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/actors/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const actor = getActor(slug);
  if (!actor) return { title: "Actor not found" };
  return {
    title: actor.name,
    description: `${actor.templateCount} Telugu meme templates featuring ${actor.name}.`,
  };
}

/** Actor detail (PRD §24): Popular first, then a rail per emotion. */
export default async function ActorPage({ params }: PageProps<"/actors/[slug]">) {
  const { slug } = await params;
  const actor = getActor(slug);
  if (!actor) notFound();

  const templates = getTemplatesByActor(actor.id);
  const emotions = getEmotionsPresentIn(templates);

  return (
    <PageShell>
      <PageHeader title={actor.name} count={actor.templateCount} />

      <Rail title="Popular">
        {templates.slice(0, 20).map((t) => (
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
