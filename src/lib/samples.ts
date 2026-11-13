import type { WinCategory, WinDraft } from './types';
import { parseISODate, toISODate } from './dates';

/**
 * A pool of everyday wins used to fill a garden quickly, for demos and for
 * anyone who wants to see what a fuller garden looks like. Each call picks a
 * random handful and scatters them over the past couple of months.
 */
export const SAMPLE_WINS: ReadonlyArray<{ text: string; category?: WinCategory }> = [
  { text: 'Finally sent the email I had been putting off for two weeks.', category: 'work' },
  { text: 'Spoke up in the team meeting with an idea, and they liked it.', category: 'courage' },
  { text: 'Cooked a proper dinner from scratch instead of ordering in.', category: 'life' },
  { text: 'Went for a run even though it was drizzling.', category: 'life' },
  { text: 'Finished the first chapter of the book that has sat on my nightstand since spring.', category: 'learning' },
  { text: 'Called Nani just to say hello.', category: 'kindness' },
  { text: 'Shipped the feature I was nervous about, and nothing broke.', category: 'work' },
  { text: 'Said no to a plan I did not have the energy for, kindly.', category: 'courage' },
  { text: 'Learned how to make a pivot table without looking it up.', category: 'learning' },
  { text: 'Left a thank-you note for the neighbour who took in my parcel.', category: 'kindness' },
  { text: 'Cleared my inbox down to zero before lunch.', category: 'work' },
  { text: 'Booked the dentist appointment at last.', category: 'life' },
  { text: 'Asked for help on the tricky bit instead of struggling alone.', category: 'courage' },
  { text: 'Practised Spanish for fifteen minutes on the train.', category: 'learning' },
  { text: 'Brought coffee for a colleague having a rough week.', category: 'kindness' },
  { text: 'Watered all the plants and repotted the sad fern.', category: 'life' },
  { text: 'Got positive feedback on the presentation deck.', category: 'work' },
  { text: 'Tried the pottery class on my own.', category: 'courage' },
  { text: 'Went to bed before eleven, three nights in a row.', category: 'life' },
  { text: 'Fixed the wobbly shelf with my own two hands.', category: 'other' },
  { text: 'Watched a talk on design systems and took real notes.', category: 'learning' },
  { text: 'Helped my friend move flats and only dropped one box.', category: 'kindness' },
  { text: 'Wrapped up the quarterly report a day early.', category: 'work' },
  { text: 'Took a whole Sunday off screens and walked by the river.', category: 'life' },
  { text: 'Introduced myself to someone new at the meetup.', category: 'courage' },
  { text: 'Baked banana bread that actually rose.', category: 'other' },
  { text: 'Finally understood how CSS grid areas work.', category: 'learning' },
  { text: 'Listened properly when my sister needed to vent.', category: 'kindness' },
  { text: 'Mentored a new joiner through their first pull request.', category: 'work' },
  { text: 'Noticed a nice moment and stopped to enjoy it.' },
];

/** Pick `count` distinct sample wins with random dates in the last `days` days. */
export function randomSampleDrafts(count = 10, today: string = toISODate(new Date()), days = 60, random: () => number = Math.random): WinDraft[] {
  const pool = [...SAMPLE_WINS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const base = parseISODate(today);
  return pool.slice(0, Math.min(count, pool.length)).map(({ text, category }) => {
    const d = new Date(base);
    d.setDate(d.getDate() - Math.floor(random() * days));
    return { text, category, date: toISODate(d) };
  });
}
