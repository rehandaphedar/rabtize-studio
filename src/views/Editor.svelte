<script lang="ts">
	import Segment from "../components/Segment.svelte";
	import Word from "../components/Word.svelte";
	import app from "../models/app.svelte";
	import editor from "../viewmodels/editor.svelte";

	$effect(() => {
		editor.focusedWord?.scrollIntoView({
			behavior: "smooth",
			block: "nearest",
		});
		editor.focusedElement?.scrollIntoView({
			behavior: "smooth",
			block: "nearest",
		});
	});

	const textareaClassComplete = $derived.by(() => {
		const focused = editor.focusedElementId === "complete_translation";
		const editing = focused && editor.mode === "insert";

		const classes = [
			"w-full",
			"p-4",
			"field-sizing-content",
			"outline-none",
			"resize-none",
			"border-2",
		];
		classes.push(focused ? editor.accent.border : "border-ctp-base");
		classes.push(editing ? `bg-ctp-crust` : "bg-ctp-base");
		return classes.join(" ");
	});

	const onblurCompleteTranslation = (e: FocusEvent) => {
		const nextTarget = e.relatedTarget as HTMLElement | null;
		if (editor.mode === "insert" && nextTarget?.tagName !== "TEXTAREA") {
			editor.exitInsertMode();
		}
	};
</script>

<svelte:window
	onkeydown={(e) => editor.handleKeydown(e)}
	onmouseup={() => editor.handleMouseUp()}
/>

<div class="flex h-full w-full">
	<div class="w-1/2 p-6 flex flex-col gap-8 bg-ctp-mantle overflow-y-auto">
		<div class="flex items-center justify-between">
			<span class="text-3xl font-bold">
				{app.verseKey}
			</span>
			<span
				class="px-3 py-1 tracking-widest uppercase font-bold text-xs text-ctp-mantle {editor
					.accent.background}"
			>
				{editor.mode}
			</span>
		</div>

		<div class="flex flex-col gap-4">
			<span class="text-sm font-bold {app.accents.translation.color}"
				>Translation
			</span>
			<textarea
				bind:this={editor.elementReferences["complete_translation"]}
				bind:value={editor.verse.t}
				onmousedown={() =>
					editor.focusElementWithInsertMode("complete_translation")}
				onblur={onblurCompleteTranslation}
				class={textareaClassComplete}
			></textarea>
		</div>

		<div class="flex flex-col gap-4">
			<span class="text-sm font-bold {app.accents.segmentation.color}"
				>Segments
			</span>
			{#each editor.verse.segments || [] as segment, index (segment)}
				<Segment id={index} {segment} />
			{/each}
		</div>
	</div>

	<div class="w-1/2 p-6 overflow-y-auto">
		<div
			class="flex flex-wrap gap-2 content-start text-4xl leading-[3rem] font-[KFGQPC_Hafs_Uthmanic_Script] select-none"
			dir="rtl"
		>
			{#each editor.verseWords as word, wordIndex (wordIndex)}
				{@const wordNumber = wordIndex + 1}
				{@const isVerseNumber = wordNumber === editor.verseWords.length}

				{#if isVerseNumber}
					<span
						class="text-ctp-surface2 select-none mx-4 leading-[1.85]"
					>
						{word}
					</span>
				{:else}
					<Word {word} {wordNumber} />
				{/if}
			{/each}
		</div>
	</div>
</div>
