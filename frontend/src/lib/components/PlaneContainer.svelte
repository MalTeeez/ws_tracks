<script lang="ts">
	import Plane from '../../../../common/model/Plane.js';
	import { writable, type Writable } from 'svelte/store';
	import Track from './Track.svelte';
	import { rendered_plane_count } from '$lib/stores/stores.js';
	import { map_bounds } from '$lib/util/map_util.js';
	import { feetToMeter } from '../../../../common/lib/general_util.js';

	let innerWidth = $state(0);
	let innerHeight = $state(0);

	const {
		planes,
		inter_speed,
	}: {
		planes: Writable<Map<string, Plane>>;
		inter_speed: number;
	} = $props();

	const planes_on_screen: Writable<Map<string, Plane>> = writable(
		new Map<string, Plane>(),
	);

	$effect(() => {
		$map_bounds;
		$planes;

		setTimeout(() => {
			planes_on_screen.update((planes_on_screen) => {
				for (const [key, track] of $planes) {
					if (
						$map_bounds.contains({
							lat: track.y_lat,
							lng: track.x_lon,
							alt: feetToMeter(track.get_safe_alt()),
						})
					) {
						if (planes_on_screen.has(track.id)) {
							// Plane already exists, but we have to replace it to update the svelte reactions
							let old_plane: Plane | undefined = planes_on_screen.get(track.id);
							if (old_plane) {
								old_plane.x_lon = track.x_lon;
								old_plane.y_lat = track.y_lat;
								old_plane.altitude = track.get_safe_alt();
							}
						} else {
							// Plane is new, so we can take the instantiated one
							planes_on_screen.set(track.id, track);
						}
						$planes_on_screen.set(key, track);
					}
				}

				for (const [key, track] of $planes_on_screen) {
					if (!$planes.has(key)) {
						$planes_on_screen.delete(key);
					}
					if (
						!$map_bounds.contains({
							lat: track.y_lat,
							lng: track.x_lon,
							alt: feetToMeter(track.get_safe_alt()),
						})
					) {
						$planes_on_screen.delete(key);
					}
				}
				return planes_on_screen;
			});

			$rendered_plane_count = $planes_on_screen.size;
		});
	});
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<div class="static">
	{#each $planes_on_screen as [id, plane] (id)}
		<Track {plane} height={innerHeight} width={innerWidth} {inter_speed}>
			<p class="select-none">{id}</p>
		</Track>
	{/each}
</div>

<style>
</style>
