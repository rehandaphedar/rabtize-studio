import type { Segment, TranslationVerse } from "./schema.svelte";
import type { MappingRange } from "./types.svelte";

export const isVerseTranslated = (verse: TranslationVerse): boolean => {
	return !!verse.t;
};

export const isVerseSegmented = (verse: TranslationVerse): boolean => {
	return !!verse.segments?.length;
};

export const areSegmentsMapped = (segments: Segment[]): boolean => {
	return segments.length > 0 && segments.every((segment) => segment.word_range);
};

export const countSegments = (count: number, verse: TranslationVerse) => {
	return count + (verse.segments?.length ?? 0);
};

export const countMappedSegments = (count: number, verse: TranslationVerse) => {
	return count + (verse.segments?.filter((s) => s.word_range).length ?? 0);
};

export const isInRange = (
	index: number,
	range?: MappingRange | null,
): boolean => {
	return Boolean(range && index >= range.start && index <= range.end);
};

export const getFreeMappingRange = (
	segments: Segment[],
	selectableWordCount: number,
): MappingRange => {
	let unmappedWordNumber = 1;
	const mapped = new Set<number>();

	for (const segment of segments) {
		if (!segment.word_range) continue;

		for (let i = segment.word_range.start; i <= segment.word_range.end; i++) {
			mapped.add(i);
		}
	}

	for (let i = 1; i <= selectableWordCount; i++) {
		if (!mapped.has(i)) {
			unmappedWordNumber = i;
			break;
		}
	}

	return { start: unmappedWordNumber, end: unmappedWordNumber };
};
