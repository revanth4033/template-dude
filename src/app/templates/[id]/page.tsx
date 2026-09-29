import type { Metadata } from "next";

import { PageShell } from "@/components/layout/page-shell";
import { Rail } from "@/components/rails/rail";
import { TemplateCard } from "@/components/cards/template-card";
import { TemplateDetail } from "@/components/template/template-detail";
import {
  emotionById,
  getAllTemplates,
  getRelatedTemplates,
  getTemplate,
} from "@/lib/queries";
import { DraftTemplateView } from "./draft-template-view";

export function generateStaticParams() {
  return getAllTemplates().map((t) => ({ id: t.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/templates/[id]">): Promise<Metadata> {
  const { id } = await params;
  const template = getTemplate(id);

  // The server can't see localStorage, so an unknown id may still resolve to a draft
  // on the client. Stay neutral rather than titling the tab "not found".
  if (!template) return { title: "Template", robots: { index: false, follow: false } };

  const title = `${template.dialogue} — ${template.movie.name}`;
  return {
    title,
    description: `${template.dialogue} · ${template.movie.name} (${template.movie.year}) · ${template.actor.name}`,
    openGraph: { title, images: [{ url: template.image }] },
  };
}

/** Template detail (PRD §20): image left, metadata right, then three related rails. */
export default async function TemplatePage({ params }: PageProps<"/templates/[id]">) {
  const { id } = await params;
  const template = getTemplate(id);

  // Not in the static library — it may be a draft in the visitor's own browser,
  // which only the client can resolve.
  if (!template) return <DraftTemplateView id={id} />;

  const emotion = emotionById.get(template.emotion);
  const related = getRelatedTemplates(template);

  return (
    <PageShell>
      <TemplateDetail template={template} />

      {/* Related content (PRD §20), in the order the PRD specifies. */}
      <div className="pt-6">
        {related.fromMovie.length > 0 && (
          <Rail title={`More from ${template.movie.name}`} href={`/movies/${template.movie.id}`}>
            {related.fromMovie.map((t) => (
              <TemplateCard key={t.id} template={t} />
            ))}
          </Rail>
        )}

        {related.fromActor.length > 0 && (
          <Rail
            title={`More ${template.actor.name} Templates`}
            href={`/actors/${template.actor.id}`}
          >
            {related.fromActor.map((t) => (
              <TemplateCard key={t.id} template={t} />
            ))}
          </Rail>
        )}

        {related.sameEmotion.length > 0 && emotion && (
          <Rail title={`More ${emotion.name} Templates`} href={`/emotions/${emotion.id}`}>
            {related.sameEmotion.map((t) => (
              <TemplateCard key={t.id} template={t} />
            ))}
          </Rail>
        )}
      </div>
    </PageShell>
  );
}
