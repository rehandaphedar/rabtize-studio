<script lang="ts">
	import type { Stat } from "../lib/types.svelte";

	let {
		stat,
	}: {
		stat: Stat;
	} = $props();

	const percent = $derived(
		(stat.total > 0 ? (stat.value / stat.total) * 100 : 0).toFixed(2),
	);
</script>

<div class="p-4 flex flex-col gap-1 bg-ctp-crust text-sm">
	<div class="flex justify-between">
		<span class="text-ctp-subtext0">{stat.label}</span>

		<span class="flex gap-2">
			<span class="text-ctp-text">{stat.value} / {stat.total}</span>
			<span class="font-medium {stat.color}">{percent}%</span>
		</span>
	</div>

	<div class="h-1 bg-ctp-surface0 rounded-full overflow-hidden">
		<div
			class="h-full {stat.background} rounded-full"
			style="width: {percent}%"
		></div>
	</div>
</div>
