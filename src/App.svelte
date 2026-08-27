<script lang="ts">
	import app from "./models/app.svelte";
	import Dashboard from "./views/Dashboard.svelte";
	import Editor from "./views/Editor.svelte";

	let initialized = $state(false);
	$effect(() => {
		fetch("/qpc-hafs-word-by-word.json")
			.then((response) => response.json())
			.then((data) => {
				app.importArabicWordsData(data);
				initialized = true;
			});
	});
</script>

<main
	class="w-screen h-screen overflow-hidden flex items-center justify-center bg-ctp-base text-ctp-text font-sans {app.theme}"
>
	{#if initialized}
		{#if app.view === "dashboard"}
			<Dashboard />
		{:else if app.view == "editor"}
			<Editor />
		{/if}
	{:else}
		<span> Loading... </span>
	{/if}
</main>
