import { motion } from 'motion/react';
import { CATEGORY_LABELS, WIN_CATEGORIES, type WinCategory } from '../../lib/types';

export const CATEGORY_TINT: Record<WinCategory, string> = {
  work: '#C9A04A',
  life: '#7F9A6B',
  courage: '#C7352B',
  learning: '#5E7FA0',
  kindness: '#E8775C',
  other: '#9C8B78',
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
            className={`inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-sm font-medium transition-colors ${
              active ? 'bg-ink text-paper' : 'bg-ivory text-ink-soft ring-1 ring-line hover:text-ink hover:ring-ink/25'
            }`}
          >
            <span className="h-2 w-2 rounded-full" style={{ background: CATEGORY_TINT[c] }} aria-hidden="true" />
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
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: CATEGORY_TINT[category] }} aria-hidden="true" />
      {CATEGORY_LABELS[category]}
    </span>
  );
}
