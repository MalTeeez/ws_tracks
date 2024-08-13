<script lang="ts">
	import { onMount } from 'svelte';

	let map_div: HTMLDivElement;

	onMount(async () => {
		const leaflet = await import('leaflet');

		const options = {
			center: leaflet.latLng(40.731253, -73.996139),
			zoom: 12,
		};

		const mymap = leaflet.map(map_div, options);

		const key = 'VTr47KIHNqFQ7sZVwFRV';

		leaflet
			.tileLayer(
				`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${key}`,
				{
					//style URL
					tileSize: 512,
					zoomOffset: -1,
					minZoom: 1,
					attribution:
						'\u003ca href="https://www.maptiler.com/copyright/" target="_blank"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href="https://www.openstreetmap.org/copyright" target="_blank"\u003e\u0026copy; OpenStreetMap\u003c/a\u003e',
					crossOrigin: true,
				},
			)
			.addTo(mymap);
	});
</script>

<!-- <div class="relative h-[1600px] w-[1600px] overflow-hidden"> -->
	<div
		bind:this={map_div}
		class="absolute -z-50 size-full top-0 text-2xl text-semibold text-white"
	>
		If you see this, the map failed to load.
	</div>
<!-- </div> -->

<style>
</style>
