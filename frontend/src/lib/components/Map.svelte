<script lang="ts">
	import { onMount } from 'svelte';
	import ListSelector from './ListSelector.svelte';
	import { getMapSourceKeys, update_map } from '$lib/util/map_util';

	let map_div: HTMLDivElement;
	let is_mounted: boolean = $state(false);
	let current_map_source: string | undefined = $state();


	$effect(() => {
		if (current_map_source) {
			update_map(current_map_source, is_mounted, map_div);
		}
	});

	onMount(() => {
		is_mounted = true;
	});

</script>

<!-- <div class="relative h-[1600px] w-[1600px] overflow-hidden"> -->

<div class="w-auto absolute z-[45] bottom-6 right-6">
	<ListSelector
		value_list={Array.from(getMapSourceKeys())}
		bind:selected_value={current_map_source}
		direction_up={false}
	></ListSelector>
</div>

<div
	id="map_div"
	bind:this={map_div}
	class="pointer-events-auto absolute -z-50 size-full top-0 left-0"
>
	<h1
		class="absolute z-50 text-6xl font-bold text-white size-full top-1/2 text-center"
	>
		If you see this, the map failed to load.
	</h1>
</div>

<!-- </div> -->

<style>
	#map_div {
		background-color: theme('colors.zinc.900');
	}
</style>
