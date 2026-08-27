import isEqual from "lodash/isEqual";
import type {
	ArabicWordByWordKey,
	ArabicWordsByVerseKey,
	ArabicWordTextsByVerseKey,
	HistoryEntry,
	Stat,
	Theme,
	TranslationByVerseKey,
	View,
} from "../lib/types.svelte";
import {
	areSegmentsMapped,
	countMappedSegments,
	countSegments,
	isVerseSegmented,
	isVerseTranslated,
} from "../lib/utils.svelte";

class App {
	theme = $state<Theme>("macchiato");

	arabicWordTextsByVerseKey: ArabicWordTextsByVerseKey = new Map();
	translationByVerseKey = $state<TranslationByVerseKey>({});

	verseKeys: string[] = [];
	chapters: number[] = [];
	verseKeysByChapter = new Map<number, string[]>();

	view = $state<View>("dashboard");
	chapter = $state(1);
	verse = $state(1);
	verseKey = $derived(`${this.chapter}:${this.verse}`);

	history = $state<HistoryEntry[]>([]);
	historyIndex = $state(-1);

	accents = {
		translation: {
			color: "text-ctp-green",
			background: "bg-ctp-green",
		},
		segmentation: {
			color: "text-ctp-teal",
			background: "bg-ctp-teal",
		},
		mapping: {
			color: "text-ctp-sky",
			background: "bg-ctp-sky",
			background_hover: "hover:bg-ctp-sapphire",
		},
	};

	stats: Stat[] = $derived.by(() => {
		const verses = Object.values(this.translationByVerseKey);

		const totalVerses = this.verseKeys.length;
		const translatedVerses = verses.filter(isVerseTranslated).length;
		const segmentedVerses = verses.filter(isVerseSegmented).length;
		const mappedVerses = verses.filter(
			(verse) => isVerseSegmented(verse) && areSegmentsMapped(verse.segments!),
		).length;

		const totalSegments = verses.reduce(countSegments, 0);
		const mappedSegments = verses.reduce(countMappedSegments, 0);

		return [
			{
				label: "Translated Verses",
				value: translatedVerses,
				total: totalVerses,
				color: this.accents.translation.color,
				background: this.accents.translation.background,
			},
			{
				label: "Segmented Verses",
				value: segmentedVerses,
				total: totalVerses,
				color: this.accents.segmentation.color,
				background: this.accents.segmentation.background,
			},
			{
				label: "Mapped Verses",
				value: mappedVerses,
				total: totalVerses,
				color: this.accents.mapping.color,
				background: this.accents.mapping.background,
			},
			{
				label: "Mapped Segments",
				value: mappedSegments,
				total: totalSegments,
				color: this.accents.mapping.color,
				background: this.accents.mapping.background,
			},
		];
	});

	importArabicWordsData(data: ArabicWordByWordKey) {
		const arabicWordsByVerseKey: ArabicWordsByVerseKey = new Map();
		for (const wordKey in data) {
			const word = data[wordKey];
			const verseKey = `${word.surah}:${word.ayah}`;

			if (!arabicWordsByVerseKey.has(verseKey)) {
				arabicWordsByVerseKey.set(verseKey, []);
			}
			arabicWordsByVerseKey.get(verseKey)!.push(word);
		}

		for (const words of arabicWordsByVerseKey.values()) {
			words.sort((a, b) => parseInt(a.word) - parseInt(b.word));
		}
		this.arabicWordTextsByVerseKey = new Map(
			Array.from(arabicWordsByVerseKey.entries()).map(([verseKey, words]) => [
				verseKey,
				words.map((word) => word.text),
			]),
		);

		this.verseKeys = Array.from(this.arabicWordTextsByVerseKey.keys()).sort(
			(a, b) => {
				const [aChapter, aVerse] = a.split(":").map(Number);
				const [bChapter, bVerse] = b.split(":").map(Number);
				return aChapter !== bChapter ? aChapter - bChapter : aVerse - bVerse;
			},
		);

		const chapterSet = new Set<number>();
		const verseKeysByChapter = new Map<number, string[]>();
		for (const verseKey of this.verseKeys) {
			const chapter = parseInt(verseKey.split(":")[0]);
			chapterSet.add(chapter);
			if (!verseKeysByChapter.has(chapter)) {
				verseKeysByChapter.set(chapter, []);
			}
			verseKeysByChapter.get(chapter)!.push(verseKey);

			this.translationByVerseKey[verseKey] ??= { t: "", segments: [] };
		}
		this.chapters = Array.from(chapterSet).sort((a, b) => a - b);
		this.verseKeysByChapter = verseKeysByChapter;
	}

	importTranslationData(data: TranslationByVerseKey) {
		this.translationByVerseKey = data;
		this.history = [];
		this.historyIndex = -1;
	}

	exportTranslationData() {
		return JSON.stringify(
			Object.fromEntries(
				Object.entries(this.translationByVerseKey).filter(([, verse]) =>
					isVerseTranslated(verse),
				),
			),
			null,
			2,
		);
	}

	setVerseKey(verseKey: string) {
		const [chapter, verse] = verseKey.split(":").map(Number);
		this.chapter = chapter;
		this.verse = verse;
	}

	addHistoryEntry(entry: HistoryEntry) {
		if (isEqual(entry.old, entry.new)) return;
		this.history = this.history.slice(0, this.historyIndex + 1);
		this.history.push($state.snapshot(entry));
		this.historyIndex++;
	}

	undo() {
		if (this.historyIndex >= 0) {
			const entry = this.history[this.historyIndex];
			if (entry.old === null) {
				delete this.translationByVerseKey[entry.verseKey];
			} else {
				this.translationByVerseKey[entry.verseKey] = $state.snapshot(entry.old);
			}
			this.historyIndex--;
			this.setVerseKey(entry.verseKey);
		}
	}

	redo() {
		if (this.historyIndex < this.history.length - 1) {
			this.historyIndex++;
			const entry = this.history[this.historyIndex];
			if (entry.new === null) {
				delete this.translationByVerseKey[entry.verseKey];
			} else {
				this.translationByVerseKey[entry.verseKey] = $state.snapshot(entry.new);
			}
			this.setVerseKey(entry.verseKey);
		}
	}
}

export const app = new App();
export default app;
