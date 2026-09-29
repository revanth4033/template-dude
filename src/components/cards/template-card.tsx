import Image from "next/image";
import Link from "next/link";
import { Download, Play } from "lucide-react";

import { EmotionBadge } from "@/components/ui/emotion-badge";
import { downloadFileName } from "@/lib/download";
import { cn } from "@/lib/utils";
import type { Template } from "@/lib/types";

/**
 * The primary content card (PRD §18, §19).
 *
 * Image-first: the still carries the card, with only the dialogue and a
 * "Movie · Actor" line beneath it. On hover (desktop) the card lifts slightly and
 * reveals View / Download over a darkened still — PRD §35 asks for subtle and fast,
 * so the scale is 1.06 over 200ms, not a full Netflix panel expansion.
 *
 * Layering: a stretched <Link> covers the still so the whole card is clickable, and
 * the two action buttons sit above it. Anchors can't nest, so this is the way to get
 * "click anywhere to view" and a separate Download target on one card. Everything in
 * between is pointer-events-none.
 *
 * The card is sized by its container (`w-full`), so one component serves both the
 * rails and the grid pages.
 */
export function TemplateCard({
  template,
  priority = false,
  sizes = "(max-width: 640px) 62vw, (max-width: 768px) 42vw, (max-width: 1024px) 30vw, (max-width: 1280px) 23vw, 18vw",
  className,
}: {
  template: Template;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  return (
    <div className={cn("group/card relative w-full", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-sm bg-card",
          "transition-transform duration-200 ease-out",
          "ring-0 ring-white/25",
          "group-hover/card:scale-[1.06] group-hover/card:ring-1",
          "group-focus-within/card:scale-[1.06] group-focus-within/card:ring-1",
        )}
      >
        <div className="relative aspect-video">
          <Image
            src={template.image}
            alt={`${template.dialogue} — ${template.movie.name}, ${template.actor.name}`}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover"
          />

          {/* Resting state: emotion only, so the still stays readable. */}
          <div className="pointer-events-none absolute top-2 left-2 transition-opacity duration-200 group-hover/card:opacity-0">
            <EmotionBadge emotion={template.emotion} className="backdrop-blur-sm" />
          </div>

          {/* Stretched link — the whole still is the View target. */}
          <Link
            href={`/templates/${template.id}`}
            className="absolute inset-0 z-10 rounded-sm focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none focus-visible:ring-inset"
          >
            <span className="sr-only">
              View template: {template.dialogue} — {template.movie.name}
            </span>
          </Link>

          {/* Hover reveal: metadata + actions (PRD §19). */}
          <div
            className={cn(
              "pointer-events-none absolute inset-0 z-20 flex flex-col justify-end gap-2 p-3",
              "bg-gradient-to-t from-black/92 via-black/55 to-black/10",
              "opacity-0 transition-opacity duration-200",
              "group-hover/card:opacity-100 group-focus-within/card:opacity-100",
            )}
          >
            <p className="line-clamp-2 text-sm leading-snug font-semibold text-white">
              {template.dialogue}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {template.movie.name} · {template.actor.name}
            </p>
            <div className="flex items-center gap-2 pt-0.5">
              {/*
                Visually a button, but the real navigation is the stretched link
                behind it — so this is inert and hidden from assistive tech, which
                would otherwise hear "View" twice per card.
              */}
              <span
                aria-hidden="true"
                className="inline-flex items-center gap-1.5 rounded-sm bg-white px-3 py-1.5 text-xs font-semibold text-black"
              >
                <Play className="size-3.5 fill-current" aria-hidden="true" />
                View
              </span>
              <a
                href={template.image}
                download={downloadFileName(template)}
                className="pointer-events-auto inline-flex items-center gap-1.5 rounded-sm border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
              >
                <Download className="size-3.5" aria-hidden="true" />
                <span>Download</span>
                <span className="sr-only">
                  {template.dialogue} — {template.movie.name}
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Resting metadata, below the still (PRD §18). */}
      <div className="px-0.5 pt-2">
        <p className="line-clamp-1 text-[13px] font-semibold text-white">{template.dialogue}</p>
        <p className="line-clamp-1 text-xs text-muted-foreground">
          {template.movie.name} · {template.actor.name}
        </p>
      </div>
    </div>
  );
}
