import type { Metadata } from "next";

import { SearchExperience } from "./search-experience";

export const metadata: Metadata = {
  title: "Search",
  description: "Search Telugu meme templates by dialogue, movie, actor or emotion.",
};

/**
 * Search page (PRD §14, §17).
 *
 * The initial query is read here on the server so a shared /search?q=... link
 * renders with its results already in the markup; every keystroke after that is
 * handled client-side.
 */
export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const { q } = await searchParams;
  const initialQuery = typeof q === "string" ? q : "";

  return <SearchExperience initialQuery={initialQuery} />;
}
