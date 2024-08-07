<script lang="ts">
	import type { Snippet } from 'svelte';
	import Plane from '../../../../common/model/Plane.js';

	let size: number = 0.5;

	const {
		plane,
		children,
	}: {
		plane: Plane;
		children: Snippet;
	} = $props();
</script>

<div class="absolute smooth" style="top: {plane.y}px; left: {plane.x}px;">
	<div class="dot" style="width: {size}rem; height: {size}rem;">
	</div>
	<div class="antialiased font-mono text-xs font-semibold text-left text-sky-400 cursor-default">
		{@render children()}
	</div>
</div>

<style>
	.smooth {
		transition:all 1.0s ease-in-out;
	}

	.dot {
        background: yellow;
        border-radius: 4em;
		box-shadow: 2px 2px 4px 1px rgba(0, 0, 0, 0.4);
		position: relative;
		left: 25%;
    }

</style>