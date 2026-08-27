import app from "../models/app.svelte";
import type { TranslationVerse, WordRange } from "./schema.svelte";

export const mutate = (
	verseKey: string,
	verse: TranslationVerse,
	action: (v: TranslationVerse) => void,
) => {
	if (!verse) return;
	const oldState = $state.snapshot(verse);
	action(verse);
	const newState = $state.snapshot(verse);

	app.addHistoryEntry({
		verseKey,
		old: oldState,
		new: newState,
	});
};

export const resolveOverlaps = (
	verse: TranslationVerse,
	focusedElementId: string | number,
	wordRange: WordRange,
) => {
	verse.segments?.forEach((segment, index) => {
		if (index === focusedElementId || !segment.word_range) return;

		const segmentWordRange = segment.word_range;

		if (
			segmentWordRange.start > wordRange.end ||
			segmentWordRange.end < wordRange.start
		)
			return;

		if (
			wordRange.start <= segmentWordRange.start &&
			wordRange.end >= segmentWordRange.end
		) {
			segment.word_range = undefined;
		} else if (
			wordRange.start > segmentWordRange.start &&
			wordRange.end < segmentWordRange.end
		) {
			segmentWordRange.end = wordRange.start - 1;
		} else if (wordRange.start <= segmentWordRange.start) {
			segmentWordRange.start = wordRange.end + 1;
		} else {
			segmentWordRange.end = wordRange.start - 1;
		}
	});
};

export const splitCurrentSegment = (
	verseKey: string,
	verse: TranslationVerse,
	id: number,
	text: string,
	cursor: number,
) => {
	mutate(verseKey, verse, (v) => {
		const wordRange = v.segments?.[id]?.word_range;
		v.segments?.splice(
			id,
			1,
			{
				t: text.slice(0, cursor).trim(),
				word_range: wordRange ? { ...wordRange } : undefined,
			},
			{ t: text.slice(cursor).trim() },
		);
	});
};

export const mergeSegments = (
	verseKey: string,
	verse: TranslationVerse,
	index1: number,
	index2: number,
) => {
	mutate(verseKey, verse, (v) => {
		if (!v.segments?.[index1] || !v.segments?.[index2]) return;
		const segment1 = v.segments[index1];
		const segment2 = v.segments[index2];

		segment1.t = `${segment1.t} ${segment2.t}`.trim();

		let wordRange1 = segment1.word_range;
		let wordRange2 = segment2.word_range;

		if (wordRange1 && wordRange2) {
			wordRange1.start = Math.min(wordRange1.start, wordRange2.start);
			wordRange1.end = Math.max(wordRange1.end, wordRange2.end);
		} else {
			segment1.word_range = wordRange1 ?? wordRange2;
		}
		v.segments.splice(index2, 1);
	});
};

export const swapSegments = (
	verseKey: string,
	verse: TranslationVerse,
	index1: number,
	index2: number,
) => {
	mutate(verseKey, verse, (v) => {
		if (!v.segments?.[index1] || !v.segments?.[index2]) return;
		[v.segments[index1], v.segments[index2]] = [
			v.segments[index2],
			v.segments[index1],
		];
	});
};
