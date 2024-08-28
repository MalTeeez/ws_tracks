<script lang="ts">
	import type { Snippet } from 'svelte';
	import Plane from '../../../../common/model/Plane.js';
	import TrackCard from './TrackCard.svelte';
	import { tweened } from 'svelte/motion';
	import { linear } from 'svelte/easing';
	import { projectCoords } from '$lib/util/map_util.js';
	import { update_state } from '$lib/stores/stores.js';

	let size: number = 0.5;
	let color = $state('#ff0000');
	let selected: boolean = $state(false);

	const {
		plane,
		inter_speed,
		width,
		height,
		children,
	}: {
		plane: Plane;
		inter_speed: number;
		width: number;
		height: number;
		children: Snippet;
	} = $props();

	function changeColor() {
		color = color === '#ff0000' ? '#0044ff' : '#ff0000';
	}

	let x_pos = tweened(0, {
		duration: inter_speed,
		easing: linear,
	});

	let y_pos = tweened(0, {
		duration: inter_speed,
		easing: linear,
	});

	$effect(() => {
		const coords = projectCoords(
			{
				lat: plane.y_lat,
				lng: plane.x_lon,
				alt: plane.get_safe_alt(),
			},
			width,
			height,
		);

		// Update is track update, so we interpolate
		if ($update_state) {
			setTimeout(() => {
				x_pos.set(coords.x, {
					duration: inter_speed,
					easing: linear,
				});

				y_pos.set(coords.y, {
					duration: inter_speed,
					easing: linear,
				});
			});
		}
		// Update is map update, so we dont need to interpolate
		else {
			setTimeout(() => {
				x_pos.set(coords.x, {
					duration: 0,
					easing: linear,
				});

				y_pos.set(coords.y, {
					duration: 0,
					easing: linear,
				});
			});
		}
	});
</script>

{#if selected}
	<TrackCard
		parent_track={plane}
		parent_x={$x_pos}
		parent_y={$y_pos}
		{inter_speed}
		bind:selected
	></TrackCard>
{/if}

<!-- <div
	id="true-middle-indicator"
	class="true-middle bg-yellow-400 absolute h-1 w-1 z-50"
	style="left: {$x_pos}px; top: {$y_pos}px; transform: translate(-50%, -50%);"
></div> -->

<div class="absolute z-20" style="left: {$x_pos}px; top: {$y_pos}px;">
	<div class="relative">
		<button
			class="dot-middle absolute pointer-events-auto"
			style="width: {size}rem; height: {size}rem;"
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
			<div class="middle-transform">
				<svg
					class="fill-red-500 plane"
					style="transform: rotate({0}deg)"
					width="32"
					height="32"
					viewBox="0 0 13 13"
				>
					<path
						d="m 1 7.8 l 3.4 -2.2 l 0 -1 l 0.1 -0.1 l 0.7 0 l 0.1 0.1 l 0 0.7 l 0.6 -0.5 l 0 -3.1 l 0.3 -0.7 l 0.4 0 l 0.3 0.7 l 0 3.1 l 0.7 0.5 l 0 -0.8 l 0.1 -0.1 l 0.6 0 l 0.1 0.1 l 0 1.1 l 3.4 2.2 l 0 0.8 l -0.4 0 l -3 -1.4 l -1.4 0 l 0 3.2 l 1.4 1.3 l 0 0.6 l -0.6 0 l -0.3 -0.4 l -0.7 0 l -0.2 0.3 l -0.4 0 l -0.2 -0.3 l -0.7 0 l -0.2 0.4 l -0.7 0 l 0 -0.6 l 1.4 -1.3 l 0 -3.2 l -1.5 0 l -2.8 1.4 l -0.5 0 z"
					/>
				</svg>
			</div>
		</button>
		<div class="py-2"></div>
		<div
			class="antialiased font-bold text-xs text-left text-slate-200 bg-[#22222244] rounded-md px-0.5 leading-4 text drop-shadow-lg"
		>
			{@render children()}
		</div>
	</div>
</div>

<style>
	.dot-middle {
		transform: translate(0%, -50%);
	}

	.plane {
		stroke-width: 0.5px;
		stroke: rgba(0, 0, 0, 0.25);
	}

	.middle-transform {
		transform: translate(-200%, -30%);
		filter: drop-shadow(5px 7px 2.5px rgba(0, 0, 0, 0.25));
	}

	.text {
		transform: translate(-47%, 25%);
	}
</style>
