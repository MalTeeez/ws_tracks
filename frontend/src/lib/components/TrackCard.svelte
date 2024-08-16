<script lang="ts">
	import { spring, tweened } from 'svelte/motion';
	import Plane from '../../../../common/model/Plane';
	import { cubicInOut, cubicOut, linear } from 'svelte/easing';

	let innerWidth = $state(0);
	let innerHeight = $state(0);

	let {
		parent_track,
		parent_x,
		parent_y,
		inter_speed,
	}: {
		parent_track: Plane;
		parent_x: number;
		parent_y: number;
		inter_speed: number;
	} = $props();

	let dist = { x: 50, y: 100 };

	// let coords = spring({ x: parent_track.x_lon, y: parent_track.y_lat }, {
	// stiffness: 0.1,
	// damping: 0.1
	// });

	// let coords = {
	// 	,
	// 	y: tweened(parent_track.y_lat, {
	// 		duration: 400,
	// 		easing: cubicOut,
	// 	}),
	// };

	let x_pos = tweened(parent_x, {
		duration: Math.max(Math.min(inter_speed, 2000), 250),
		easing: cubicOut,
	});

	let y_pos = tweened(parent_y, {
		duration: Math.max(Math.min(inter_speed, 2000), 250),
		easing: cubicOut,
	});

	let in_bottom_half = $state(false);
	let in_right_half = $state(false);

	$effect(() => update_pos(parent_x, parent_y, innerHeight, innerWidth));

	// Calculate box position
	function update_pos(
		par_x: number,
		par_y: number,
		height: number,
		width: number,
	) {
		// Is in right half?
		in_right_half = parent_x > width / 2;
		// Is in bottom half?
		in_bottom_half = parent_y > height / 2;

		$x_pos = par_x + (in_right_half ? dist.x * -1 : dist.x);
		$y_pos = par_y + (in_bottom_half ? dist.y * -1 : dist.y);
	}

	let mainCardElement: HTMLDivElement;

	let bottom_right_x: number = $state(0);
	let bottom_right_y: number = $state(0);
	let line_length: number = $state(0);
	let line_angle: number = $state(0);

	// Calculate line position, angle, length
	$effect(() => {
		if (mainCardElement) {
			const off_strength: number = 0.9;
			const x_off =
				(mainCardElement.clientWidth / 2) *
				(in_right_half ? off_strength : -off_strength);
			const y_off =
				(mainCardElement.clientHeight / 2) *
				(in_bottom_half ? off_strength : -off_strength);

			bottom_right_x = x_off + $x_pos;
			bottom_right_y = y_off + $y_pos;

			const deltaX = parent_x - bottom_right_x;
			const deltaY = parent_y - bottom_right_y;

			line_length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
			line_angle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;
		}
	});
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<div
	id="true-middle-indicator"
	class="true-middle bg-yellow-400 absolute h-1 w-1 z-50"
	style="left: {$x_pos}px; top: {$y_pos}px;"
></div>

<div
	class="absolute pointer-events-auto z-20"
	style="left: {$x_pos}px; top: {$y_pos}px;"
>
	<div class="relative true-middle">
		<div
			bind:this={mainCardElement}
			class="w-8 h-16 bg-blue-400 overflow-hidden"
		></div>
	</div>
</div>

<div
	class="line z-22"
	style="left:{bottom_right_x}px; top:{bottom_right_y}px; width:{line_length}px; transform:rotate({line_angle}deg);"
></div>

<style>
	.true-middle {
		transform: translate(-50%, -50%);
	}

	.line {
		height: 2px;
		background-color: #ffffff;
		border-radius: 3px;
		position: absolute;
		transform-origin: 0px 0px;
	}
</style>
