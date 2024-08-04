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
	<div class="dot size-2">
	</div>
	<div class="antialiased font-mono text-xs font-semibold text-left text-sky-400">
		{@render children()}
	</div>
</div>

<style>

    .dot {
        background: yellow;
        border-radius: 4em;
		box-shadow: 2px 2px 4px 1px rgba(0, 0, 0, 0.4);
		position: relative;
		left: 25%;
    }

</style>