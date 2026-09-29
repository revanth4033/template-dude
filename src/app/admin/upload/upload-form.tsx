"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DraftStorageError,
  deleteDraft,
  fileToDataUrl,
  getDraftsServerSnapshot,
  getDraftsSnapshot,
  newDraftId,
  saveDraft,
  subscribeDrafts,
} from "@/lib/drafts";
import { movies } from "@/data/movies";
import { actors } from "@/data/actors";
import { emotions } from "@/data/emotions";
import type { DraftTemplate } from "@/lib/drafts";
import type { EmotionId } from "@/lib/types";

/**
 * Admin upload form (PRD §28): image, dialogue, movie, actor, emotion, publish.
 *
 * The four metadata fields are all required — a template missing any of them is
 * unfindable, since those fields *are* the search index (PRD §31).
 */

const sortedMovies = [...movies].sort((a, b) => a.name.localeCompare(b.name));
const sortedActors = [...actors].sort((a, b) => a.name.localeCompare(b.name));

type Errors = Partial<Record<"image" | "dialogue" | "movie" | "actor" | "emotion" | "form", string>>;

export function UploadForm() {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);

  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("");
  const [dialogue, setDialogue] = useState("");
  const [movieId, setMovieId] = useState<string>("");
  const [actorId, setActorId] = useState<string>("");
  const [emotion, setEmotion] = useState<string>("");
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);

  /**
   * Clears one field's error. Errors are raised on submit, but leaving them up after
   * the user has fixed the field reads as "still wrong" — so each field drops its
   * own message the moment it changes.
   */
  const clearError = (field: keyof Errors) => setErrors((p) => ({ ...p, [field]: undefined }));

  // localStorage is an external store; the binding also picks up writes from
  // another tab. `null` means "still hydrating", which renders as no drafts yet.
  const drafts =
    useSyncExternalStore(subscribeDrafts, getDraftsSnapshot, getDraftsServerSnapshot) ?? [];

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((p) => ({ ...p, image: "That file isn't an image." }));
      return;
    }
    setBusy(true);
    try {
      setImageDataUrl(await fileToDataUrl(file));
      setImageName(file.name);
      setErrors((p) => ({ ...p, image: undefined }));
    } catch (err) {
      setErrors((p) => ({ ...p, image: (err as Error).message }));
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const next: Errors = {};
    if (!imageDataUrl) next.image = "Add a template image.";
    if (!dialogue.trim()) next.dialogue = "Enter the dialogue spoken in this scene.";
    if (!movieId) next.movie = "Choose a movie.";
    if (!actorId) next.actor = "Choose an actor.";
    if (!emotion) next.emotion = "Choose an emotion.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const movie = movies.find((m) => m.id === movieId)!;
    const actor = actors.find((a) => a.id === actorId)!;

    const draft: DraftTemplate = {
      id: newDraftId(),
      image: imageDataUrl!,
      dialogue: dialogue.trim(),
      movie: { id: movie.id, name: movie.name, year: movie.year },
      actor: { id: actor.id, name: actor.name },
      emotion: emotion as EmotionId,
      downloads: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    try {
      saveDraft(draft);
    } catch (err) {
      setErrors({
        form:
          err instanceof DraftStorageError
            ? err.message
            : "Couldn't save this template in your browser.",
      });
      return;
    }

    router.push(`/templates/${draft.id}`);
  }

  function removeDraft(id: string) {
    // The store notifies subscribers, so the list re-renders on its own.
    deleteDraft(id);
  }

  return (
    <div className="gutter grid gap-10 pb-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
      <form onSubmit={onSubmit} noValidate className="max-w-xl space-y-6">
        {/* Image */}
        <Field label="Template Image" error={errors.image} htmlFor="image">
          <input
            ref={fileInput}
            id="image"
            type="file"
            accept="image/*"
            onChange={onPickFile}
            className="sr-only"
          />
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-sm border border-dashed border-input bg-surface px-4 py-8 text-sm font-medium text-muted-foreground transition-colors hover:border-white/40 hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
          >
            {busy ? (
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
            ) : (
              <ImagePlus className="size-5" aria-hidden="true" />
            )}
            {imageName || "Choose an image"}
          </button>
          {imageDataUrl && (
            <div className="mt-3 overflow-hidden rounded-sm border border-hairline">
              {/* eslint-disable-next-line @next/next/no-img-element -- local data: URL */}
              <img src={imageDataUrl} alt="Selected template preview" className="w-full" />
            </div>
          )}
        </Field>

        {/* Dialogue */}
        <Field label="Dialogue" error={errors.dialogue} htmlFor="dialogue">
          <input
            id="dialogue"
            value={dialogue}
            onChange={(e) => {
              setDialogue(e.target.value);
              clearError("dialogue");
            }}
            placeholder="Aata chusthava"
            className="w-full rounded-sm border border-input bg-surface px-3 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:border-white/50 focus:outline-none"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            The line spoken in this scene. This is what people search by — there is no
            separate description field.
          </p>
        </Field>

        <Field label="Movie" error={errors.movie}>
          <Picker
            placeholder="Select movie"
            value={movieId}
            onChange={(v) => {
              setMovieId(v);
              clearError("movie");
            }}
            items={sortedMovies.map((m) => ({ value: m.id, label: `${m.name} (${m.year})` }))}
          />
        </Field>

        <Field label="Actor" error={errors.actor}>
          <Picker
            placeholder="Select actor"
            value={actorId}
            onChange={(v) => {
              setActorId(v);
              clearError("actor");
            }}
            items={sortedActors.map((a) => ({ value: a.id, label: a.name }))}
          />
        </Field>

        <Field label="Emotion" error={errors.emotion}>
          <Picker
            placeholder="Select emotion"
            value={emotion}
            onChange={(v) => {
              setEmotion(v);
              clearError("emotion");
            }}
            items={emotions.map((e) => ({ value: e.id, label: `${e.emoji}  ${e.name}` }))}
          />
        </Field>

        {errors.form && (
          <p role="alert" className="text-sm font-medium text-brand">
            {errors.form}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-sm bg-brand px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-hover focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none disabled:opacity-60"
        >
          <Upload className="size-4" aria-hidden="true" />
          Publish Template
        </button>
      </form>

      <aside className="space-y-6">
        <div className="rounded-sm border border-hairline bg-surface p-4">
          <h2 className="text-sm font-bold text-white">This browser only</h2>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            The MVP has no backend, so publishing saves the template in this browser. It
            won&apos;t appear for anyone else, in search, or on browse pages. To add it to
            the library for real, copy the record shown after publishing into{" "}
            <code className="text-white">src/data/dialogues.ts</code> and re-run{" "}
            <code className="text-white">npm run seed</code>.
          </p>
        </div>

        {drafts.length > 0 && (
          <div className="rounded-sm border border-hairline bg-surface p-4">
            <h2 className="text-sm font-bold text-white">
              Saved in this browser ({drafts.length})
            </h2>
            <ul className="mt-3 space-y-2">
              {drafts.map((draft) => (
                <li key={draft.id} className="flex items-center gap-2">
                  <Link
                    href={`/templates/${draft.id}`}
                    className="min-w-0 flex-1 truncate text-xs text-muted-foreground transition-colors hover:text-white"
                  >
                    {draft.dialogue}{" "}
                    <span className="text-white/40">· {draft.movie.name}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeDraft(draft.id)}
                    aria-label={`Delete draft: ${draft.dialogue}`}
                    className="shrink-0 rounded-sm p-1 text-muted-foreground transition-colors hover:text-brand focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
}

function Field({
  label,
  error,
  htmlFor,
  children,
}: {
  label: string;
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-sm font-semibold text-white"
      >
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1.5 text-xs font-medium text-brand">
          {error}
        </p>
      )}
    </div>
  );
}

function Picker({
  placeholder,
  value,
  onChange,
  items,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  items: { value: string; label: string }[];
}) {
  const selected = items.find((i) => i.value === value);
  return (
    <Select value={value || null} onValueChange={(next) => onChange(next ?? "")}>
      <SelectTrigger className="h-11 w-full border-input bg-surface text-sm text-white">
        <SelectValue>{selected?.label ?? placeholder}</SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
