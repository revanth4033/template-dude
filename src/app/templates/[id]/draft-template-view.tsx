"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Check, Copy } from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { TemplateDetail } from "@/components/template/template-detail";
import { EmptyState } from "@/components/grids/template-grid";
import {
  getDraftsServerSnapshot,
  getDraftsSnapshot,
  subscribeDrafts,
  toSeedRecord,
  type DraftTemplate,
} from "@/lib/drafts";

/**
 * Fallback for template ids the server doesn't know about.
 *
 * A template uploaded through /admin/upload exists only in this browser's
 * localStorage, which the server can't read — so the server renders this and the
 * lookup happens after mount. If there's no draft either, it really is a 404.
 */
export function DraftTemplateView({ id }: { id: string }) {
  const drafts = useSyncExternalStore(
    subscribeDrafts,
    getDraftsSnapshot,
    getDraftsServerSnapshot,
  );

  // `null` while hydrating — show a skeleton rather than flashing "not found".
  const draft = drafts?.find((d) => d.id === id) ?? null;

  if (drafts === null) {
    return (
      <PageShell>
        <div className="gutter">
          <div className="aspect-video w-full max-w-4xl animate-pulse rounded-md bg-card" />
        </div>
      </PageShell>
    );
  }

  if (!draft) {
    return (
      <PageShell>
        <EmptyState
          title="Template not found"
          hint="This template doesn't exist, or it was saved in a different browser."
        />
        <div className="gutter text-center">
          <Link
            href="/"
            className="text-sm font-semibold text-brand underline-offset-4 hover:underline"
          >
            Back to home
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="gutter pb-6">
        <p className="inline-flex rounded-sm border border-brand/50 bg-brand/10 px-3 py-1.5 text-xs font-semibold text-white">
          Saved in this browser · not part of the public library
        </p>
      </div>

      <TemplateDetail template={draft} isDraft />

      <div className="gutter pt-8">
        <SeedRecord draft={draft} />
      </div>
    </PageShell>
  );
}

/** The paste-ready record — the real output of an upload while there's no backend. */
function SeedRecord({ draft }: { draft: DraftTemplate }) {
  const [copied, setCopied] = useState(false);
  const record = toSeedRecord(draft);

  async function copy() {
    try {
      await navigator.clipboard.writeText(record);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the record is selectable on screen regardless.
    }
  }

  return (
    <div className="max-w-xl rounded-sm border border-hairline bg-surface p-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-bold text-white">Add it to the library</h2>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-sm border border-input px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
        >
          {copied ? (
            <Check className="size-3.5" aria-hidden="true" />
          ) : (
            <Copy className="size-3.5" aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        Paste this into <code className="text-white">src/data/dialogues.ts</code>, save the
        image to <code className="text-white">public/templates/</code>, then run{" "}
        <code className="text-white">npm run seed</code>.
      </p>
      <pre className="mt-3 overflow-x-auto rounded-sm bg-black/60 p-3 text-xs text-white/85">
        <code>{record}</code>
      </pre>
    </div>
  );
}
