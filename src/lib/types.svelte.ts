import type { ArabicWord, TranslationVerse, WordRange } from "./schema.svelte";

export const themes = ["latte", "frappe", "macchiato", "mocha"] as const;
export type Theme = (typeof themes)[number];

export type ArabicWordByWordKey = Record<string, ArabicWord>;
export type ArabicWordsByVerseKey = Map<string, ArabicWord[]>;
export type ArabicWordTextsByVerseKey = Map<string, string[]>;
export type TranslationByVerseKey = Record<string, TranslationVerse>;

export type View = "dashboard" | "editor";

export type Stat = {
	label: string;
	value: number;
	total: number;
	color: string;
	background: string;
};

export type HistoryEntry = {
	verseKey: string;
	old: TranslationVerse | null;
	new: TranslationVerse | null;
};

export type Mode = "normal" | "insert" | "mapping";
export type Edge = "start" | "end";
export type ElementId = "complete_translation" | number;
export type MappingRange = WordRange | null;
