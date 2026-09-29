import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader, PageShell } from "@/components/layout/page-shell";
import { TemplateGrid } from "@/components/grids/template-grid";
import { getAllEmotions, getEmotion, getTemplatesByEmotion } from "@/lib/queries";
import type { EmotionId } from "@/lib/types";

export function generateStaticParams() {
  return getAllEmotions().map((e) => ({ slug: e.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/emotions/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const emotion = getEmotion(slug);
  if (!emotion) return { title: "Emotion not found" };
  return {
    title: `${emotion.name} Templates`,
    description: `${emotion.templateCount} Telugu meme templates tagged ${emotion.name}.`,
  };
}

/**
 * Emotion detail (PRD §26). A flat grid rather than rails: these templates span
 * every movie and actor, so there's no second dimension to group them by.
 */
export default async function EmotionPage({ params }: PageProps<"/emotions/[slug]">) {
  const { slug } = await params;
  const emotion = getEmotion(slug);
  if (!emotion) notFound();

  const templates = getTemplatesByEmotion(emotion.id as EmotionId);

  return (
    <PageShell>
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <span aria-hidden="true">{emotion.emoji}</span>
            {emotion.name} Templates
          </span>
        }
        subtitle="From every movie and every actor in the library."
        count={emotion.templateCount}
      />
      <TemplateGrid templates={templates} />
    </PageShell>
  );
}
