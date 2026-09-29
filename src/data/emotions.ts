import type { Emotion } from "@/lib/types";

/**
 * The 15 emotions from PRD §32. Emoji for the eight listed in PRD §25 are taken
 * verbatim; the rest follow the same register. Each carries an accent colour used
 * for emotion cards and badge tinting — chosen to stay legible on #000.
 */
export const emotions: Emotion[] = [
  { id: "angry", name: "Angry", emoji: "😡", accent: "#e50914" },
  { id: "happy", name: "Happy", emoji: "😂", accent: "#f5a524" },
  { id: "sad", name: "Sad", emoji: "😭", accent: "#4a7dff" },
  { id: "confused", name: "Confused", emoji: "🤔", accent: "#a06cd5" },
  { id: "shocked", name: "Shocked", emoji: "😱", accent: "#00c2a8" },
  { id: "excited", name: "Excited", emoji: "🤩", accent: "#ff6b35" },
  { id: "frustrated", name: "Frustrated", emoji: "😤", accent: "#c1440e" },
  { id: "disappointed", name: "Disappointed", emoji: "😞", accent: "#6b7f99" },
  { id: "emotional", name: "Emotional", emoji: "🥲", accent: "#e0709a" },
  { id: "scared", name: "Scared", emoji: "😨", accent: "#7a5cff" },
  { id: "surprised", name: "Surprised", emoji: "😲", accent: "#19a7e0" },
  { id: "laughing", name: "Laughing", emoji: "🤣", accent: "#ffd23f" },
  { id: "crying", name: "Crying", emoji: "😢", accent: "#3f7cac" },
  { id: "love", name: "Love", emoji: "😍", accent: "#ff4d8d" },
  { id: "serious", name: "Serious", emoji: "😐", accent: "#9aa0a6" },
];

export const emotionById = new Map(emotions.map((e) => [e.id, e]));
