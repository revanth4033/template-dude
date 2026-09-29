import Image from "next/image";
import Link from "next/link";

import type { MovieSummary } from "@/lib/queries";
import { cn } from "@/lib/utils";

/** Movie poster card (PRD §21): poster, name, year, template count. */
export function MovieCard({
  movie,
  sizes = "(max-width: 640px) 38vw, (max-width: 768px) 26vw, (max-width: 1024px) 19vw, 13vw",
  className,
}: {
  movie: MovieSummary;
  sizes?: string;
  className?: string;
}) {
  return (
    <Link
      href={`/movies/${movie.id}`}
      className={cn("group/card block w-full rounded-sm focus-visible:outline-none", className)}
    >
      <div className="relative aspect-2/3 overflow-hidden rounded-sm bg-card ring-0 ring-white/25 transition-transform duration-200 ease-out group-hover/card:scale-[1.05] group-hover/card:ring-1 group-focus-visible/card:scale-[1.05] group-focus-visible/card:ring-2">
        <Image
          src={movie.poster}
          alt=""
          fill
          sizes={sizes}
          className="object-cover"
        />
      </div>
      <div className="px-0.5 pt-2">
        <p className="line-clamp-1 text-[13px] font-semibold text-white">{movie.name}</p>
        <p className="text-xs text-muted-foreground">
          {movie.year} · {movie.templateCount} templates
        </p>
      </div>
    </Link>
  );
}
