import { cn } from "@/lib/utils";
import { emotionById } from "@/data/emotions";
import type { EmotionId } from "@/lib/types";

/**
 * Emotion chip. Tinted with the emotion's accent at low alpha rather than filled,
 * so a wall of cards doesn't turn into a colour riot against the black ground.
 */
export function EmotionBadge({
  emotion,
  size = "sm",
  className,
}: {
  emotion: EmotionId;
  size?: "sm" | "md";
  className?: string;
}) {
  const meta = emotionById.get(emotion);
  if (!meta) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-sm",
        className,
      )}
      style={{
        color: meta.accent,
        borderColor: `${meta.accent}55`,
        backgroundColor: `${meta.accent}1a`,
      }}
    >
      <span aria-hidden="true">{meta.emoji}</span>
      {meta.name}
    </span>
  );
}
