<script lang="ts">
	import { onMount } from 'svelte';
	import {
		GOOGLEMAPS_API_KEY,
		GOOGLEMAPS_SESSION_TOKEN_SATELLITE,
		GOOGLEMAPS_SESSION_TOKEN_STREET,
		MAPTILER_API_KEY,
		MAPTILES_API_KEY,
		RETINATILES_API_KEY,
	} from '../../.config.json';
	import ListSelector from './ListSelector.svelte';
	import type { Map as LeafletMap, MapOptions, LeafletEvent} from 'leaflet';

	let map_div: HTMLDivElement;
	let is_mounted: boolean = $state(false);
	let current_map_source: string | undefined = $state();
	let map_obj: LeafletMap | undefined = undefined;

	interface MapEntry {
		id: string;
		url: string;
		attribution: string;
	}

	const map_sources: Map<string, MapEntry> = new Map([
		[
			'GOOGLE_STREETS',
			{
				id: 'GOOGLE_STREETS',
				url: `https://tile.googleapis.com/v1/2dtiles/{z}/{x}/{y}?session=${GOOGLEMAPS_SESSION_TOKEN_STREET}&key=${GOOGLEMAPS_API_KEY}&orientation=0`,
				attribution: 'Google',
			},
		],
		[
			'GOOGLE_SATELLITE',
			{
				id: 'GOOGLE_SATELLITE',
				url: `https://tile.googleapis.com/v1/2dtiles/{z}/{x}/{y}?session=${GOOGLEMAPS_SESSION_TOKEN_SATELLITE}&key=${GOOGLEMAPS_API_KEY}`,
				attribution: 'Google',
			},
		],
		[
			'MAPTILER_TOPO',
			{
				id: 'MAPTILER_TOPO',
				url: `https://api.maptiler.com/maps/topo-v2/{z}/{x}/{y}.png?key=${MAPTILER_API_KEY}`,
				attribution: 'MapTiler',
			},
		],
		[
			'MAPTILES',
			{
				id: 'MAPTILES',
				url: `https://maptiles.p.rapidapi.com/en/map/v1/{z}/{x}/{y}.png?rapidapi-key=${MAPTILES_API_KEY}`,
				attribution: 'Maptiles',
			},
		],
		[
			'RETINATILES',
			{
				id: 'RETINATILES',
				url: `https://retina-tiles.p.rapidapi.com/local/osm@2x/v1/{z}/{x}/{y}.png?rapidapi-key=${RETINATILES_API_KEY}`,
				attribution: 'Retinatiles',
			},
		],
	]);

	$effect(() => {
		if (current_map_source) {
			update_map(map_sources.get(current_map_source), is_mounted);
		}
	});

	async function update_map(
		map_source: MapEntry | undefined,
		is_mounted_tmp: boolean,
	) {
		if (is_mounted_tmp && map_source) {
			const leaflet = await import('leaflet');

			const options: MapOptions = {
				center: leaflet.latLng(76.3, -85.5), // Fake coordinates, MAPTILES seems a little off
				zoom: 11,
				zoomSnap: 0.25,
				zoomDelta: 0.25,
				wheelPxPerZoomLevel: 120,
			};

			if (map_obj) {
				options.center = map_obj.getCenter();
				options.zoom = map_obj.getZoom();
				map_obj.remove();
			}
			map_obj = leaflet.map(map_div, options);

			leaflet
				.tileLayer(map_source.url, {
					tileSize: 256,
					zoomOffset: -1,
					minZoom: 1,
					maxZoom: 21,
					attribution:
						`\u0026copy; ${map_source.attribution} \u003ca href="https://www.openstreetmap.org/copyright" target="_blank"\u003e\u0026copy; OpenStreetMap\u003c/a\u003e`,
					crossOrigin: true,
					updateWhenIdle: true,
				})
				.addTo(map_obj);
		}
	}

	onMount(() => {
		is_mounted = true;
	});
</script>

<!-- <div class="relative h-[1600px] w-[1600px] overflow-hidden"> -->

<div class="w-auto absolute z-[45] bottom-6 right-6">
	<ListSelector
		value_list={Array.from(map_sources.keys())}
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
