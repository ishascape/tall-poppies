import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Download, Flower2, Pencil, Sprout, Trash2 } from 'lucide-react';
import { useGarden } from '../state/GardenProvider';
import { navigate, useRoute } from '../state/router';
import { CATEGORY_LABELS, WIN_CATEGORIES, type Win, type WinCategory } from '../lib/types';
import { formatDay, formatMonth, formatWeekday, todayISO } from '../lib/dates';
import { CATEGORY_TINT, CategoryTag } from '../components/ui/CategoryChips';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Button } from '../components/ui/Button';
import { GardenFlower } from '../components/art/GardenFlower';

export function Journal() {
  const { wins, openEdit, deleteWin, openPlant } = useGarden();
  const { params } = useRoute();
  const filter = (WIN_CATEGORIES as readonly string[]).includes(params.get('category') ?? '') ? (params.get('category') as WinCategory) : undefined;
  const focusId = params.get('win');
  const [pendingDelete, setPendingDelete] = useState<Win | null>(null);

  const visible = useMemo(() => [...wins].reverse().filter((w) => !filter || w.category === filter), [wins, filter]);
  const groups = useMemo(() => {
    const map = new Map<string, Win[]>();
    for (const w of visible) {
      const key = w.date.slice(0, 7);
      map.set(key, [...(map.get(key) ?? []), w]);
    }
    return [...map.entries()];
  }, [visible]);
  const usedCategories = useMemo(() => new Set(wins.map((w) => w.category).filter(Boolean)), [wins]);

  useEffect(() => {
    if (!focusId) return;
    const t = window.setTimeout(() => {
      const el = document.getElementById(`win-${focusId}`);
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      el?.focus({ preventScroll: true });
    }, 250);
    return () => window.clearTimeout(t);
  }, [focusId]);

  const setFilter = (c?: WinCategory) => navigate(c ? `/journal?category=${c}` : '/journal', { replace: true });

  const exportWins = () => {
    const blob = new Blob([JSON.stringify({ app: 'Tall Poppies', exportedAt: new Date().toISOString(), wins }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tall-poppies-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-5 pb-32 pt-6 sm:px-8 md:pb-20">
      <header className="mb-8">
        <p className="eyebrow">Journal</p>
        <h1 className="display mt-1 text-[2.6rem] leading-none text-ink sm:text-6xl">Things you did</h1>
        <p className="mt-3 max-w-md text-[0.98rem] leading-relaxed text-ink-soft">Every win you've planted, newest first. Yours to keep, edit, or let go.</p>
      </header>

      {wins.length > 0 && (
        <div role="group" aria-label="Filter by category" className="-mx-5 mb-8 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
          <FilterChip active={!filter} onClick={() => setFilter(undefined)}>
            All
          </FilterChip>
          {WIN_CATEGORIES.filter((c) => usedCategories.has(c) || filter === c).map((c) => (
            <FilterChip key={c} active={filter === c} onClick={() => setFilter(c)} tint={CATEGORY_TINT[c]}>
              {CATEGORY_LABELS[c]}
            </FilterChip>
          ))}
        </div>
      )}

      {wins.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-line px-6 py-14 text-center">
          <p className="display text-2xl text-ink">Nothing here yet, and that's okay.</p>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-ink-soft">When something goes well, however small, plant it. It'll be waiting here for you.</p>
          <Button className="mt-6" icon={<Sprout size={17} />} onClick={openPlant}>
            Plant a win
          </Button>
        </div>
      ) : visible.length === 0 ? (
        <p className="py-10 text-center text-ink-soft">No {filter ? CATEGORY_LABELS[filter].toLowerCase() : ''} wins yet.</p>
      ) : (
        <div className="flex flex-col gap-10">
          {groups.map(([month, items]) => (
            <section key={month} aria-labelledby={`m-${month}`}>
              <h2 id={`m-${month}`} className="display mb-1 border-b border-line pb-2 text-xl italic text-ink-soft">
                {formatMonth(`${month}-01`)}
              </h2>
              <ol>
                <AnimatePresence initial={false}>
                  {items.map((w) => (
                    <motion.li
                      key={w.id}
                      layout={visible.length < 60}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, transition: { duration: 0.25 } }}
                      className="border-b border-line/70"
                    >
                      <article
                        id={`win-${w.id}`}
                        tabIndex={-1}
                        className={`group grid grid-cols-[2.75rem_1fr] gap-x-4 rounded-xl py-5 outline-none transition-colors focus-visible:bg-paper ${focusId === w.id ? 'bg-paper' : ''}`}
                        aria-label={`${formatDay(w.date)}: ${w.text}`}
                      >
                        <GardenFlower variant={w.flowerVariant} headOnly className="mt-0.5 h-11 w-11" />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <time dateTime={w.date} className="text-[0.78rem] font-semibold text-ink-soft">
                              {formatWeekday(w.date)} {formatDay(w.date)}
                            </time>
                            <CategoryTag category={w.category} />
                          </div>
                          <p className="display mt-1 text-[1.3rem] leading-snug text-ink [overflow-wrap:anywhere]">{w.text}</p>
                          <div className="mt-3 flex flex-wrap gap-1 text-ink-soft">
                            <IconAction label="See its flower" onClick={() => navigate(`/garden?win=${w.id}`)} icon={<Flower2 size={15} />} />
                            <IconAction label="Edit" onClick={() => openEdit(w)} icon={<Pencil size={15} />} />
                            <IconAction label="Remove" onClick={() => setPendingDelete(w)} icon={<Trash2 size={15} />} />
                          </div>
                        </div>
                      </article>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ol>
            </section>
          ))}
        </div>
      )}

      {wins.length > 0 && (
        <footer className="mt-14 flex flex-col items-center gap-2 text-center">
          <p className="text-sm text-ink-soft">Your wins live only on this device.</p>
          <Button variant="ghost" size="sm" icon={<Download size={15} />} onClick={exportWins}>
            Download a copy
          </Button>
        </footer>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Let this one go?"
        description="This win and its flower will leave your garden. Your signature poppy will be just fine."
        confirmLabel="Remove"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) deleteWin(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}

function FilterChip({ active, onClick, children, tint }: { active: boolean; onClick: () => void; children: React.ReactNode; tint?: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors ${
        active ? 'bg-ink text-paper' : 'bg-paper text-ink-soft ring-1 ring-line hover:text-ink'
      }`}
    >
      {tint && <span className="h-2 w-2 rounded-full" style={{ background: tint }} aria-hidden="true" />}
      {children}
    </button>
  );
}

function IconAction({ label, onClick, icon }: { label: string; onClick: () => void; icon: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[0.8rem] font-medium transition-colors hover:bg-ink/5 hover:text-ink"
    >
      {icon}
      {label}
    </button>
  );
}
