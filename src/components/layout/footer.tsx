import Link from "next/link";

const columns = [
  {
    title: "Browse",
    links: [
      { href: "/movies", label: "Movies" },
      { href: "/actors", label: "Actors" },
      { href: "/emotions", label: "Emotions" },
      { href: "/dialogues", label: "Dialogues" },
    ],
  },
  {
    title: "Library",
    links: [
      { href: "/search?q=angry", label: "Angry templates" },
      { href: "/search?q=mahesh+babu", label: "Mahesh Babu" },
      { href: "/search?q=pushpa", label: "Pushpa" },
      { href: "/admin/upload", label: "Upload a template" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="gutter mt-16 border-t border-hairline py-10 text-sm">
      <div className="flex flex-col gap-8 sm:flex-row sm:gap-16">
        <div className="max-w-xs">
          <p className="text-base font-extrabold tracking-tight text-brand">
            TELUGU<span className="text-white">TEMPLATES</span>
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Meme templates from Telugu cinema, searchable by dialogue, movie, actor and
            emotion.
          </p>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <p className="mb-3 text-xs font-semibold tracking-wide text-white uppercase">
              {column.title}
            </p>
            <ul className="space-y-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-muted-foreground transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-10 text-xs text-muted-foreground">
        MVP prototype · All images are generated placeholders. Film stills and dialogues
        remain the property of their respective studios.
      </p>
    </footer>
  );
}
