"use client";

/**
 * Draft templates uploaded through /admin/upload.
 *
 * ⚠️ The MVP has no backend (PRD §39 rules out a database), so "publishing" can only
 * mean *this browser*. Drafts live in localStorage, are visible only to whoever
 * created them, and vanish when site data is cleared. The upload page says so
 * plainly rather than implying a real publish.
 *
 * The honest output of the flow is the JSON record: paste it into
 * src/data/dialogues.ts (or templates.ts) and it becomes a real template.
 */
import type { EmotionId, Template } from "@/lib/types";

const KEY = "ttl.drafts.v1";
/** Each draft carries a base64 image, so the store has to stay small. */
const MAX_DRAFTS = 20;

export type DraftTemplate = Template;

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function listDrafts(): DraftTemplate[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as DraftTemplate[]) : [];
  } catch {
    // Corrupt or unreadable store (private mode, cleared data) — behave as empty.
    return [];
  }
}

export function getDraft(id: string): DraftTemplate | undefined {
  return listDrafts().find((d) => d.id === id);
}

/*
 * ── React binding ──────────────────────────────────────────────────────────
 *
 * localStorage is an external store, so components read it through
 * useSyncExternalStore rather than an effect-plus-setState. Two reasons that
 * matters here: the snapshot has to be reference-stable or React re-renders
 * forever, and the server snapshot has to be distinguishable from "no drafts" so a
 * page can show a skeleton while hydrating instead of flashing "not found".
 *
 * Hence the server snapshot is `null` (meaning "not known yet") while the client
 * snapshot is always an array.
 */

let cache: DraftTemplate[] | null = null;
const listeners = new Set<() => void>();

function invalidate() {
  cache = null;
  for (const listener of listeners) listener();
}

export function getDraftsSnapshot(): DraftTemplate[] {
  cache ??= listDrafts();
  return cache;
}

/** `null` means "still hydrating" — the server can't see localStorage. */
export function getDraftsServerSnapshot(): DraftTemplate[] | null {
  return null;
}

export function subscribeDrafts(onChange: () => void): () => void {
  listeners.add(onChange);

  // Another tab writing to the same key should update this one.
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY || event.key === null) invalidate();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export class DraftStorageError extends Error {}

export function saveDraft(draft: DraftTemplate): void {
  if (!canUseStorage()) throw new DraftStorageError("This browser has no local storage.");

  const next = [draft, ...listDrafts().filter((d) => d.id !== draft.id)].slice(0, MAX_DRAFTS);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    invalidate();
  } catch {
    throw new DraftStorageError(
      "Couldn't save — browser storage is full. Delete a draft and try again.",
    );
  }
}

export function deleteDraft(id: string): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(listDrafts().filter((d) => d.id !== id)));
    invalidate();
  } catch {
    /* nothing useful to do if the write fails */
  }
}

/** Stable-ish id for a new draft; the `draft-` prefix keeps it clear of tpl-NNN. */
export function newDraftId(): string {
  return `draft-${Date.now().toString(36)}`;
}

/**
 * Reads a File into a downscaled data URL.
 *
 * Downscaling isn't cosmetic: localStorage caps out around 5MB, and a phone
 * screenshot pasted in raw would blow the whole budget in one upload.
 */
export function fileToDataUrl(file: File, maxWidth = 1280): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Couldn't read that file."));
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error("That file isn't a readable image."));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Couldn't process that image."));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/** The record to paste into the seed data to make a draft real. */
export function toSeedRecord(draft: DraftTemplate): string {
  return JSON.stringify(
    {
      dialogue: draft.dialogue,
      movieId: draft.movie.id,
      actorId: draft.actor.id,
      emotion: draft.emotion as EmotionId,
    },
    null,
    2,
  );
}
