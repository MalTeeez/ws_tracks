<script lang="ts">
	import type { Snippet } from 'svelte';
	import Plane from '../../../../common/model/Plane.js';
	import { msToCSS } from '../../../../common/lib/time_util.js';
	import TrackCard from './TrackCard.svelte';

	let size: number = 0.5;
	let color = $state('#ff0000');
	let selected: boolean = $state(false);

	function changeColor() {
		color = color === '#ff0000' ? '#0044ff' : '#ff0000';
	}

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

{#if selected}
	<TrackCard parent_track={plane} parent_x={plane.x_lon} parent_y={plane.y_lat}
	></TrackCard>
{/if}


<div
	class="absolute z-20"
	style="top: {plane.y_lat}px; left: {plane.x_lon}px; transition: all {msToCSS(
		inter_speed,
	)} linear;"
>
	<div class="relative">
		<button
			class="dot pointer-events-auto"
			style="width: {size}rem; height: {size}rem; background-color: {color}; "
			onmouseover={changeColor}
			onmouseleave={() => {
				new Promise<void>((resolve) => {
					setTimeout(() => {
						changeColor();
						resolve();
					}, 0);
				});
			}}
			onclick={() => {
				selected = !selected;
			}}
			onfocus={() => {}}
		>
		</button>
		<div
			class="antialiased font-mono text-xs font-semibold text-left text-sky-400 text"
		>
			{@render children()}
		</div>
	</div>
</div>

<style>
	.dot {
		border-radius: 4em;
		box-shadow: 2px 2px 4px 1px rgba(0, 0, 0, 0.4);
		position: absolute;
		transform: translate(-45%, -45%);
	}

	.text {
		transform: translate(-47%, 25%);
	}

</style>
