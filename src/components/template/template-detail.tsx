import Image from "next/image";
import Link from "next/link";
import { Download, Film, Smile, User } from "lucide-react";

import { EmotionBadge } from "@/components/ui/emotion-badge";
import { downloadFileName } from "@/lib/download";
import { dialogueSlug } from "@/lib/slug";
import type { Template } from "@/lib/types";

/**
 * The detail body from PRD §20 — image left, metadata right, Download as the
 * primary CTA.
 *
 * Shared by the real template page and the draft preview an admin lands on after
 * uploading, so the upload flow ends on exactly the page a published template gets
 * rather than a mock of one.
 */
export function TemplateDetail({
  template,
  /** Drafts are data URLs in this browser only — no optimiser, no related rails. */
  isDraft = false,
}: {
  template: Template;
  isDraft?: boolean;
}) {
  return (
    <div className="gutter grid gap-8 pb-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-12">
      <div className="relative aspect-video w-full overflow-hidden rounded-md bg-card">
        {isDraft ? (
          // A draft's image is a data: URL held in this browser — next/image can
          // neither optimise nor serve it, so a plain <img> is correct here.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={template.image}
            alt={`${template.dialogue} — ${template.movie.name}, ${template.actor.name}`}
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <Image
            src={template.image}
            alt={`${template.dialogue} — ${template.movie.name}, ${template.actor.name}`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover"
          />
        )}
      </div>

      <div className="flex flex-col">
        <h1 className="text-2xl leading-tight font-extrabold text-white sm:text-4xl">
          “{template.dialogue}”
        </h1>

        {/* The four metadata fields, and only those four (PRD §4, §5). */}
        <dl className="mt-6 space-y-3 text-sm">
          <MetaRow icon={<Film className="size-4" aria-hidden="true" />} label="Movie">
            <Link
              href={`/movies/${template.movie.id}`}
              className="font-semibold text-white underline-offset-4 hover:underline"
            >
              {template.movie.name}
            </Link>
            <span className="text-muted-foreground"> · {template.movie.year}</span>
          </MetaRow>

          <MetaRow icon={<User className="size-4" aria-hidden="true" />} label="Actor">
            <Link
              href={`/actors/${template.actor.id}`}
              className="font-semibold text-white underline-offset-4 hover:underline"
            >
              {template.actor.name}
            </Link>
          </MetaRow>

          <MetaRow icon={<Smile className="size-4" aria-hidden="true" />} label="Emotion">
            <Link href={`/emotions/${template.emotion}`} className="inline-block">
              <EmotionBadge emotion={template.emotion} size="md" />
            </Link>
          </MetaRow>
        </dl>

        <a
          href={template.image}
          download={downloadFileName(template)}
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-brand px-6 py-3.5 text-base font-bold text-white transition-colors hover:bg-brand-hover focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none sm:w-auto"
        >
          <Download className="size-5" aria-hidden="true" />
          Download Template
        </a>

        {!isDraft && (
          <p className="mt-3 text-xs text-muted-foreground">
            {template.downloads.toLocaleString()} downloads · PNG ·{" "}
            <Link
              href={`/dialogues/${dialogueSlug(template.dialogue)}`}
              className="underline-offset-4 hover:text-white hover:underline"
            >
              More versions of this dialogue
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

function MetaRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <dt className="flex w-24 shrink-0 items-center gap-2 text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}
