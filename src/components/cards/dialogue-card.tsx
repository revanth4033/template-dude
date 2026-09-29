import Link from "next/link";
import { Quote } from "lucide-react";

import type { DialogueSummary } from "@/lib/queries";
import { cn } from "@/lib/utils";

/**
 * Dialogue card (PRD §27). Type-led rather than image-led: the line itself is the
 * thing being browsed, and showing a still here would just duplicate the rails above.
 */
export function DialogueCard({
  dialogue,
  className,
}: {
  dialogue: DialogueSummary;
  className?: string;
}) {
  return (
    <Link
      href={`/dialogues/${dialogue.slug}`}
      className={cn(
        "group/card flex h-full w-full flex-col justify-between gap-3 rounded-sm border border-hairline bg-card p-4",
        "transition-colors duration-200 hover:border-white/30 hover:bg-accent",
        "focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none",
        className,
      )}
    >
      <div className="flex items-start gap-2">
        <Quote className="mt-1 size-4 shrink-0 text-brand" aria-hidden="true" />
        <p className="line-clamp-3 text-[15px] leading-snug font-semibold text-white">
          {dialogue.text}
        </p>
      </div>
      <p className="line-clamp-1 text-xs text-muted-foreground">
        {dialogue.lead.movie.name} · {dialogue.lead.actor.name}
      </p>
    </Link>
  );
}
