import { tick } from "svelte";
import { SvelteSet } from "svelte/reactivity";
import { themes } from "../lib/types.svelte";
import app from "../models/app.svelte";

class Dashboard {
	expandedChapters = $state(new SvelteSet<number>([1]));
	verseKeyInputValue = $state("1:1");

	get filteredVerseKeys() {
		if (this.verseKeyInputValue === "") return [];
		return app.verseKeys.filter((k) => k.startsWith(this.verseKeyInputValue));
	}

	setSelection(next: string) {
		app.setVerseKey(next);
		this.expandedChapters.add(app.chapter);
	}

	moveSelection(count: number) {
		const index = app.verseKeys.indexOf(app.verseKey);
		const next = app.verseKeys[index + count];
		if (next) this.setSelection(next);
	}

	async scrollToVerse(verseReferences: Record<string, HTMLElement>) {
		this.expandedChapters.add(app.chapter);

		await tick();

		verseReferences[app.verseKey].scrollIntoView({
			block: "nearest",
			behavior: "smooth",
		});
	}

	toggleChapter(chapter: number) {
		if (this.expandedChapters.has(chapter)) {
			console.log("delete", chapter);
			this.expandedChapters.delete(chapter);
		} else {
			console.log("add", chapter);
			this.expandedChapters.add(chapter);
		}
	}

	cycleTheme() {
		app.theme = themes[(themes.indexOf(app.theme) + 1) % themes.length];
	}

	async handleFileUpload(file: File | undefined) {
		if (!file) return;
		try {
			app.importTranslationData(JSON.parse(await file.text()));
		} catch (error) {
			console.error("Failed to import translation data", error);
		}
	}

	exportTranslation() {
		const json = app.exportTranslationData();
		const blob = new Blob([json], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = "translation.json";
		anchor.click();
		URL.revokeObjectURL(url);
	}

	handleKeydown(
		event: KeyboardEvent,
		verseKeyInput: HTMLInputElement | undefined,
		fileUploadReference: HTMLInputElement | undefined,
		verseReferences: Record<string, HTMLElement>,
	) {
		if (event.ctrlKey || event.metaKey || event.altKey) return;

		if (document.activeElement?.tagName === "INPUT") {
			switch (event.key) {
				case "Escape":
					(document.activeElement as HTMLElement).blur();
					break;
				case "Enter":
					if (
						document.activeElement === verseKeyInput &&
						app.verseKeys.includes(verseKeyInput.value)
					) {
						app.setVerseKey(verseKeyInput.value);
						this.expandedChapters.add(app.chapter);
						this.scrollToVerse(verseReferences);

						(document.activeElement as HTMLElement).blur();
					}
					break;
			}
			return;
		}

		switch (event.key) {
			case "z":
			case "Enter":
				app.view = "editor";
				break;
			case "t":
				fileUploadReference?.click();
				break;
			case "T":
				this.exportTranslation();
				break;
			case "v":
				event.preventDefault();
				verseKeyInput?.focus();
				break;
			case "c":
				event.preventDefault();
				this.cycleTheme();
				break;
			case "j":
				this.moveSelection(1);
				break;
			case "k":
				this.moveSelection(-1);
				break;
			case "g":
				this.setSelection(`${app.chapter}:1`);
				break;
			case "G":
				{
					const verseKeys = app.verseKeysByChapter.get(app.chapter) || [];
					this.setSelection(verseKeys[verseKeys.length - 1]);
				}
				break;
			case "Tab":
				event.preventDefault();
				if (event.shiftKey) {
					this.expandedChapters.clear();
				} else {
					this.toggleChapter(app.chapter);
				}
				break;
		}
	}
}

export const dashboard = new Dashboard();
export default dashboard;
