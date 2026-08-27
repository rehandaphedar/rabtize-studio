<script lang="ts">
	import type { TranslationVerse } from "../lib/schema.svelte";
	import app from "../models/app.svelte";
	import editor from "../viewmodels/editor.svelte";

	let {
		id,
		segment,
	}: {
		id: number;
		segment: NonNullable<TranslationVerse["segments"]>[number];
	} = $props();

	const focused = $derived(editor.focusedElementId === id);
	const editing = $derived(focused && editor.mode === "insert");

	const classes = $derived.by(() => {
		return [
			"w-full",
			"p-4",
			"field-sizing-content",
			"outline-none",
			"resize-none",
			"border-2",
			focused ? editor.accent.border : "border-ctp-base",
			editing ? `bg-ctp-crust` : "bg-ctp-base",
		];
	});

	const onblur = (e: FocusEvent) => {
		const nextTarget = e.relatedTarget as HTMLElement | null;
		if (editor.mode === "insert" && nextTarget?.tagName !== "TEXTAREA") {
			editor.exitInsertMode();
		}
	};
</script>

<div class="flex gap-3">
	<div class="w-full">
		<div class="flex items-center gap-3">
			<div
				class="text-xs font-mono font-bold text-ctp-surface2 w-4 text-right"
			>
				{id + 1}
			</div>
			<textarea
				bind:this={editor.elementReferences[id]}
				bind:value={segment.t}
				onmousedown={() => editor.focusElementWithInsertMode(id)}
				{onblur}
				class={classes}
			></textarea>
		</div>
		{#if segment.word_range}
			<div
				class="{app.accents.mapping
					.color} mt-1 font-bold text-xs text-right"
			>
				Words: {segment.word_range.start} - {segment.word_range.end}
			</div>
		{/if}
	</div>
</div>
