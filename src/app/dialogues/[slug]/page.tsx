import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader, PageShell } from "@/components/layout/page-shell";
import { TemplateGrid } from "@/components/grids/template-grid";
import { getAllDialogues, getDialogue, getTemplatesByDialogue } from "@/lib/queries";

export function generateStaticParams() {
  return getAllDialogues().map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/dialogues/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const dialogue = getDialogue(slug);
  if (!dialogue) return { title: "Dialogue not found" };
  return {
    title: dialogue.text,
    description: `"${dialogue.text}" — ${dialogue.lead.movie.name}, ${dialogue.lead.actor.name}.`,
  };
}

/**
 * Dialogue detail (PRD §27). One line can have several templates — the same scene
 * delivered at different beats — so this shows all of them rather than jumping
 * straight to one.
 */
export default async function DialoguePage({ params }: PageProps<"/dialogues/[slug]">) {
  const { slug } = await params;
  const dialogue = getDialogue(slug);
  if (!dialogue) notFound();

  const templates = getTemplatesByDialogue(slug);
  const { movie, actor } = dialogue.lead;

  return (
    <PageShell>
      <PageHeader
        title={`“${dialogue.text}”`}
        subtitle={
          <>
            <Link href={`/movies/${movie.id}`} className="hover:text-white hover:underline">
              {movie.name}
            </Link>
            {" · "}
            <Link href={`/actors/${actor.id}`} className="hover:text-white hover:underline">
              {actor.name}
            </Link>
          </>
        }
        count={dialogue.templateCount}
      />
      <TemplateGrid templates={templates} />
    </PageShell>
  );
}
