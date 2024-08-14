<script lang="ts">
	import Plane from '../../../../common/model/Plane';

	let outerWidth = $state(0);
	let outerHeight = $state(0);


	let {
		parent_track,
		parent_x,
		parent_y,
	}: {
		parent_track: Plane;
		parent_x: number;
		parent_y: number;
	} = $props();

	let x_dist: number = 25;
	let y_dist: number = 25;
	let x_pos: number = $state(parent_track.x_lon + 25);
	let y_pos: number = $state(parent_track.y_lat + 25);

	//parent_x < outerWidth / 2 ? x_dist * -1 : x_dist
	//parent_y > outerHeight / 2 ? y_dist * -1 : y_dist

	$effect(() => update_pos(parent_x, parent_y, outerHeight, outerWidth));

	function update_pos(
		par_x: number,
		par_y: number,
		height: number,
		width: number,
	) {
        // Is in right half?
		x_pos = par_x + (parent_x > width / 2 ? x_dist * -1 : x_dist)
        // Is in bottom half?
		y_pos = par_y + (parent_y < height / 2 ? y_dist * -1 : y_dist)
	}
</script>

<svelte:window bind:outerWidth bind:outerHeight />

<!-- <div id="true-middle-dot" class="bg-black absolute h-[2px] w-[2px] z-50" style="top: {y_pos}px; left: {x_pos}px;"></div> -->

<div
	class="absolute pointer-events-auto z-35"
	style="left: {x_pos}px; top: {y_pos}px;"
>
	<div class="relative true-middle">
		<div class="w-8 h-16 bg-blue-400 overflow-hidden">
        </div>
	</div>
</div>

<style>
    .true-middle {
        transform: translate(-50%, -50%);
    }
</style>
