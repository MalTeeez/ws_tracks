<script lang="ts">
	import { onMount } from 'svelte';
	import {
		GOOGLEMAPS_API_KEY,
		GOOGLEMAPS_SESSION_TOKEN_SATELLITE,
		GOOGLEMAPS_SESSION_TOKEN_STREET,
		MAPTILER_API_KEY,
		MAPTILES_API_KEY,
	} from '../../.config.json';

	let map_div: HTMLDivElement;

	const GOOGLE_STREETS: string = `https://tile.googleapis.com/v1/2dtiles/{z}/{x}/{y}?session=${GOOGLEMAPS_SESSION_TOKEN_STREET}&key=${GOOGLEMAPS_API_KEY}&orientation=0`;
	const GOOGLE_SATELLITE: string = `https://tile.googleapis.com/v1/2dtiles/{z}/{x}/{y}?session=${GOOGLEMAPS_SESSION_TOKEN_SATELLITE}&key=${GOOGLEMAPS_API_KEY}`;
	const MAPTILER_STREETS: string = `https://api.maptiler.com/maps/topo-v2/{z}/{x}/{y}.png?key=${MAPTILER_API_KEY}`;
	const MAPTILES: string = `https://maptiles.p.rapidapi.com/en/map/v1/{z}/{x}/{y}.png?rapidapi-key=${MAPTILES_API_KEY}`;

	onMount(async () => {
		const leaflet = await import('leaflet');

		const options = {
			center: leaflet.latLng(76.3, -85.5), // Fake coordinates, MAPTILES seems a little off
			zoom: 11,
		};

		const mymap = leaflet.map(map_div, options);

		leaflet
			.tileLayer(MAPTILES, {
				//style URL
				tileSize: 256,
				zoomOffset: -1,
				minZoom: 1,
				attribution:
					'\u003ca href="https://www.maptiler.com/copyright/" target="_blank"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href="https://www.openstreetmap.org/copyright" target="_blank"\u003e\u0026copy; OpenStreetMap\u003c/a\u003e',
				crossOrigin: true,
			})
			.addTo(mymap);
	});
</script>

<!-- <div class="relative h-[1600px] w-[1600px] overflow-hidden"> -->
<div
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
</style>
