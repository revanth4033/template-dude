"use client";

import { Children, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Horizontal content rail (PRD §33, §34).
 *
 * Desktop gets arrow buttons that appear on hover and hide at either end; touch gets
 * native swipe with scroll-snap. The scrollbar is hidden (`.no-scrollbar`) because a
 * visible one breaks the cinematic read.
 *
 * Two layout details that are easy to get wrong:
 *
 * 1. `overflow-x-auto` forces the computed `overflow-y` to `auto` too, which clips
 *    cards as they scale up on hover. The vertical padding on the scroller gives the
 *    scaled card somewhere to grow into.
 * 2. The rail bleeds past the right edge of the viewport but keeps the left gutter,
 *    so rows line up with the page's vertical edge the way streaming UIs do.
 * 3. Scroll snapping needs `scroll-padding-left` to match that gutter, or it aligns
 *    cards to the scrollport edge and cancels the padding out.
 */

/** Per-item widths, tuned to PRD §36: ~2 on mobile, 3–4 tablet, 4–6 desktop. */
export const railItemWidths = {
  still: "w-[62vw] sm:w-[42vw] md:w-[30vw] lg:w-[23vw] xl:w-[18vw]",
  poster: "w-[38vw] sm:w-[26vw] md:w-[19vw] lg:w-[15vw] xl:w-[12vw]",
  portrait: "w-[38vw] sm:w-[26vw] md:w-[19vw] lg:w-[14vw] xl:w-[11vw]",
  emotion: "w-[52vw] sm:w-[34vw] md:w-[25vw] lg:w-[19vw] xl:w-[15vw]",
  dialogue: "w-[70vw] sm:w-[44vw] md:w-[32vw] lg:w-[25vw] xl:w-[20vw]",
} as const;

export type RailVariant = keyof typeof railItemWidths;

export function Rail({
  title,
  href,
  variant = "still",
  children,
}: {
  title: string;
  /** Optional "see all" destination shown beside the title. */
  href?: string;
  variant?: RailVariant;
  children: React.ReactNode;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  const sync = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 1);
    // 1px of slack — fractional widths mean scrollLeft rarely lands exactly on max.
    setAtEnd(el.scrollLeft >= max - 1);
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => observer.disconnect();
  }, [sync]);

  const page = (direction: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: "smooth" });
  };

  const items = Children.toArray(children);
  if (items.length === 0) return null;

  return (
    <section className="group/rail relative py-4">
      <div className="gutter mb-2 flex items-baseline gap-3">
        <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">{title}</h2>
        {href && (
          <Link
            href={href}
            className="text-xs font-semibold text-muted-foreground transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none"
          >
            See all →
          </Link>
        )}
      </div>

      <div className="relative">
        <div
          ref={scroller}
          onScroll={sync}
          // py-6 gives hover-scaled cards room; -my-6 keeps the rail's visual rhythm.
          // scroll-pl-* must match the left gutter: without it, snapping aligns the
          // first card to the scrollport edge and scrolls the padding straight back
          // out, so the rail loses its left margin the moment it snaps.
          className="no-scrollbar gutter-l -my-6 flex snap-x snap-mandatory scroll-pl-4 gap-2 overflow-x-auto scroll-smooth py-6 pr-4 sm:scroll-pl-6 sm:gap-3 sm:pr-6 lg:scroll-pl-12 lg:pr-12"
        >
          {items.map((child, i) => (
            <div key={i} className={cn("shrink-0 snap-start", railItemWidths[variant])}>
              {child}
            </div>
          ))}
        </div>

        <RailArrow side="left" hidden={atStart} onClick={() => page(-1)} />
        <RailArrow side="right" hidden={atEnd} onClick={() => page(1)} />
      </div>
    </section>
  );
}

function RailArrow({
  side,
  hidden,
  onClick,
}: {
  side: "left" | "right";
  hidden: boolean;
  onClick: () => void;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Scroll left" : "Scroll right"}
      // `hidden` here is a real unmount-from-the-tab-order, not just opacity: an
      // arrow you can't use shouldn't be reachable by keyboard.
      className={cn(
        "absolute inset-y-0 z-30 hidden w-12 items-center justify-center md:flex",
        "bg-black/60 text-white backdrop-blur-sm transition-opacity duration-200",
        "hover:bg-black/80 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none",
        "opacity-0 group-hover/rail:opacity-100 focus-visible:opacity-100",
        side === "left" ? "left-0" : "right-0",
        hidden && "pointer-events-none !opacity-0",
      )}
      tabIndex={hidden ? -1 : 0}
      aria-hidden={hidden}
    >
      <Icon className="size-7" aria-hidden="true" />
    </button>
  );
}
