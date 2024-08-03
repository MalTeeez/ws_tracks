<script lang="ts">
	import type { Snippet } from 'svelte';

	const {
		x,
        y,
		children,
	}: {
		x: number;
        y: number;
		children: Snippet;
	} = $props();
</script>

<div class="absolute" style="top: {y}px; left: {x}px;">
	<div class="plane size-2">
	</div>
	<div class="antialiased font-mono text-xs font-semibold text-center text-sky-400">
		{@render children()}
	</div>
</div>

<style>

    .plane {
        background: yellow;
        border-radius: 4em;
    }

</style>