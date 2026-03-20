export type WatchItem = {
  id: string;
  series: string;
  episodes: string;
  notes?: string;
};

export type Phase = {
  id: string;
  phase: string;
  items: WatchItem[];
};

export const watchOrder: Phase[] = [
  {
    id: "year-1",
    phase: "Year 1 (2012-2013)",
    items: [
      { id: "y1-1", series: "Arrow", episodes: "Season 1, Episodes 1-23", notes: "The beginning of the Arrowverse." }
    ]
  },
  {
    id: "year-2",
    phase: "Year 2 (2013-2014)",
    items: [
      { id: "y2-1", series: "Arrow", episodes: "Season 2, Episodes 1-7" },
      { id: "y2-2", series: "Arrow", episodes: "Season 2, Episodes 8-9", notes: "Barry Allen's introduction." },
      { id: "y2-3", series: "Arrow", episodes: "Season 2, Episodes 10-23" }
    ]
  },
  {
    id: "year-3",
    phase: "Year 3 (2014-2015)",
    items: [
      { id: "y3-1", series: "The Flash", episodes: "Season 1, Episodes 1-7", notes: "Watch alternating with Arrow if you prefer, but watching blocks is easier." },
      { id: "y3-2", series: "Arrow", episodes: "Season 3, Episodes 1-7" },
      { id: "y3-3", series: "Crossover", episodes: "Flash vs. Arrow", notes: "Part 1: The Flash 1x08, Part 2: Arrow 3x08" },
      { id: "y3-4", series: "The Flash", episodes: "Season 1, Episodes 9-23" },
      { id: "y3-5", series: "Arrow", episodes: "Season 3, Episodes 9-23" },
      { id: "y3-6", series: "Constantine", episodes: "Season 1, Episodes 1-13", notes: "Optional, but Constantine later joins Legends of Tomorrow." }
    ]
  },
  {
    id: "year-4",
    phase: "Year 4 (2015-2016)",
    items: [
      { id: "y4-1", series: "The Flash", episodes: "Season 2, Episodes 1-7" },
      { id: "y4-2", series: "Arrow", episodes: "Season 4, Episodes 1-7" },
      { id: "y4-3", series: "Supergirl", episodes: "Season 1, Episodes 1-17", notes: "Originally on CBS, but part of the multiverse." },
      { id: "y4-4", series: "Crossover", episodes: "Heroes Join Forces", notes: "Part 1: The Flash 2x08, Part 2: Arrow 4x08. Sets up Legends of Tomorrow." },
      { id: "y4-5", series: "The Flash", episodes: "Season 2, Episodes 9-17" },
      { id: "y4-6", series: "Arrow", episodes: "Season 4, Episodes 9-18" },
      { id: "y4-7", series: "Crossover", episodes: "Worlds Finest", notes: "Supergirl 1x18 (The Flash visits Supergirl's earth)" },
      { id: "y4-8", series: "Supergirl", episodes: "Season 1, Episodes 19-20" },
      { id: "y4-9", series: "Legends of Tomorrow", episodes: "Season 1, Episodes 1-16" },
      { id: "y4-10", series: "The Flash", episodes: "Season 2, Episodes 18-23" },
      { id: "y4-11", series: "Arrow", episodes: "Season 4, Episodes 19-23" }
    ]
  },
  {
    id: "year-5",
    phase: "Year 5 (2016-2017)",
    items: [
      { id: "y5-1", series: "Supergirl", episodes: "Season 2, Episodes 1-7" },
      { id: "y5-2", series: "The Flash", episodes: "Season 3, Episodes 1-7" },
      { id: "y5-3", series: "Arrow", episodes: "Season 5, Episodes 1-7" },
      { id: "y5-4", series: "Legends of Tomorrow", episodes: "Season 2, Episodes 1-6" },
      { id: "y5-5", series: "Crossover", episodes: "Invasion!", notes: "Supergirl 2x08 (Lead-in), The Flash 3x08 (Part 1), Arrow 5x08 (Part 2), Legends of Tomorrow 2x07 (Part 3)" },
      { id: "y5-6", series: "Supergirl", episodes: "Season 2, Episodes 9-15" },
      { id: "y5-7", series: "The Flash", episodes: "Season 3, Episodes 9-16" },
      { id: "y5-8", series: "Legends of Tomorrow", episodes: "Season 2, Episodes 8-17" },
      { id: "y5-9", series: "Arrow", episodes: "Season 5, Episodes 9-23" },
      { id: "y5-10", series: "Crossover", episodes: "Duet", notes: "Supergirl 2x16 (Lead-in), The Flash 3x17 (Musical Crossover)" },
      { id: "y5-11", series: "Supergirl", episodes: "Season 2, Episodes 17-22" },
      { id: "y5-12", series: "The Flash", episodes: "Season 3, Episodes 18-23" }
    ]
  },
  {
    id: "year-6",
    phase: "Year 6 (2017-2018)",
    items: [
      { id: "y6-1", series: "Supergirl", episodes: "Season 3, Episodes 1-7" },
      { id: "y6-2", series: "Arrow", episodes: "Season 6, Episodes 1-7" },
      { id: "y6-3", series: "The Flash", episodes: "Season 4, Episodes 1-7" },
      { id: "y6-4", series: "Legends of Tomorrow", episodes: "Season 3, Episodes 1-7" },
      { id: "y6-5", series: "Crossover", episodes: "Crisis on Earth-X", notes: "Part 1: Supergirl 3x08, Part 2: Arrow 6x08, Part 3: The Flash 4x08, Part 4: Legends of Tomorrow 3x08" },
      { id: "y6-6", series: "Supergirl", episodes: "Season 3, Episodes 9-23" },
      { id: "y6-7", series: "Arrow", episodes: "Season 6, Episodes 9-23" },
      { id: "y6-8", series: "The Flash", episodes: "Season 4, Episodes 9-23" },
      { id: "y6-9", series: "Legends of Tomorrow", episodes: "Season 3, Episodes 9-18" },
      { id: "y6-10", series: "Black Lightning", episodes: "Season 1, Episodes 1-13", notes: "Standalone for now, but good to watch here." }
    ]
  },
  {
    id: "year-7",
    phase: "Year 7 (2018-2019)",
    items: [
      { id: "y7-1", series: "The Flash", episodes: "Season 5, Episodes 1-8" },
      { id: "y7-2", series: "Arrow", episodes: "Season 7, Episodes 1-8" },
      { id: "y7-3", series: "Supergirl", episodes: "Season 4, Episodes 1-8" },
      { id: "y7-4", series: "Crossover", episodes: "Elseworlds", notes: "Part 1: The Flash 5x09, Part 2: Arrow 7x09, Part 3: Supergirl 4x09. Introduces Batwoman." },
      { id: "y7-5", series: "The Flash", episodes: "Season 5, Episodes 10-22" },
      { id: "y7-6", series: "Arrow", episodes: "Season 7, Episodes 10-22" },
      { id: "y7-7", series: "Supergirl", episodes: "Season 4, Episodes 10-22" },
      { id: "y7-8", series: "Legends of Tomorrow", episodes: "Season 4, Episodes 1-16" },
      { id: "y7-9", series: "Black Lightning", episodes: "Season 2, Episodes 1-16" }
    ]
  },
  {
    id: "year-8",
    phase: "Year 8 (2019-2020)",
    items: [
      { id: "y8-1", series: "Batwoman", episodes: "Season 1, Episodes 1-8" },
      { id: "y8-2", series: "Supergirl", episodes: "Season 5, Episodes 1-8" },
      { id: "y8-3", series: "Black Lightning", episodes: "Season 3, Episodes 1-8" },
      { id: "y8-4", series: "The Flash", episodes: "Season 6, Episodes 1-8" },
      { id: "y8-5", series: "Arrow", episodes: "Season 8, Episodes 1-7" },
      { id: "y8-6", series: "Crossover", episodes: "Crisis on Infinite Earths", notes: "Part 1: Supergirl 5x09, Part 2: Batwoman 1x09, Black Lightning 3x09 (Tie-in), Part 3: The Flash 6x09, Part 4: Arrow 8x08, Part 5: Legends of Tomorrow 5x00 (Special Episode)" },
      { id: "y8-7", series: "Arrow", episodes: "Season 8, Episodes 9-10", notes: "Series Finale" },
      { id: "y8-8", series: "Batwoman", episodes: "Season 1, Episodes 10-20" },
      { id: "y8-9", series: "Supergirl", episodes: "Season 5, Episodes 10-19" },
      { id: "y8-10", series: "Black Lightning", episodes: "Season 3, Episodes 10-16" },
      { id: "y8-11", series: "The Flash", episodes: "Season 6, Episodes 10-19" },
      { id: "y8-12", series: "Legends of Tomorrow", episodes: "Season 5, Episodes 1-15" }
    ]
  },
  {
    id: "year-9",
    phase: "Year 9 (2021)",
    items: [
      { id: "y9-1", series: "Batwoman", episodes: "Season 2, Episodes 1-18" },
      { id: "y9-2", series: "Black Lightning", episodes: "Season 4, Episodes 1-13", notes: "Series Finale" },
      { id: "y9-3", series: "Superman & Lois", episodes: "Season 1, Episodes 1-15" },
      { id: "y9-4", series: "Supergirl", episodes: "Season 6, Episodes 1-20", notes: "Series Finale" },
      { id: "y9-5", series: "Legends of Tomorrow", episodes: "Season 6, Episodes 1-15" },
      { id: "y9-6", series: "The Flash", episodes: "Season 7, Episodes 1-18" }
    ]
  },
  {
    id: "year-10",
    phase: "Year 10 (2021-2022)",
    items: [
      { id: "y10-1", series: "Crossover", episodes: "Armageddon", notes: "The Flash Season 8, Episodes 1-5" },
      { id: "y10-2", series: "The Flash", episodes: "Season 8, Episodes 6-20" },
      { id: "y10-3", series: "Legends of Tomorrow", episodes: "Season 7, Episodes 1-13", notes: "Series Finale" },
      { id: "y10-4", series: "Batwoman", episodes: "Season 3, Episodes 1-13", notes: "Series Finale" },
      { id: "y10-5", series: "Superman & Lois", episodes: "Season 2, Episodes 1-15" }
    ]
  },
  {
    id: "year-11",
    phase: "Year 11 (2023)",
    items: [
      { id: "y11-1", series: "The Flash", episodes: "Season 9, Episodes 1-13", notes: "Series Finale. The end of the Arrowverse." },
      { id: "y11-2", series: "Superman & Lois", episodes: "Season 3 & 4", notes: "Confirmed to be on a separate Earth, but part of the broader DC TV multiverse." }
    ]
  }
];
