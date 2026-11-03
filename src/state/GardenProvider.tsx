import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Preferences, Win, WinDraft } from '../lib/types';
import { createWin, editWin, removeWin, sortWins, upsertWin } from '../lib/wins';
import { LocalWinRepository, type WinRepository } from '../lib/repository';
import { STORAGE_KEY } from '../lib/storage';
import { getStage } from '../lib/growth';

export type Celebration = {
  win: Win;
  first: boolean;
  countBefore: number;
  countAfter: number;
};

export type Toast = { id: number; message: string; action?: { label: string; run: () => void } };

export type SheetState = { mode: 'plant' } | { mode: 'edit'; win: Win } | null;

type GardenContextValue = {
  ready: boolean;
  wins: Win[];
  preferences: Preferences;
  recovered: boolean;
  /** Count the signature poppy should show: holds the old count while a celebration plays so it grows afterwards, in view. */
  displayCount: number;
  celebration: Celebration | null;
  freshWinId: string | null;
  sheet: SheetState;
  toasts: Toast[];
  plantWin: (draft: WinDraft) => Win;
  updateWin: (id: string, draft: WinDraft) => void;
  deleteWin: (id: string) => void;
  finishCelebration: () => void;
  openPlant: () => void;
  openEdit: (win: Win) => void;
  closeSheet: () => void;
  markWelcomed: () => void;
  dismissReflection: (day: string) => void;
  toast: (message: string, action?: Toast['action']) => void;
  dismissToast: (id: number) => void;
};

const GardenContext = createContext<GardenContextValue | null>(null);

export function GardenProvider({ children, repository }: { children: ReactNode; repository?: WinRepository }) {
  const repo = useMemo(() => repository ?? new LocalWinRepository(), [repository]);
  const [ready, setReady] = useState(false);
  const [wins, setWins] = useState<Win[]>([]);
  const [preferences, setPreferences] = useState<Preferences>({ welcomed: false });
  const [recovered, setRecovered] = useState(false);
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const [freshWinId, setFreshWinId] = useState<string | null>(null);
  const [sheet, setSheet] = useState<SheetState>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);
  const skipSave = useRef(true);

  const load = useCallback(async () => {
    const data = await repo.load();
    // Write back only when loading had to repair something.
    skipSave.current = !data.repaired;
    setWins(sortWins(data.wins));
    setPreferences(data.preferences);
    setRecovered(data.recovered);
    setReady(true);
  }, [repo]);

  useEffect(() => {
    void load();
  }, [load]);

  // Keep other open tabs in step.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) void load();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [load]);

  useEffect(() => {
    if (!ready) return;
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    void repo.saveAll(wins, preferences).then((ok) => {
      if (!ok) pushToast("We couldn't save to this browser. Your garden will last until you close the tab.");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wins, preferences, ready, repo]);

  const pushToast = useCallback((message: string, action?: Toast['action']) => {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-2), { id, message, action }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), action ? 7000 : 4200);
  }, []);

  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const plantWin = useCallback(
    (draft: WinDraft) => {
      const win = createWin(draft);
      const before = wins.length;
      setWins((w) => upsertWin(w, win));
      setPreferences((p) => (p.welcomed ? p : { ...p, welcomed: true }));
      setCelebration({ win, first: before === 0, countBefore: before, countAfter: before + 1 });
      setSheet(null);
      return win;
    },
    [wins.length],
  );

  const updateWin = useCallback((id: string, draft: WinDraft) => {
    setWins((w) => {
      const current = w.find((x) => x.id === id);
      return current ? upsertWin(w, editWin(current, draft)) : w;
    });
    setSheet(null);
    pushToast('Your win has been tended to.');
  }, [pushToast]);

  const deleteWin = useCallback(
    (id: string) => {
      const removed = wins.find((w) => w.id === id);
      if (!removed) return;
      setWins((w) => removeWin(w, id));
      pushToast('That win has been returned to the soil.', {
        label: 'Undo',
        run: () => setWins((w) => upsertWin(w, removed)),
      });
    },
    [wins, pushToast],
  );

  const finishCelebration = useCallback(() => {
    setCelebration((c) => {
      if (c) {
        setFreshWinId(c.win.id);
        window.setTimeout(() => setFreshWinId((f) => (f === c.win.id ? null : f)), 4000);
      }
      return null;
    });
  }, []);

  const value: GardenContextValue = {
    ready,
    wins,
    preferences,
    recovered,
    displayCount: celebration ? celebration.countBefore : wins.length,
    celebration,
    freshWinId,
    sheet,
    toasts,
    plantWin,
    updateWin,
    deleteWin,
    finishCelebration,
    openPlant: useCallback(() => setSheet({ mode: 'plant' }), []),
    openEdit: useCallback((win: Win) => setSheet({ mode: 'edit', win }), []),
    closeSheet: useCallback(() => setSheet(null), []),
    markWelcomed: useCallback(() => setPreferences((p) => ({ ...p, welcomed: true })), []),
    dismissReflection: useCallback((day: string) => setPreferences((p) => ({ ...p, reflectionDismissedOn: day })), []),
    toast: pushToast,
    dismissToast,
  };

  return <GardenContext.Provider value={value}>{children}</GardenContext.Provider>;
}

export function useGarden() {
  const ctx = useContext(GardenContext);
  if (!ctx) throw new Error('useGarden must be used inside <GardenProvider>');
  return ctx;
}

export function stageNameAfter(c: Celebration): string | null {
  const before = getStage(c.countBefore);
  const after = getStage(c.countAfter);
  return before.id === after.id ? null : after.id;
}
