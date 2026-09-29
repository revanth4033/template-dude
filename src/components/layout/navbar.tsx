"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Upload, X } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Netflix-inspired navigation (PRD §11).
 *
 * Transparent over the hero, solid once scrolled, always sticky. The search icon
 * expands into a full search field in place (PRD §14) rather than opening a modal —
 * fewer clicks between intent and query, which is the whole point of PRD §42.
 *
 * "Dialogues" is in the nav alongside the four items PRD §11 lists. Dialogue is one
 * of the four metadata dimensions and PRD §27 gives it a browse page; leaving it out
 * of the nav would make that page reachable only from a single rail link.
 */

const links = [
  { href: "/", label: "Home" },
  { href: "/movies", label: "Movies" },
  { href: "/actors", label: "Actors" },
  { href: "/emotions", label: "Emotions" },
  { href: "/dialogues", label: "Dialogues" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setSearchOpen(false);
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled ? "bg-surface shadow-lg shadow-black/40" : "bg-gradient-to-b from-black/80 to-transparent",
      )}
    >
      <nav className="gutter flex h-16 items-center gap-4 sm:h-[68px] sm:gap-6">
        <Link
          href="/"
          className="shrink-0 text-base font-extrabold tracking-tight text-brand sm:text-lg"
        >
          TELUGU<span className="text-white">TEMPLATES</span>
        </Link>

        <ul className="no-scrollbar flex min-w-0 flex-1 items-center gap-4 overflow-x-auto text-sm sm:gap-5">
          {links.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "whitespace-nowrap transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none",
                    active ? "font-semibold text-white" : "text-muted-foreground",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <form onSubmit={submit} className="flex items-center">
            <div
              className={cn(
                "flex items-center overflow-hidden rounded-sm border transition-all duration-300 ease-out",
                searchOpen
                  ? "w-44 border-white/40 bg-black/80 pl-2 sm:w-72"
                  : "w-9 border-transparent",
              )}
            >
              <button
                type={searchOpen ? "submit" : "button"}
                onClick={() => !searchOpen && setSearchOpen(true)}
                aria-label={searchOpen ? "Search" : "Open search"}
                className="grid size-9 shrink-0 place-items-center text-white transition-colors hover:text-brand focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
              >
                <Search className="size-[18px]" aria-hidden="true" />
              </button>
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
                placeholder="Search movies, dialogues, actors..."
                aria-label="Search templates"
                // Hidden from the tab order while collapsed so keyboard users don't
                // land in an invisible zero-width field.
                tabIndex={searchOpen ? 0 : -1}
                className={cn(
                  "min-w-0 flex-1 bg-transparent py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none",
                  !searchOpen && "pointer-events-none",
                )}
              />
              {searchOpen && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setSearchOpen(false);
                  }}
                  aria-label="Close search"
                  className="grid size-9 shrink-0 place-items-center text-muted-foreground hover:text-white focus-visible:outline-none"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </form>

          <Link
            href="/admin/upload"
            className="inline-flex items-center gap-1.5 rounded-sm bg-brand px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-hover focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none sm:text-sm"
          >
            <Upload className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Upload</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
