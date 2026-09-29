import Link from "next/link";

import type { EmotionSummary } from "@/lib/queries";
import { cn } from "@/lib/utils";

/**
 * Emotion card (PRD §25). No photography here — emotions aren't a thing you can
 * picture with one still — so the accent colour and emoji carry the card instead.
 */
export function EmotionCard({
  emotion,
  className,
}: {
  emotion: EmotionSummary;
  className?: string;
}) {
  return (
    <Link
      href={`/emotions/${emotion.id}`}
      className={cn(
        "group/card relative flex aspect-16/10 w-full flex-col justify-end overflow-hidden rounded-sm p-4",
        "bg-card ring-0 ring-white/25 transition-transform duration-200 ease-out",
        "hover:scale-[1.05] hover:ring-1 focus-visible:scale-[1.05] focus-visible:ring-2 focus-visible:outline-none",
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(145deg, ${emotion.accent}40 0%, ${emotion.accent}0d 55%, transparent 100%)`,
      }}
    >
      <span className="absolute top-3 right-3 text-3xl" aria-hidden="true">
        {emotion.emoji}
      </span>
      <span className="text-lg font-bold text-white">{emotion.name}</span>
      <span className="text-xs text-muted-foreground">{emotion.templateCount} templates</span>
    </Link>
  );
}
