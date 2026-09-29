import Image from "next/image";
import Link from "next/link";

import type { ActorSummary } from "@/lib/queries";
import { cn } from "@/lib/utils";

/** Actor card (PRD §23). Square portrait — reads as a person, not a poster. */
export function ActorCard({
  actor,
  sizes = "(max-width: 640px) 38vw, (max-width: 768px) 26vw, (max-width: 1024px) 19vw, 12vw",
  className,
}: {
  actor: ActorSummary;
  sizes?: string;
  className?: string;
}) {
  return (
    <Link
      href={`/actors/${actor.id}`}
      className={cn("group/card block w-full rounded-sm focus-visible:outline-none", className)}
    >
      <div className="relative aspect-square overflow-hidden rounded-sm bg-card ring-0 ring-white/25 transition-transform duration-200 ease-out group-hover/card:scale-[1.05] group-hover/card:ring-1 group-focus-visible/card:scale-[1.05] group-focus-visible/card:ring-2">
        <Image src={actor.portrait} alt="" fill sizes={sizes} className="object-cover" />
      </div>
      <div className="px-0.5 pt-2">
        <p className="line-clamp-1 text-[13px] font-semibold text-white">{actor.name}</p>
        <p className="text-xs text-muted-foreground">{actor.templateCount} templates</p>
      </div>
    </Link>
  );
}
