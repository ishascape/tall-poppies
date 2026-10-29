import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { X } from 'lucide-react';

const FOCUSABLE = 'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';

export type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  /** Hide the title visually but keep it for screen readers. */
  hideTitle?: boolean;
  description?: ReactNode;
  children: ReactNode;
  /** 'sheet' rises from the bottom on phones; 'center' is a small modal. */
  variant?: 'sheet' | 'center';
  initialFocus?: React.RefObject<HTMLElement | null>;
  role?: 'dialog' | 'alertdialog';
};

/** Accessible modal: focus trap, Escape to close, focus returns to the opener. */
export function Dialog({ open, onClose, title, hideTitle, description, children, variant = 'sheet', initialFocus, role = 'dialog' }: DialogProps) {
  const titleId = useId();
  const descId = useId();
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => {
      const target = initialFocus?.current ?? panel.current?.querySelector<HTMLElement>(FOCUSABLE);
      target?.focus();
    }, 30);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prevOverflow;
      opener.current?.focus?.();
    };
  }, [open, initialFocus]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== 'Tab' || !panel.current) return;
    const items = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const isSheet = variant === 'sheet';

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" onKeyDown={onKeyDown}>
          <motion.div
            className="absolute inset-0 bg-[#2a241e]/35 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={panel}
            role={role}
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descId : undefined}
            className={`relative w-full bg-paper shadow-[0_-10px_40px_-20px_rgba(42,36,30,0.5)] ${
              isSheet
                ? 'max-h-[92dvh] overflow-y-auto rounded-t-[28px] px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 sm:max-w-lg sm:rounded-[28px] sm:px-8 sm:pb-8 sm:pt-6'
                : 'mx-4 mb-6 max-w-sm rounded-[24px] p-6 sm:mb-0'
            }`}
            initial={reduced ? { opacity: 0 } : isSheet ? { y: '100%' } : { opacity: 0, scale: 0.96, y: 8 }}
            animate={reduced ? { opacity: 1 } : isSheet ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : isSheet ? { y: '100%' } : { opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          >
            {isSheet && <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line sm:hidden" aria-hidden="true" />}
            <div className="flex items-start justify-between gap-4">
              <h2 id={titleId} className={hideTitle ? 'sr-only' : 'display text-2xl leading-tight text-ink sm:text-[1.7rem]'}>
                {title}
              </h2>
              {role === 'dialog' && (
                <button
                  type="button"
                  onClick={onClose}
                  className="-mr-2 -mt-1 ml-auto grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
                  aria-label="Close"
                >
                  <X size={20} strokeWidth={1.8} />
                </button>
              )}
            </div>
            {description && (
              <p id={descId} className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">
                {description}
              </p>
            )}
            <div className="mt-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
