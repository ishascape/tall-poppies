import { GREEN, INK, POPPY, POPPY_DEEP, CORAL } from './palette';

export function PoppyMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 40" className={className} aria-hidden="true">
      <path d="M16 39 C15 30 17 24 16 17" stroke={GREEN} strokeWidth={2} fill="none" strokeLinecap="round" />
      <path d="M16 30 C12 27 8 28 6 30 C9 32 13 32 16 30Z" fill={GREEN} />
      <g stroke={POPPY_DEEP} strokeWidth={0.8} strokeLinejoin="round">
        <path d="M16 16 C9 18 4 13 6 7 C9 3 14 5 16 11Z" fill={POPPY} />
        <path d="M16 16 C23 18 28 13 26 7 C23 3 18 5 16 11Z" fill={POPPY} />
        <path d="M16 13 C11 10 12 3 16 2 C20 3 21 10 16 13Z" fill={CORAL} />
      </g>
      <ellipse cx="16" cy="12.5" rx="3" ry="1.8" fill={INK} />
    </svg>
  );
}

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <PoppyMark className="h-6 w-5" />
      <span className="font-display text-[1.15rem] italic leading-none tracking-tight text-ink" style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}>
        Tall Poppies
      </span>
    </span>
  );
}
