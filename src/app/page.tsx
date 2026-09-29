import { Hero } from "@/components/hero/hero";
import { Rail } from "@/components/rails/rail";
import { TemplateCard } from "@/components/cards/template-card";
import { MovieCard } from "@/components/cards/movie-card";
import { ActorCard } from "@/components/cards/actor-card";
import { EmotionCard } from "@/components/cards/emotion-card";
import { DialogueCard } from "@/components/cards/dialogue-card";
import {
  getHeroTemplate,
  getLatestTemplates,
  getPopularActors,
  getPopularDialogues,
  getPopularEmotions,
  getPopularMovies,
  getTemplatesByEmotion,
  getTrendingTemplates,
} from "@/lib/queries";

/** Homepage (PRD §12, §33): hero, then horizontal rails all the way down. */
export default function HomePage() {
  const hero = getHeroTemplate();
  const trending = getTrendingTemplates(18);
  const movies = getPopularMovies(14);
  const actors = getPopularActors(14);
  const emotions = getPopularEmotions(15);
  const angry = getTemplatesByEmotion("angry", 18);
  const latest = getLatestTemplates(18);
  const dialogues = getPopularDialogues(14);

  return (
    <>
      <Hero template={hero} />

      {/* Rails overlap the hero's lower gradient slightly, as streaming UIs do. */}
      <div className="relative z-10 -mt-10 pb-8 sm:-mt-16">
        <Rail title="Trending Templates" variant="still">
          {trending.map((t) => (
            <TemplateCard key={t.id} template={t} />
          ))}
        </Rail>

        <Rail title="Popular Movies" href="/movies" variant="poster">
          {movies.map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </Rail>

        <Rail title="Popular Actors" href="/actors" variant="portrait">
          {actors.map((a) => (
            <ActorCard key={a.id} actor={a} />
          ))}
        </Rail>

        <Rail title="Browse by Emotion" href="/emotions" variant="emotion">
          {emotions.map((e) => (
            <EmotionCard key={e.id} emotion={e} />
          ))}
        </Rail>

        <Rail title="Angry Templates" href="/emotions/angry" variant="still">
          {angry.map((t) => (
            <TemplateCard key={t.id} template={t} />
          ))}
        </Rail>

        <Rail title="Popular Dialogues" href="/dialogues" variant="dialogue">
          {dialogues.map((d) => (
            <DialogueCard key={d.slug} dialogue={d} />
          ))}
        </Rail>

        <Rail title="Latest Templates" variant="still">
          {latest.map((t) => (
            <TemplateCard key={t.id} template={t} />
          ))}
        </Rail>
      </div>
    </>
  );
}
