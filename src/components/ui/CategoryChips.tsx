import { motion } from 'motion/react';
import { CATEGORY_LABELS, WIN_CATEGORIES, type WinCategory } from '../../lib/types';

export const CATEGORY_TINT: Record<WinCategory, string> = {
  work: '#FFB800',
  life: '#00A651',
  courage: '#E60033',
  learning: '#2E5BFF',
  kindness: '#FF4F9A',
  other: '#7B2FF7',
};

/** Single-choice, optional: tapping the chosen chip again clears it. */
export function CategoryPicker({ value, onChange }: { value?: WinCategory; onChange: (c?: WinCategory) => void }) {
  return (
    <div role="group" aria-label="Category (optional)" className="flex flex-wrap gap-2">
      {WIN_CATEGORIES.map((c) => {
        const active = value === c;
        return (
          <motion.button
            key={c}
            type="button"
            aria-pressed={active}
            whileTap={{ scale: 0.94 }}
            onClick={() => onChange(active ? undefined : c)}
            className={`inline-flex h-9 items-center gap-2 rounded-full border-2 border-ink px-3.5 text-sm font-semibold transition-colors ${
              active ? 'bg-ink text-paper shadow-[2px_2px_0_var(--color-pink)]' : 'bg-paper text-ink hover:bg-ivory'
            }`}
          >
            <span className="h-2.5 w-2.5 rounded-full ring-[1.5px] ring-ink" style={{ background: CATEGORY_TINT[c] }} aria-hidden="true" />
            {CATEGORY_LABELS[c]}
          </motion.button>
        );
      })}
    </div>
  );
}

export function CategoryTag({ category }: { category?: WinCategory }) {
  if (!category) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
      <span className="h-2 w-2 rounded-full ring-[1.5px] ring-ink" style={{ background: CATEGORY_TINT[category] }} aria-hidden="true" />
      {CATEGORY_LABELS[category]}
    </span>
  );
}
