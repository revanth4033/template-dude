import type { Actor } from "@/lib/types";

/**
 * PRD §32 asks for 15–20 actors. Ids are slugs and double as route segments.
 * Every actor here has at least one template — the seed script reports coverage,
 * and an actor with no templates would render an empty browse card.
 */
export const actors: Actor[] = [
  { id: "mahesh-babu", name: "Mahesh Babu" },
  { id: "allu-arjun", name: "Allu Arjun" },
  { id: "jr-ntr", name: "Jr NTR" },
  { id: "prabhas", name: "Prabhas" },
  { id: "pawan-kalyan", name: "Pawan Kalyan" },
  { id: "ram-charan", name: "Ram Charan" },
  { id: "ravi-teja", name: "Ravi Teja" },
  { id: "nani", name: "Nani" },
  { id: "venkatesh", name: "Venkatesh" },
  { id: "nagarjuna", name: "Nagarjuna" },
  { id: "chiranjeevi", name: "Chiranjeevi" },
  { id: "brahmanandam", name: "Brahmanandam" },
  { id: "vennela-kishore", name: "Vennela Kishore" },
  { id: "ali", name: "Ali" },
  { id: "siddharth", name: "Siddharth" },
  { id: "ram-pothineni", name: "Ram Pothineni" },
];

export const actorById = new Map(actors.map((a) => [a.id, a]));
