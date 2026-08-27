<script lang="ts">
	import app from "../models/app.svelte";
	import Badge from "./Badge.svelte";

	let {
		verse: element = $bindable(),
		verseKey,
		selected,
		translated,
		segmented,
		mapped,
		onclick,
	}: {
		verse: HTMLElement;
		verseKey: string;
		selected: boolean;
		translated: boolean;
		segmented: boolean;
		mapped: boolean;
		onclick: () => void;
	} = $props();
</script>

<button
	bind:this={element}
	class="px-12 py-4 flex items-center justify-between hover:bg-ctp-surface0 cursor-pointer transition-colors
		{selected ? 'bg-ctp-crust' : ''}"
	onmousedown={(e: MouseEvent) => e.preventDefault()}
	{onclick}
>
	<div class="font-medium">{verseKey}</div>

	<div class="flex gap-3">
		<Badge
			active={translated}
			activeClass="{app.accents.translation.background} text-ctp-base"
			>Translated</Badge
		>

		<Badge
			active={segmented}
			activeClass="{app.accents.segmentation.background} text-ctp-base"
		>
			Segmented
		</Badge>

		<Badge
			active={mapped}
			activeClass="{app.accents.mapping.background} text-ctp-base"
			>Mapped</Badge
		>
	</div>
</button>
