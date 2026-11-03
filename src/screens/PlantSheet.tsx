import { useEffect, useId, useRef, useState } from 'react';
import { Sprout, Trash2 } from 'lucide-react';
import { Dialog } from '../components/ui/Dialog';
import { Button } from '../components/ui/Button';
import { CategoryPicker } from '../components/ui/CategoryChips';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useGarden } from '../state/GardenProvider';
import { todayISO, isISODate } from '../lib/dates';
import { MAX_WIN_LENGTH } from '../lib/wins';
import { hashString } from '../lib/variation';
import type { WinCategory } from '../lib/types';

const PROMPTS = [
  'I finally applied for that job.',
  'I had a difficult conversation.',
  'I learned something new.',
  'I went for a walk.',
  'I launched my project.',
  'I asked for help when I needed it.',
  'I drank water and rested.',
];

/** The plant and edit form, shared so editing feels like tending, not admin. */
export function PlantSheet() {
  const { sheet, closeSheet, plantWin, updateWin, deleteWin } = useGarden();
  const editing = sheet?.mode === 'edit' ? sheet.win : null;
  const [text, setText] = useState('');
  const [category, setCategory] = useState<WinCategory | undefined>();
  const [date, setDate] = useState(todayISO());
  const [confirming, setConfirming] = useState(false);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const textId = useId();
  const dateId = useId();
  const hintId = useId();

  useEffect(() => {
    if (!sheet) return;
    setText(editing?.text ?? '');
    setCategory(editing?.category);
    setDate(editing?.date ?? todayISO());
  }, [sheet, editing]);

  const today = todayISO();
  const trimmed = text.trim();
  const valid = trimmed.length > 0 && isISODate(date) && date <= today;
  const placeholder = PROMPTS[hashString(today) % PROMPTS.length];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    const draft = { text: trimmed, category, date };
    if (editing) updateWin(editing.id, draft);
    else plantWin(draft);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit(e);
  };

  return (
    <>
      <Dialog
        open={!!sheet && !confirming}
        onClose={closeSheet}
        title={editing ? 'Tend to this win' : 'What went well today?'}
        description={editing ? 'Change anything you like. Its flower stays just as it is.' : 'Big or small, it all counts.'}
        initialFocus={textarea}
      >
        <form onSubmit={submit} className="flex flex-col gap-5">
          <div>
            <label htmlFor={textId} className="sr-only">
              Your win
            </label>
            <textarea
              id={textId}
              ref={textarea}
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_WIN_LENGTH))}
              onKeyDown={onKeyDown}
              rows={4}
              placeholder={placeholder}
              aria-describedby={hintId}
              className="display block w-full resize-none rounded-2xl border-0 bg-ivory px-4 py-3.5 text-[1.3rem] leading-snug text-ink ring-1 ring-line placeholder:text-ink-faint/70 placeholder:italic focus:outline-none focus:ring-2 focus:ring-poppy/70"
            />
            <p id={hintId} className="mt-1.5 flex justify-between text-xs text-ink-faint">
              <span>Write it the way you'd tell a friend.</span>
              {text.length > MAX_WIN_LENGTH * 0.8 && <span>{MAX_WIN_LENGTH - text.length} left</span>}
            </p>
          </div>

          <div>
            <p className="eyebrow mb-2.5">Category · optional</p>
            <CategoryPicker value={category} onChange={setCategory} />
          </div>

          <div className="flex items-center justify-between gap-4">
            <label htmlFor={dateId} className="eyebrow">
              When
            </label>
            <input
              id={dateId}
              type="date"
              value={date}
              max={today}
              onChange={(e) => setDate(e.target.value)}
              className="h-10 rounded-full bg-ivory px-4 text-sm font-medium text-ink ring-1 ring-line focus:outline-none focus:ring-2 focus:ring-poppy/70"
            />
          </div>

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
            {editing ? (
              <Button variant="ghost" icon={<Trash2 size={16} />} onClick={() => setConfirming(true)}>
                Remove win
              </Button>
            ) : (
              <span className="hidden text-xs text-ink-faint sm:block">Private to you, on this device.</span>
            )}
            <Button type="submit" size="lg" disabled={!valid} icon={<Sprout size={18} />}>
              {editing ? 'Save changes' : 'Plant this win'}
            </Button>
          </div>
        </form>
      </Dialog>
      <ConfirmDialog
        open={confirming}
        title="Let this one go?"
        description="This win and its flower will leave your garden. Your signature poppy will be just fine."
        confirmLabel="Remove"
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          if (editing) deleteWin(editing.id);
          setConfirming(false);
          closeSheet();
        }}
      />
    </>
  );
}
