export interface TranslationVerse {
	t: string;
	segments?: Segment[];
}

export interface Segment {
	t: string;
	word_range?: WordRange;
}

export interface WordRange {
	start: number;
	end: number;
}

export interface ArabicWord {
	id: number;
	surah: string;
	ayah: string;
	word: string;
	location: string;
	text: string;
}
