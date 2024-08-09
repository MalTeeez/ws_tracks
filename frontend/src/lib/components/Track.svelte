<script lang="ts">
	import type { Snippet } from 'svelte';
	import Plane from '../../../../common/model/Plane.js';
	import { msToCSS } from '../../../../common/lib/time_util.js';

	let size: number = 0.5;

	const {
		plane,
		inter_speed,
		children,
	}: {
		plane: Plane;
		inter_speed: number;
		children: Snippet;
	} = $props();
</script>

<div
	class="absolute"
	style="top: {plane.y}px; left: {plane.x}px; transition: all {msToCSS(
		inter_speed,
	)} linear;"
>
	<div class="dot" style="width: {size}rem; height: {size}rem;"></div>
	<div
		class="antialiased font-mono text-xs font-semibold text-left text-sky-400 cursor-default"
	>
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
