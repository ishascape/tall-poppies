import { memo } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { GardenBackdrop, GardenForeground } from './art/GardenBackdrop';
import { GardenFlower } from './art/GardenFlower';
import { ROWS, type Patch, type PlacedFlower } from '../lib/layout';
import { formatDay } from '../lib/dates';
import { randomFor } from '../lib/variation';
import type { Win } from '../lib/types';

type Props = {
  patch: Patch | null;
  onSelect?: (win: Win) => void;
  freshWinId?: string | null;
  highlightId?: string | null;
  /** Preview mode: smaller, not interactive. */
  preview?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export function GardenPatch({ patch, onSelect, freshWinId, highlightId, preview = false, className = '', children }: Props) {
  const reduced = useReducedMotion();
  const raw = useMotionValue(0);
  const px = useSpring(raw, { stiffness: 60, damping: 20 });

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    raw.set((e.clientX - r.left) / r.width - 0.5);
  };

  return (
    <div
      className={`garden-patch relative isolate overflow-hidden ${className}`}
      onPointerMove={onPointerMove}
      onPointerLeave={() => raw.set(0)}
    >
      <GardenBackdrop px={px} seed={patch?.index ?? 0} />
      {patch?.flowers.map((f) => (
        <FlowerButton
          key={f.win.id}
          flower={f}
          onSelect={onSelect}
          fresh={f.win.id === freshWinId}
          highlighted={f.win.id === highlightId}
          preview={preview}
        />
      ))}
      <GardenForeground px={px} seed={patch?.index ?? 0} />
      {children}
    </div>
  );
}

const FlowerButton = memo(function FlowerButton({
  flower,
  onSelect,
  fresh,
  highlighted,
  preview,
}: {
  flower: PlacedFlower;
  onSelect?: (win: Win) => void;
  fresh: boolean;
  highlighted: boolean;
  preview: boolean;
}) {
  const { win, x, y, scale, row, z } = flower;
  const rand = randomFor(win.id, 'sway');
  const swayStyle = {
    '--sway-duration': `${5 + rand() * 4}s`,
    '--sway-delay': `${-rand() * 6}s`,
    '--sway-amount': `${1.2 + rand() * 1.6}deg`,
  } as React.CSSProperties;
  const depth = ROWS.length - 1 - row; // 0 = front
  const style: React.CSSProperties = {
    left: `${x}%`,
    bottom: `${y}%`,
    width: `calc(min(23cqw, 19cqh) * ${scale})`,
    zIndex: 10 + row * 100 + z,
    filter: depth > 0 ? `saturate(${1 - depth * 0.1}) brightness(${1 + depth * 0.03})` : undefined,
  };
  const label = `${formatDay(win.date)}: ${win.text}`;

  const flowerArt = (
    <div className="flower-sway" style={swayStyle}>
      <GardenFlower variant={win.flowerVariant} animateIn={fresh} duration={1.4} hitArea={!preview} className="block w-full" />
    </div>
  );

  if (preview) {
    return (
      <div className="absolute -translate-x-1/2" style={style} aria-hidden="true">
        {flowerArt}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect?.(win)}
      className="group pointer-events-none absolute -translate-x-1/2 rounded-xl focus-visible:outline-offset-0"
      style={style}
      aria-label={label}
      data-win-id={win.id}
    >
      {highlighted && (
        <motion.span
          className="absolute bottom-[-4%] left-1/2 h-[12%] w-[90%] -translate-x-1/2 rounded-[50%] bg-gold/50 blur-[6px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2.2, repeat: Infinity }}
          aria-hidden="true"
        />
      )}
      <span className="block transition-transform duration-300 ease-out group-hover:-translate-y-1 group-focus-visible:-translate-y-1">{flowerArt}</span>
      <span
        className="pointer-events-none absolute bottom-full left-1/2 mb-1 hidden w-max max-w-[12rem] -translate-x-1/2 truncate rounded-full bg-ink px-3 py-1 text-xs font-medium text-paper opacity-0 shadow transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 md:block"
        aria-hidden="true"
      >
        {win.text}
      </span>
    </button>
  );
});
