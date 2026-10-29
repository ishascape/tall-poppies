export const WIN_CATEGORIES = ['work', 'life', 'courage', 'learning', 'kindness', 'other'] as const;

export type WinCategory = (typeof WIN_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<WinCategory, string> = {
  work: 'Work',
  life: 'Life',
  courage: 'Courage',
  learning: 'Learning',
  kindness: 'Kindness',
  other: 'Other',
};

export type FlowerVariant = {
  /** Petal colour (hex) chosen from the garden palette. */
  color: string;
  /** Relative stem height, 0–1. Never tied to how "big" a win is. */
  height: number;
  /** Petal silhouette index, 0–3. */
  petalVariant: number;
  /** Leaf arrangement index, 0–3. */
  leafVariant: number;
  /** Tilt of the bloom in degrees, roughly -16 to 16. */
  bloomAngle: number;
};

export type Win = {
  id: string;
  text: string;
  category?: WinCategory;
  /** Calendar day of the win, YYYY-MM-DD in the user's local time. */
  date: string;
  createdAt: string;
  updatedAt: string;
  flowerVariant: FlowerVariant;
};

export type WinDraft = {
  text: string;
  category?: WinCategory;
  date: string;
};

export type Preferences = {
  /** The welcome screen has been passed at least once. */
  welcomed: boolean;
  /** Day (YYYY-MM-DD) the reflection card was last tucked away. */
  reflectionDismissedOn?: string;
};
