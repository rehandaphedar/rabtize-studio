import { tick } from "svelte";
import {
	mergeSegments,
	mutate,
	resolveOverlaps,
	splitCurrentSegment,
	swapSegments,
} from "../lib/mutations.svelte";
import type { TranslationVerse } from "../lib/schema.svelte";
import type { Edge, ElementId, MappingRange, Mode } from "../lib/types.svelte";
import { getFreeMappingRange } from "../lib/utils.svelte";
import app from "../models/app.svelte";

class Editor {
	mode = $state<Mode>("normal");
	focusedElementId = $state<ElementId>("complete_translation");
	focusedEdge = $state<Edge>("end");
	mappingRange = $state<MappingRange | null>(null);
	mappingEdge = $state<Edge>("end");
	dragStartWord = $state<number | null>(null);

	elementReferences: Record<string, HTMLTextAreaElement | HTMLInputElement> =
		{};
	arabicWordReferences: Record<number, HTMLElement> = {};
	insertInitialVerseState: TranslationVerse | null = null;

	accents = {
		normal: { background: "bg-ctp-blue", border: "border-ctp-blue" },
		insert: { background: "bg-ctp-red", border: "border-ctp-red" },
		mapping: {
			background: "bg-ctp-yellow",
			border: "border-ctp-yellow",
			background_hover: "hover:bg-ctp-rosewater",
		},
	};

	get accent() {
		return this.accents[this.mode];
	}

	get verse() {
		return app.translationByVerseKey[app.verseKey];
	}
	get verseWords() {
		return app.arabicWordTextsByVerseKey.get(app.verseKey) || [];
	}
	get selectableWordsCount() {
		return Math.max(0, this.verseWords.length - 1);
	}
	get segmentCount() {
		return this.verse?.segments?.length ?? 0;
	}

	get focusedSegment() {
		return this.focusedElementId === "complete_translation"
			? null
			: (this.verse?.segments?.[this.focusedElementId as number] ?? null);
	}

	get focusedElement() {
		return this.elementReferences[this.focusedElementId];
	}

	get focusedWord() {
		let focusedWordNumber: number | null = null;
		if (this.mode === "mapping" && this.mappingRange) {
			focusedWordNumber =
				this.mappingEdge === "start"
					? this.mappingRange.start
					: this.mappingRange.end;
		} else if (this.focusedSegment?.word_range) {
			focusedWordNumber =
				this.focusedEdge === "start"
					? this.focusedSegment.word_range.start
					: this.focusedSegment.word_range.end;
		}
		return focusedWordNumber != null
			? this.arabicWordReferences[focusedWordNumber]
			: null;
	}

	clearReferences() {
		for (const key in this.elementReferences)
			delete this.elementReferences[key];
		for (const key in this.arabicWordReferences)
			delete this.arabicWordReferences[key];
	}

	enterInsertMode() {
		this.insertInitialVerseState = $state.snapshot(this.verse);
		this.mode = "insert";
		tick().then(() => {
			this.focusedElement?.focus();
		});
	}

	exitInsertMode() {
		this.mode = "normal";
		this.focusedElement?.blur();
		if (this.insertInitialVerseState) {
			app.addHistoryEntry({
				verseKey: app.verseKey,
				old: this.insertInitialVerseState,
				new: $state.snapshot(this.verse),
			});
			this.insertInitialVerseState = null;
		}
	}

	enterMappingMode() {
		if (!this.focusedSegment) return;
		if (this.focusedSegment.word_range) {
			this.mappingRange = { ...this.focusedSegment.word_range };
		} else {
			this.mappingRange = getFreeMappingRange(
				this.verse.segments || [],
				this.selectableWordsCount,
			);
		}
		this.mode = "mapping";
	}

	applyMappingRange() {
		if (!this.focusedSegment) return;
		const range = this.mappingRange ? { ...this.mappingRange } : undefined;

		mutate(app.verseKey, this.verse, () => {
			this.focusedSegment!.word_range = range;

			if (range) {
				resolveOverlaps(this.verse, this.focusedElementId, range);
			}
		});

		this.mappingRange = null;
		this.mode = this.mode === "insert" ? "insert" : "normal";
	}

	focusElementWithInsertMode(elementId: ElementId) {
		switch (this.mode) {
			case "insert":
				this.exitInsertMode();
				break;
			case "mapping":
				this.applyMappingRange();
				break;
		}
		this.focusedElementId = elementId;
		this.enterInsertMode();
	}

	moveVerse(delta: number) {
		const index = app.verseKeys.indexOf(app.verseKey) + delta;
		if (index >= 0 && index < app.verseKeys.length) {
			this.dragStartWord = null;
			this.mappingRange = null;
			// this.clearReferences();
			app.setVerseKey(app.verseKeys[index]);
			this.focusedElementId =
				this.segmentCount > 0 ? 0 : "complete_translation";
		}
	}

	handleMouseUp() {
		if (this.dragStartWord != null) {
			this.dragStartWord = null;
			this.applyMappingRange();
		}
	}

	handleKeydown(e: KeyboardEvent) {
		if (e.key == "Tab") e.preventDefault();

		switch (this.mode) {
			case "normal":
				return this.normal(e);
			case "insert":
				return this.insert(e);
			case "mapping":
				return this.mapping(e);
		}
	}

	private normal(e: KeyboardEvent) {
		switch (e.key) {
			case "z":
			case "q":
				app.view = "dashboard";
				break;
			case "x":
				this.dragStartWord = null;
				this.mappingRange = null;
				this.applyMappingRange();
				break;
			case "u":
				e.preventDefault();
				app.undo();
				break;
			case "r":
				if (e.ctrlKey) {
					e.preventDefault();
					app.redo();
				}
				break;
			case "h":
				this.moveVerse(-1);
				break;
			case "l":
				this.moveVerse(1);
				break;
			case "t":
				this.focusedElementId = "complete_translation";
				this.dragStartWord = null;
				this.mappingRange = null;
				break;
			case "g":
				if (this.segmentCount > 0) this.focusedElementId = 0;
				break;
			case "G":
				if (this.segmentCount > 0)
					this.focusedElementId = this.segmentCount - 1;
				break;
			case "i":
				e.preventDefault();
				this.enterInsertMode();
				break;
			case "m":
				e.preventDefault();
				this.enterMappingMode();
				break;
		}
		this.handleSegmentKeybind(e);
		this.handleCompleteTranslationKeybind(e);
	}

	private insert(e: KeyboardEvent) {
		if (e.key === "Escape") this.exitInsertMode();
		if (e.key === "Enter" && e.ctrlKey && this.focusedSegment) {
			e.preventDefault();
			const el = this.focusedElement as HTMLTextAreaElement;
			splitCurrentSegment(
				app.verseKey,
				this.verse,
				this.focusedElementId as number,
				el.value,
				el.selectionStart ?? 0,
			);
			this.insertInitialVerseState = null;
			this.exitInsertMode();
		}
	}

	private mapping(e: KeyboardEvent) {
		e.preventDefault();
		if (!this.mappingRange) return;

		switch (e.key) {
			case "Escape":
				this.mode = "normal";
				this.dragStartWord = null;
				this.mappingRange = null;
				break;
			case "x":
				this.mode = "normal";
				this.dragStartWord = null;
				this.mappingRange = null;
				this.applyMappingRange();
				break;
			case "Enter":
				this.applyMappingRange();
				break;
			case "h":
				if (this.mappingRange.end < this.selectableWordsCount) {
					this.mappingEdge = "end";
					this.mappingRange.end++;
				}
				break;
			case "H":
				if (this.mappingRange.start < this.mappingRange.end) {
					this.mappingEdge = "start";
					this.mappingRange.start++;
				}
				break;
			case "l":
				if (this.mappingRange.start > 1) {
					this.mappingEdge = "start";
					this.mappingRange.start--;
				}
				break;
			case "L":
				if (this.mappingRange.end > this.mappingRange.start) {
					this.mappingEdge = "end";
					this.mappingRange.end--;
				}
				break;
		}
	}

	private handleCompleteTranslationKeybind(e: KeyboardEvent) {
		if (this.focusedElementId !== "complete_translation") return;

		switch (e.key) {
			case "j":
				if (this.segmentCount > 0) this.focusedElementId = 0;
				break;
			case "a":
				e.preventDefault();
				mutate(app.verseKey, this.verse, (v) => {
					v.segments ??= [];
					v.segments.push({ t: "" });
				});
				this.focusedElementId = 0;
				break;
		}
	}

	private handleSegmentKeybind(e: KeyboardEvent) {
		if (this.focusedElementId === "complete_translation") return;
		const id = this.focusedElementId as number;

		switch (e.key) {
			case "j":
				if (id < this.segmentCount - 1) {
					this.focusedEdge = "end";
					this.focusedElementId = id + 1;
				}
				break;
			case "k":
				if (id > 0) {
					this.focusedEdge = "start";
					this.focusedElementId = id - 1;
				}
				break;
			case "d":
				e.preventDefault();
				mutate(app.verseKey, this.verse, (v) => v.segments?.splice(id, 1));
				this.focusedElementId =
					this.segmentCount === 0
						? "complete_translation"
						: Math.min(id, this.segmentCount - 1);
				break;
			case "a":
				e.preventDefault();
				mutate(app.verseKey, this.verse, (v) => {
					v.segments?.splice(id + 1, 0, { t: "" });
				});
				this.focusedElementId = id + 1;
				break;
			case "A":
				e.preventDefault();
				mutate(app.verseKey, this.verse, (v) => {
					v.segments?.splice(id, 0, { t: "" });
				});
				this.focusedElementId = id;
				break;
			case "s":
				if (id < this.segmentCount - 1) {
					e.preventDefault();
					mergeSegments(app.verseKey, this.verse, id, id + 1);
				}
				break;
			case "S":
				if (id > 0) {
					e.preventDefault();
					mergeSegments(app.verseKey, this.verse, id - 1, id);
					this.focusedElementId = id - 1;
				}
				break;
			case "J":
				if (id < this.segmentCount - 1) {
					e.preventDefault();
					swapSegments(app.verseKey, this.verse, id, id + 1);
					this.focusedElementId = id + 1;
				}
				break;
			case "K":
				if (id > 0) {
					e.preventDefault();
					swapSegments(app.verseKey, this.verse, id - 1, id);
					this.focusedElementId = id - 1;
				}
				break;
		}
	}
}

export const editor = new Editor();
export default editor;
