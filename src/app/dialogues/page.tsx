import type { Metadata } from "next";

import { PageHeader, PageShell } from "@/components/layout/page-shell";
import { DialogueCard } from "@/components/cards/dialogue-card";
import { getAllDialogues } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Dialogues",
  description: "Browse popular Telugu movie dialogues and the templates behind them.",
};

/** Dialogues index (PRD §27), most-downloaded first. */
export default function DialoguesPage() {
  const dialogues = getAllDialogues();

  return (
    <PageShell>
      <PageHeader
        title="Dialogues"
        subtitle="The lines people actually search for."
        count={dialogues.length}
        countNoun="Dialogue"
      />
      <div className="gutter grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {dialogues.map((dialogue) => (
          <DialogueCard key={dialogue.slug} dialogue={dialogue} />
        ))}
      </div>
    </PageShell>
  );
}
