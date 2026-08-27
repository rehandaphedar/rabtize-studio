<script lang="ts">
	import Chapter from "../components/Chapter.svelte";
	import Setting from "../components/Setting.svelte";
	import Stat from "../components/Stat.svelte";
	import Verse from "../components/Verse.svelte";
	import {
		areSegmentsMapped,
		isVerseSegmented,
		isVerseTranslated,
	} from "../lib/utils.svelte";
	import app from "../models/app.svelte";
	import dashboard from "../viewmodels/dashboard.svelte";

	let verseKeyInputReference: HTMLInputElement;
	let fileUploadInputReference: HTMLInputElement;
	let verseReferences: Record<string, HTMLElement> = {};

	$effect(() => {
		app.verseKey;
		dashboard.scrollToVerse(verseReferences);
	});
</script>

<svelte:window
	onkeydown={(e) =>
		dashboard.handleKeydown(
			e,
			verseKeyInputReference,
			fileUploadInputReference,
			verseReferences,
		)}
/>

<div class="flex h-full w-full">
	<div class="w-[30%] p-6 flex flex-col gap-8 overflow-y-auto bg-ctp-mantle">
		<div class="flex flex-col gap-4">
			<h2 class="text-xl font-bold">Settings</h2>

			<input
				bind:this={fileUploadInputReference}
				class="hidden"
				type="file"
				accept=".json"
				onchange={() =>
					dashboard.handleFileUpload(
						fileUploadInputReference.files?.[0],
					)}
			/>

			<Setting onclick={() => fileUploadInputReference?.click()}
				>Import JSON</Setting
			>
			<Setting onclick={dashboard.exportTranslation}>Export JSON</Setting>
			<Setting onclick={dashboard.cycleTheme}>Cycle Theme</Setting>
		</div>

		<div class="flex flex-col gap-4">
			<h2 class="text-xl font-bold">Progress</h2>
			{#each app.stats as stat}
				<Stat {stat} />
			{/each}
		</div>
	</div>

	<div class="flex flex-1 flex-col p-6 gap-8">
		<div class="flex items-center gap-2">
			<input
				bind:this={verseKeyInputReference}
				type="text"
				value={app.verseKey}
				oninput={(e) =>
					(dashboard.verseKeyInputValue = e.currentTarget.value)}
				list="verse-keys"
				class="p-2 bg-ctp-surface0 text-ctp-text focus:bg-ctp-surface1 outline-none"
			/>
			<datalist id="verse-keys">
				{#each dashboard.filteredVerseKeys as key}
					<option value={key}></option>
				{/each}
			</datalist>
		</div>

		<div class="flex flex-1 flex-col overflow-y-auto bg-ctp-mantle">
			{#each app.chapters as chapter (chapter)}
				{@const expanded = dashboard.expandedChapters.has(chapter)}
				{@const verseKeys = app.verseKeysByChapter.get(chapter) ?? []}
				{@const verses = verseKeys.map(
					(verseKey) => app.translationByVerseKey[verseKey],
				)}
				{@const translated = verses.every(isVerseTranslated)}
				{@const segmented = verses.every(isVerseSegmented)}
				{@const mapped = verses.every((verse) =>
					areSegmentsMapped(verse.segments || []),
				)}

				<Chapter
					{chapter}
					{expanded}
					{translated}
					{segmented}
					{mapped}
					onclick={() => dashboard.toggleChapter(chapter)}
				/>

				{#if expanded}
					{#each verseKeys as verseKey}
						{@const verse = app.translationByVerseKey[verseKey]}
						{@const translated = isVerseTranslated(verse)}
						{@const segmented = isVerseSegmented(verse)}
						{@const mapped = areSegmentsMapped(
							verse.segments || [],
						)}

						<Verse
							bind:verse={verseReferences[verseKey]}
							{verseKey}
							selected={verseKey === app.verseKey}
							{translated}
							{segmented}
							{mapped}
							onclick={() => {
								app.setVerseKey(verseKey);
								app.view = "editor";
							}}
						/>
					{/each}
				{/if}
			{/each}
		</div>
	</div>
</div>
