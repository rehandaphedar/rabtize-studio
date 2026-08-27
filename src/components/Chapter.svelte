<script lang="ts">
	import app from "../models/app.svelte";
	import Badge from "./Badge.svelte";

	let {
		chapter,
		expanded,
		translated,
		segmented,
		mapped,
		onclick,
	}: {
		chapter: number;
		expanded: boolean;
		translated: boolean;
		segmented: boolean;
		mapped: boolean;
		onclick: () => void;
	} = $props();
</script>

<button
	class="p-4 flex items-center justify-between bg-ctp-mantle hover:bg-ctp-surface0 transition-colors cursor-pointer"
	onmousedown={(e: MouseEvent) => e.preventDefault()}
	{onclick}
>
	<div class="flex gap-3">
		<span class="text-ctp-blue">
			{expanded ? "▾" : "▸"}
		</span>

		<span class="font-bold">Chapter {chapter}</span>
	</div>

	<div class="flex gap-3">
		<Badge
			active={translated}
			activeClass="text-ctp-base {app.accents.translation.background}"
			>Translated</Badge
		>

		<Badge
			active={segmented}
			activeClass="text-ctp-base {app.accents.segmentation.background}"
		>
			Segmented
		</Badge>

		<Badge
			active={mapped}
			activeClass="text-ctp-base {app.accents.mapping.background}"
			>Mapped</Badge
		>
	</div>
</button>
