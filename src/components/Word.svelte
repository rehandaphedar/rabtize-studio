<script lang="ts">
	import { isInRange } from "../lib/utils.svelte";
	import app from "../models/app.svelte";
	import editor from "../viewmodels/editor.svelte";

	let {
		word,
		wordNumber,
	}: {
		word: string;
		wordNumber: number;
	} = $props();

	const classes = $derived.by(() => {
		const classes = [
			"transition-colors",
			"duration-100",
			"px-1",
			"pb-1",
			"leading-[1.85]",
		];

		const clickable = editor.focusedElementId !== "complete_translation";

		const inMappingRange = isInRange(wordNumber, editor.mappingRange);
		const mapped = editor.verse.segments?.some((segment) => {
			return isInRange(wordNumber, segment.word_range);
		});
		const mappedToFocused =
			editor.mode !== "mapping" &&
			editor.dragStartWord == null &&
			isInRange(wordNumber, editor.focusedSegment?.word_range);

		if (clickable) {
			classes.push("cursor-crosshair");
		}

		if (inMappingRange) {
			classes.push(
				"text-ctp-base",
				editor.accents.mapping.background,
				editor.accents.mapping.background_hover,
			);
		} else if (mappedToFocused) {
			classes.push(
				"text-ctp-base",
				app.accents.mapping.background,
				app.accents.mapping.background_hover,
			);
		} else {
			if (mapped) {
				classes.push("bg-ctp-surface0");
			}

			if (clickable) {
				classes.push("hover:bg-ctp-surface1");
			}
		}

		return classes;
	});

	const onmousedown = (e: MouseEvent) => {
		e.preventDefault();
		if (editor.focusedSegment) {
			editor.dragStartWord = wordNumber;
			editor.mappingRange = { start: wordNumber, end: wordNumber };
		}
	};

	const onmouseenter = () => {
		if (editor.focusedSegment && editor.dragStartWord !== null) {
			editor.mappingRange = {
				start: Math.min(editor.dragStartWord, wordNumber),
				end: Math.max(editor.dragStartWord, wordNumber),
			};
			editor.mappingEdge =
				wordNumber >= editor.dragStartWord ? "end" : "start";
		}
	};
</script>

<button
	bind:this={editor.arabicWordReferences[wordNumber]}
	class={classes}
	{onmousedown}
	{onmouseenter}
>
	{word}
</button>
