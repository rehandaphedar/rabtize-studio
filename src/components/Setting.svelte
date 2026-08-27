<script lang="ts">
	import { type Snippet } from "svelte";
	let {
		onclick,
		children,
	}: {
		onclick: () => void;
		children: Snippet;
	} = $props();
</script>

<button
	class="p-3 text-ctp-mantle bg-ctp-blue hover:bg-ctp-lavender transition-colors cursor-pointer font-medium"
	onmousedown={(e: MouseEvent) => e.preventDefault()}
	{onclick}
>
	{@render children()}
</button>
