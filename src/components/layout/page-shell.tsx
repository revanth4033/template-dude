import { cn } from "@/lib/utils";

/**
 * Wrapper for every page except the homepage.
 *
 * The navbar is fixed and the homepage hero deliberately sits under it, so pages
 * that don't have a hero need their own top offset. Keeping it here means no page
 * has to remember the navbar's height.
 */
export function PageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("pt-24 sm:pt-28", className)}>{children}</div>;
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  count,
  countNoun = "Template",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Rendered as "N Templates" — PRD shows this count on every browse page. */
  count?: number;
  /** Singular noun; pluralised with a trailing "s". */
  countNoun?: string;
}) {
  return (
    <header className="gutter pb-6">
      {eyebrow && (
        <p className="mb-2 text-xs font-semibold tracking-[0.25em] text-muted-foreground uppercase">
          {eyebrow}
        </p>
      )}
      <h1 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">{title}</h1>
      {subtitle && <div className="mt-2 text-sm text-muted-foreground sm:text-base">{subtitle}</div>}
      {count !== undefined && (
        <p className="mt-3 text-sm font-semibold text-white">
          {count.toLocaleString()} {count === 1 ? countNoun : `${countNoun}s`}
        </p>
      )}
    </header>
  );
}
