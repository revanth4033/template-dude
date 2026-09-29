import Link from "next/link";

import { PageShell } from "@/components/layout/page-shell";

export default function NotFound() {
  return (
    <PageShell>
      <div className="gutter py-24 text-center">
        <p className="text-sm font-semibold tracking-[0.25em] text-brand uppercase">404</p>
        <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
          We couldn&apos;t find that page
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The template, movie or actor you&apos;re looking for isn&apos;t in the library.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-sm bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
          >
            Back to home
          </Link>
          <Link
            href="/search"
            className="rounded-sm bg-white/15 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/25"
          >
            Search templates
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
