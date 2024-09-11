<script lang="ts">
	import { writable, type Writable } from 'svelte/store';
	import Track from './Track.svelte';
	import { rendered_plane_count, type ext_track } from '$lib/stores/stores.js';
	import { map_bounds } from '$lib/util/map_util.js';
	import { feetToMeter } from '../../../../common/lib/general_util.js';

	let innerWidth = $state(0);
	let innerHeight = $state(0);


	const {
		planes,
		inter_speed,
	}: {
		planes: Writable<Map<string, ext_track>>;
		inter_speed: number;
	} = $props();

	const planes_on_screen: Writable<Map<string, ext_track>> = writable(
		new Map<string, ext_track>(),
	);

	$effect(() => {
		$map_bounds;
		$planes;

		setTimeout(() => {
			planes_on_screen.update((planes_on_screen) => {
				for (const [key, track] of $planes) {
					if (
						$map_bounds.contains({
							lat: track.track.y_lat,
							lng: track.track.x_lon,
							alt: feetToMeter(track.track.get_safe_alt()),
						})
					) {
						if (planes_on_screen.has(track.track.id)) {
							// Plane already exists, but we have to replace it to update the svelte reactions
							let old_plane: ext_track | undefined = planes_on_screen.get(track.track.id);
							if (old_plane) {
								old_plane.track.x_lon = track.track.x_lon;
								old_plane.track.y_lat = track.track.y_lat;
								old_plane.track.altitude = track.track.get_safe_alt();
							}
						} else {
							// Plane is new, so we can take the instantiated one
							planes_on_screen.set(track.track.id, track);
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
							lat: track.track.y_lat,
							lng: track.track.x_lon,
							alt: feetToMeter(track.track.get_safe_alt()),
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
		</Track>
	{/each}
</div>

<style>
</style>
