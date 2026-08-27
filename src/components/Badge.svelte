<script lang="ts">
	import { type Snippet } from "svelte";
	let {
		active,
		activeClass = "",
		children,
	}: {
		active: boolean;
		activeClass: string;
		children: Snippet;
	} = $props();
</script>

<span
	class="px-2 py-1 font-medium text-xs {active
		? activeClass
		: 'bg-ctp-surface2 text-ctp-subtext0'}"
>
	{@render children()}
</span>
