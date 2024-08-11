<script lang="ts">
	import type { Snippet } from 'svelte';

	const {
		title,
		children,
	}: {
		title: string;
		children: Snippet;
	} = $props();
</script>

<section id="card" class="flex w-2/5 flex-col gap-2 rounded-lg py-6 px-10 m-2 shadow-xl drop-shadow-xl">
	<h1 class="mb-2 text-xl text-center font-bold">{title}</h1>
	{@render children()}
</section>

<style>
	#card {
		background: #30363d;
	}
</style>