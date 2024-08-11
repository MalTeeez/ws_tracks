<script lang="ts">
	import { onMount } from 'svelte';
	import Card from '$lib/components/Card.svelte';
	import PlaneContainer from '$lib/components/PlaneContainer.svelte';
	import { tracks, track_update_count } from '$lib/stores/trackStore';
	import { browser } from '$app/environment';
	import { changeChannel } from '$lib/util/ws_util';
	import TimeSelector from '$lib/components/TimeSelector.svelte';
	import { getInterval } from '../../../common/lib/time_util.js';

	let bool: boolean = false;
	export let interval: number = 500;
	let map_div: HTMLDivElement;

	$: {
		if (browser) {
			changeChannel(getInterval(interval));
		}
	}

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

<div id="header" class="absolute z-50 top-2 right-1">
	<div id="menu-bar" class="mr-8">
		<TimeSelector bind:sel_interval={interval}></TimeSelector>
	</div>
</div>

<main class="flex w-auto h-auto flex-col items-center justify-center">
	<div class="flex w-full h-full">
		<div bind:this={map_div} class="absolute bg-slate-300 w-full h-full top-0 z-10"></div>

		<img src="/favicon.png" class="w-32 drop-shadow-xl" alt="Logo" />
		<h1 class="text-3xl font-bold">Welcome to WS-Track</h1>
		<h2 class="my-6 text-2xl">Status</h2>
		<div id="main" class="flex max-w-5xl justify-center gap-4 px-3">
			<Card title="Websocket Connection">
				{#if bool}
					<p
						class="font-sans font-semibold underline decoration-2 decoration-sky-500/[.33] text-center"
					>
						True!
					</p>
				{:else}
					<p
						class="font-sans font-semibold underline decoration-2 decoration-fuchsia-500/[.33] text-center"
					>
						False?
					</p>
				{/if}
				<p>
					We are currently tracking <code class="text-sky-300">{$tracks.size}</code> planes.
				</p>
				<p>
					And have received <code class="text-pink-500">{$track_update_count}</code> track updates on the current tracks/{interval}
					websocket channel.
				</p>
				<br />
				<button
					class="clicks ring-2 ring-sky-500 ring-offset-4 ring-offset-slate-50 dark:ring-offset-slate-900"
					on:click={() => {
						bool = !bool;
					}}
				>
					Hi!
				</button>
			</Card>

			<PlaneContainer planes={tracks} inter_speed={interval}></PlaneContainer>
		</div>
	</div>
</main>

<style>
	code {
		background: theme('colors.zinc.900');
		padding: theme('spacing[0.5]');
	}

	.clicks {
		border-radius: 0.7rem;
	}
</style>
