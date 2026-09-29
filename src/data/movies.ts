import type { Movie } from "@/lib/types";

/**
 * PRD §32 asks for 20–30 movies. `leadActorId` drives the "2024 · Mahesh Babu"
 * subtitle on movie detail pages (PRD §22); individual templates can still feature
 * any actor from that film.
 */
export const movies: Movie[] = [
  { id: "guntur-kaaram", name: "Guntur Kaaram", year: 2024, leadActorId: "mahesh-babu" },
  { id: "pokiri", name: "Pokiri", year: 2006, leadActorId: "mahesh-babu" },
  { id: "athadu", name: "Athadu", year: 2005, leadActorId: "mahesh-babu" },
  { id: "dookudu", name: "Dookudu", year: 2011, leadActorId: "mahesh-babu" },
  { id: "businessman", name: "Businessman", year: 2012, leadActorId: "mahesh-babu" },
  { id: "khaleja", name: "Khaleja", year: 2010, leadActorId: "mahesh-babu" },
  { id: "srimanthudu", name: "Srimanthudu", year: 2015, leadActorId: "mahesh-babu" },
  { id: "pushpa-the-rise", name: "Pushpa: The Rise", year: 2021, leadActorId: "allu-arjun" },
  { id: "pushpa-2-the-rule", name: "Pushpa 2: The Rule", year: 2024, leadActorId: "allu-arjun" },
  { id: "ala-vaikunthapurramuloo", name: "Ala Vaikunthapurramuloo", year: 2020, leadActorId: "allu-arjun" },
  { id: "race-gurram", name: "Race Gurram", year: 2014, leadActorId: "allu-arjun" },
  { id: "julayi", name: "Julayi", year: 2012, leadActorId: "allu-arjun" },
  { id: "arya", name: "Arya", year: 2004, leadActorId: "allu-arjun" },
  { id: "jalsa", name: "Jalsa", year: 2008, leadActorId: "pawan-kalyan" },
  { id: "gabbar-singh", name: "Gabbar Singh", year: 2012, leadActorId: "pawan-kalyan" },
  { id: "attarintiki-daredi", name: "Attarintiki Daredi", year: 2013, leadActorId: "pawan-kalyan" },
  { id: "rangasthalam", name: "Rangasthalam", year: 2018, leadActorId: "ram-charan" },
  { id: "magadheera", name: "Magadheera", year: 2009, leadActorId: "ram-charan" },
  { id: "rrr", name: "RRR", year: 2022, leadActorId: "jr-ntr" },
  { id: "devara", name: "Devara: Part 1", year: 2024, leadActorId: "jr-ntr" },
  { id: "temper", name: "Temper", year: 2015, leadActorId: "jr-ntr" },
  { id: "baahubali-the-beginning", name: "Baahubali: The Beginning", year: 2015, leadActorId: "prabhas" },
  { id: "baahubali-2-the-conclusion", name: "Baahubali 2: The Conclusion", year: 2017, leadActorId: "prabhas" },
  { id: "mirchi", name: "Mirchi", year: 2013, leadActorId: "prabhas" },
  { id: "vikramarkudu", name: "Vikramarkudu", year: 2006, leadActorId: "ravi-teja" },
  { id: "kick", name: "Kick", year: 2009, leadActorId: "ravi-teja" },
  { id: "eega", name: "Eega", year: 2012, leadActorId: "nani" },
  { id: "jersey", name: "Jersey", year: 2019, leadActorId: "nani" },
  { id: "bommarillu", name: "Bommarillu", year: 2006, leadActorId: "siddharth" },
  { id: "ready", name: "Ready", year: 2008, leadActorId: "ram-pothineni" },
  { id: "f2-fun-and-frustration", name: "F2: Fun and Frustration", year: 2019, leadActorId: "venkatesh" },
  { id: "manmadhudu", name: "Manmadhudu", year: 2002, leadActorId: "nagarjuna" },
  { id: "indra", name: "Indra", year: 2002, leadActorId: "chiranjeevi" },
];

export const movieById = new Map(movies.map((m) => [m.id, m]));
