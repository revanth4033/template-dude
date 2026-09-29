import Image from "next/image";
import Link from "next/link";
import { Download, Play } from "lucide-react";

import { EmotionBadge } from "@/components/ui/emotion-badge";
import { downloadFileName } from "@/lib/download";
import type { Template } from "@/lib/types";

/**
 * Cinematic hero (PRD §13).
 *
 * The featured template fills 70–80vh behind two gradients: one from the bottom so
 * the copy sits on solid ground, one from the left so the text side stays readable
 * regardless of what the still looks like there.
 *
 * Content order follows PRD §13 exactly: movie name as the title, then dialogue,
 * actor, emotion, then the two CTAs.
 */
export function Hero({ template }: { template: Template }) {
  return (
    <section className="relative h-[72vh] min-h-[420px] w-full sm:h-[78vh]">
      <Image
        src={template.image}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {/* Bottom gradient grounds the copy; left gradient keeps it readable over any
          still. Both stay light enough that the image still reads as an image. */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/45 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/20 to-transparent" />

      <div className="gutter absolute inset-x-0 bottom-0 pb-10 sm:pb-16">
        <div className="max-w-xl">
          <h1 className="text-4xl leading-[1.02] font-extrabold text-white sm:text-6xl lg:text-7xl">
            {template.movie.name}
          </h1>

          <p className="mt-4 text-lg leading-snug font-semibold text-white/90 sm:text-2xl">
            “{template.dialogue}”
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-white sm:text-base">
              {template.actor.name}
            </span>
            <span className="text-sm text-muted-foreground">{template.movie.year}</span>
            <EmotionBadge emotion={template.emotion} size="md" />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href={`/templates/${template.id}`}
              className="inline-flex items-center gap-2 rounded-sm bg-white px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-white/85 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            >
              <Play className="size-4 fill-current" aria-hidden="true" />
              View Template
            </Link>
            <a
              href={template.image}
              download={downloadFileName(template)}
              className="inline-flex items-center gap-2 rounded-sm bg-white/15 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            >
              <Download className="size-4" aria-hidden="true" />
              Download
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
