import type { Metadata } from "next";

import { PageHeader, PageShell } from "@/components/layout/page-shell";
import { EmotionCard } from "@/components/cards/emotion-card";
import { getAllEmotions } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Emotions",
  description: "Browse Telugu meme templates by the emotion on screen.",
};

/** Emotions index (PRD §25). */
export default function EmotionsPage() {
  const emotions = getAllEmotions();

  return (
    <PageShell>
      <PageHeader
        title="Emotions"
        subtitle="Browse by the expression you need, whatever the movie."
      />
      <div className="gutter grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {emotions.map((emotion) => (
          <EmotionCard key={emotion.id} emotion={emotion} />
        ))}
      </div>
    </PageShell>
  );
}
