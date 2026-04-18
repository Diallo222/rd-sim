export type RDParams = {
  label: string;
  feed: number;
  kill: number;
  Da: number;
  Db: number;
  dt: number;
  stepsPerFrame: number;
};

export const PRESETS = {
  coral: {
    label: "Coral",
    feed: 0.0545,
    kill: 0.062,
    Da: 1.0,
    Db: 0.5,
    dt: 1.0,
    stepsPerFrame: 8,
  },
  mitosis: {
    label: "Mitosis",
    feed: 0.0367,
    kill: 0.0649,
    Da: 1.0,
    Db: 0.5,
    dt: 1.0,
    stepsPerFrame: 8,
  },
  worms: {
    label: "Worms",
    feed: 0.078,
    kill: 0.061,
    Da: 1.0,
    Db: 0.5,
    dt: 1.0,
    stepsPerFrame: 8,
  },
  spots: {
    label: "Spots",
    feed: 0.035,
    kill: 0.065,
    Da: 1.0,
    Db: 0.5,
    dt: 1.0,
    stepsPerFrame: 8,
  },
  maze: {
    label: "Maze",
    feed: 0.029,
    kill: 0.057,
    Da: 1.0,
    Db: 0.5,
    dt: 1.0,
    stepsPerFrame: 8,
  },
} satisfies Record<string, RDParams>;

export type PresetKey = keyof typeof PRESETS;
