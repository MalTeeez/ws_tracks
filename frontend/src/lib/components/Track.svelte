<script lang="ts">
	import type { Snippet } from 'svelte';
	import Plane from '../../../../common/model/Plane.js';
	import TrackCard from './TrackCard.svelte';
	import { tweened } from 'svelte/motion';
	import { linear } from 'svelte/easing';

	let size: number = 0.5;
	let color = $state('#ff0000');
	let selected: boolean = $state(false);

	const {
		plane,
		inter_speed,
		children,
	}: {
		plane: Plane;
		inter_speed: number;
		children: Snippet;
	} = $props();

	function changeColor() {
		color = color === '#ff0000' ? '#0044ff' : '#ff0000';
	}

	let x_pos = tweened(plane.x_lon, {
		duration: inter_speed,
		easing: linear,
	});

	let y_pos = tweened(plane.y_lat, {
		duration: inter_speed,
		easing: linear,
	});

	$effect(() => {
		$x_pos = plane.x_lon;
		$y_pos = plane.y_lat;
	})
</script>

{#if selected}
	<TrackCard parent_track={plane} parent_x={$x_pos} parent_y={$y_pos} inter_speed={inter_speed} bind:selected={selected}
	></TrackCard>
{/if}


<div
	class="absolute z-25"
	style="left: {$x_pos}px; top: {$y_pos}px;"
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
