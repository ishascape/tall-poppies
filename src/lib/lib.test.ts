import { describe, expect, it } from 'vitest';
import { FLOURISHES, GROWTH_STAGES, getGrowth, getStage, stageChanged } from './growth';
import { hashString, isValidVariant, variantFor } from './variation';
import { createWin, editWin, removeWin, sortWins, upsertWin } from './wins';
import { emptyData, loadData, parseData, saveData, STORAGE_KEY } from './storage';
import { layoutGarden, PATCH_CAPACITY, patchIndexOf, SLOT_ORDER } from './layout';
import { pickReflection } from './reflection';
import { CELEBRATION, timelineTotal } from './motion';
import type { Win } from './types';

const day = (offset: number) => {
  const d = new Date(2026, 9, 29);
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function makeWins(n: number): Win[] {
  return Array.from({ length: n }, (_, i) =>
    createWin({ text: `Win number ${i + 1}`, date: day(-n + i) }, new Date(2026, 9, 29, 12, 0, i), `id-${i}`),
  );
}

describe('growth', () => {
  it('maps counts to the specified stages', () => {
    const expected: [number, string][] = [
      [0, 'seed'], [1, 'sprout'], [2, 'sprout'], [3, 'bud'], [6, 'bud'],
      [7, 'bloom'], [14, 'bloom'], [15, 'mature'], [500, 'mature'],
    ];
    for (const [n, id] of expected) expect(getStage(n).id).toBe(id);
  });

  it('changes stage exactly at 1, 3, 7 and 15', () => {
    const changes = Array.from({ length: 30 }, (_, n) => n).filter((n) => n > 0 && stageChanged(n - 1, n));
    expect(changes).toEqual([1, 3, 7, 15]);
  });

  it('recalculates downwards when wins are deleted', () => {
    expect(getStage(14).id).toBe('bloom');
    expect(stageChanged(15, 14)).toBe(true);
  });

  it('thresholds are ascending and flourishes start after maturity', () => {
    const mins = GROWTH_STAGES.map((s) => s.min);
    expect([...mins].sort((a, b) => a - b)).toEqual(mins);
    expect(Math.min(...FLOURISHES.map((f) => f.min))).toBeGreaterThan(GROWTH_STAGES.at(-1)!.min);
    expect(getGrowth(19).flourishes.size).toBe(0);
    expect(getGrowth(200).flourishes.size).toBe(FLOURISHES.length);
  });

  it('reports progress within a stage', () => {
    expect(getGrowth(5).progress).toBeCloseTo(2 / 4);
    expect(getGrowth(40).progress).toBe(1);
  });
});

describe('variation', () => {
  it('is deterministic for an id', () => {
    expect(variantFor('abc')).toEqual(variantFor('abc'));
    expect(hashString('abc')).toBe(hashString('abc'));
  });

  it('produces valid, varied flowers', () => {
    const variants = Array.from({ length: 200 }, (_, i) => variantFor(`win-${i}`));
    variants.forEach((v) => expect(isValidVariant(v)).toBe(true));
    expect(new Set(variants.map((v) => v.color)).size).toBeGreaterThan(5);
    expect(new Set(variants.map((v) => v.petalVariant)).size).toBe(4);
    expect(new Set(variants.map((v) => v.leafVariant)).size).toBe(4);
  });
});

describe('wins CRUD', () => {
  it('creates, edits without changing the flower, and deletes', () => {
    const w = createWin({ text: '  I went for a walk  ', date: day(0), category: 'life' });
    expect(w.text).toBe('I went for a walk');
    expect(w.id).toMatch(/^[0-9a-f-]{36}$/);
    const edited = editWin(w, { text: 'I went for a long walk', date: day(-1) }, new Date(Date.now() + 1000));
    expect(edited.flowerVariant).toEqual(w.flowerVariant);
    expect(edited.id).toBe(w.id);
    expect(edited.category).toBeUndefined();
    expect(edited.updatedAt > w.updatedAt).toBe(true);
    let list = upsertWin([], w);
    list = upsertWin(list, edited);
    expect(list).toHaveLength(1);
    expect(removeWin(list, w.id)).toHaveLength(0);
  });

  it('sorts by date then planting time', () => {
    const wins = makeWins(5).reverse();
    expect(sortWins(wins).map((w) => w.id)).toEqual(['id-0', 'id-1', 'id-2', 'id-3', 'id-4']);
  });
});

describe('storage', () => {
  const mem = () => {
    const m = new Map<string, string>();
    return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), m };
  };

  it('handles missing data', () => {
    expect(parseData(null)).toEqual({ data: emptyData(), recovered: false });
    expect(parseData(JSON.stringify(emptyData())).repaired).toBe(false);
  });

  it('recovers from corrupted JSON and backs it up', () => {
    const s = mem();
    s.setItem(STORAGE_KEY, '{not json');
    const { data, recovered } = loadData(s);
    expect(recovered).toBe(true);
    expect(data.wins).toEqual([]);
    expect([...s.m.keys()].some((k) => k.startsWith(`${STORAGE_KEY}:backup:`))).toBe(true);
  });

  it('keeps valid wins, drops broken ones, repairs variants', () => {
    const [good, other] = makeWins(2);
    const text = JSON.stringify({
      version: 1,
      wins: [good, { ...other, flowerVariant: { color: 'nope' } }, { id: 'x' }, null, good],
      preferences: { welcomed: true },
    });
    const { data, recovered } = parseData(text);
    expect(recovered).toBe(true);
    expect(data.wins.map((w) => w.id)).toEqual([good.id, other.id]);
    expect(data.wins[1].flowerVariant).toEqual(variantFor(other.id));
  });

  it('round-trips and migrates the legacy array shape', () => {
    const s = mem();
    const data = { ...emptyData(), wins: makeWins(3), preferences: { welcomed: true } };
    saveData(data, s);
    expect(loadData(s).data).toEqual(data);
    expect(parseData(JSON.stringify(makeWins(2))).data.wins).toHaveLength(2);
  });
});

describe('garden layout', () => {
  it('uses every slot exactly once', () => {
    expect(new Set(SLOT_ORDER).size).toBe(PATCH_CAPACITY);
  });

  it('scales to 100+ wins with every win placed once', () => {
    const wins = makeWins(137);
    const patches = layoutGarden(wins);
    expect(patches).toHaveLength(Math.ceil(137 / PATCH_CAPACITY));
    const placed = patches.flatMap((p) => p.flowers.map((f) => f.win.id));
    expect(new Set(placed).size).toBe(137);
    for (const p of patches) for (const f of p.flowers) {
      expect(f.x).toBeGreaterThan(0);
      expect(f.x).toBeLessThan(100);
    }
    expect(patchIndexOf(wins, 'id-136')).toBe(4);
  });

  it('places flowers deterministically', () => {
    const wins = makeWins(10);
    expect(layoutGarden(wins)).toEqual(layoutGarden(wins));
  });
});

describe('reflection', () => {
  it('needs enough older wins and is stable for a day', () => {
    expect(pickReflection(makeWins(2), day(0))).toBeNull();
    const fresh = [0, 0, 0].map((_, i) => createWin({ text: 'x', date: day(0) }, new Date(), `f${i}`));
    expect(pickReflection(fresh, day(0))).toBeNull();
    const wins = makeWins(20);
    const days = Array.from({ length: 12 }, (_, i) => day(i));
    const picks = days.map((d) => pickReflection(wins, d));
    expect(days.map((d) => pickReflection(wins, d))).toEqual(picks);
    expect(picks.filter(Boolean).length).toBeGreaterThan(0);
    picks.forEach((p) => p && expect(wins).toContain(p));
  });

  it('respects dismissal for today', () => {
    const wins = makeWins(20);
    expect(pickReflection(wins, day(1), day(1))).toBeNull();
  });
});

describe('motion', () => {
  it('first celebration lasts 2–3 seconds and later ones are shorter', () => {
    const first = timelineTotal(CELEBRATION.first);
    expect(first).toBeGreaterThanOrEqual(2);
    expect(first).toBeLessThanOrEqual(3);
    expect(timelineTotal(CELEBRATION.later)).toBeLessThan(first);
  });
});
