/**
 * Signature poppy growth. The stage is always derived from the number of
 * wins, never stored, so it can't drift from the data.
 */

export type GrowthStageId = 'seed' | 'sprout' | 'bud' | 'bloom' | 'mature';

export type GrowthStage = {
  id: GrowthStageId;
  /** Minimum number of wins for this stage. */
  min: number;
  name: string;
  line: string;
};

export const GROWTH_STAGES: readonly GrowthStage[] = [
  { id: 'seed', min: 0, name: 'Seed', line: 'A seed, waiting patiently in warm soil.' },
  { id: 'sprout', min: 1, name: 'Sprout', line: 'Something is sprouting.' },
  { id: 'bud', min: 3, name: 'Bud', line: 'A bud is gathering itself.' },
  { id: 'bloom', min: 7, name: 'Bloom', line: 'Your poppy is in bloom.' },
  { id: 'mature', min: 15, name: 'Tall poppy', line: 'Standing tall, and still growing.' },
];

/**
 * After maturity the poppy keeps evolving through small details rather than
 * height. Each flourish unlocks at a win count and stays.
 */
export type FlourishId = 'leaves' | 'companionBud' | 'grasses' | 'seedHeads' | 'butterfly' | 'secondBloom';

export const FLOURISHES: readonly { id: FlourishId; min: number; name: string }[] = [
  { id: 'leaves', min: 20, name: 'fuller leaves' },
  { id: 'companionBud', min: 30, name: 'a companion bud' },
  { id: 'grasses', min: 45, name: 'meadow grasses' },
  { id: 'seedHeads', min: 65, name: 'golden seed heads' },
  { id: 'butterfly', min: 90, name: 'a visiting butterfly' },
  { id: 'secondBloom', min: 120, name: 'a second bloom' },
];

export type Growth = {
  stage: GrowthStage;
  stageIndex: number;
  next?: GrowthStage;
  /** 0–1 progress through the current stage (1 once mature). */
  progress: number;
  flourishes: Set<FlourishId>;
};

export function getStage(count: number): GrowthStage {
  const n = Math.max(0, Math.floor(count));
  let current = GROWTH_STAGES[0];
  for (const stage of GROWTH_STAGES) if (n >= stage.min) current = stage;
  return current;
}

export function getGrowth(count: number): Growth {
  const stage = getStage(count);
  const stageIndex = GROWTH_STAGES.indexOf(stage);
  const next = GROWTH_STAGES[stageIndex + 1];
  const progress = next ? (count - stage.min) / (next.min - stage.min) : 1;
  const flourishes = new Set(FLOURISHES.filter((f) => count >= f.min).map((f) => f.id));
  return { stage, stageIndex, next, progress, flourishes };
}

export function stageChanged(before: number, after: number): boolean {
  return getStage(before).id !== getStage(after).id;
}
