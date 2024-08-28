<script lang="ts">
	import BarAnimation from '$lib/components/BarAnimation.svelte';
	import Card from '$lib/components/Card.svelte';
	import Map from '$lib/components/Map.svelte';
	import PlaneContainer from '$lib/components/PlaneContainer.svelte';
	import TimeSelector from '$lib/components/TimeSelector.svelte';
	import {
		tracks,
		track_update_count,
		rendered_plane_count,
	} from '$lib/stores/stores.js';
	import { browser } from '$app/environment';
	import { changeChannel } from '$lib/util/ws_util';
	import { getInterval } from '../../../common/lib/time_util.js';

	let bool: boolean = false;
	export let interval: number = 500;

	$: {
		if (browser) {
			changeChannel(getInterval(interval));
		}
	}

	let innerWidth = 0;
	let innerHeight = 0;
</script>

<svelte:window bind:innerWidth bind:innerHeight />


<div class="top-0 left-0 size-full absolute pointer-events-none overflow-hidden">
	<div class="relative size-full pointer-events-none">
	<!--- Place everything under here !--->
	<!-- START OF DEBUG ELEMENTS -->
	<!-- <div class="absolute top-1/4 right-1/4 text-6xl z-50 bg-black select-none">w: {innerWidth} , h: {innerHeight}</div> -->
	<!-- <div class="absolute top-1/2 w-full h-1 bg-red-700 z-10" draggable="false"></div> -->
	<!-- <div class="absolute left-1/2 w-1 h-full bg-red-700 z-10" draggable="false"></div> -->
	<!--  END OF DEBUG ELEMENTS -->


	<div id="header" class="w-auto absolute z-40 top-2 right-6">
			<div id="menu-bar">
				<TimeSelector bind:sel_interval={interval}></TimeSelector>
			</div>
		</div>

		<div id="plane_div" class="absolute size-full top-0 left-0">
			<PlaneContainer planes={tracks} inter_speed={interval}></PlaneContainer>
		</div>
		<div class="relative z-30 w-fit left-0 top-[18%] overflow-hidden">
			<div
				id="center_content"
				class="static flex flex-col items-center gap-y-4 px-8"
			>
				<img src="/favicon.png" class="w-32 drop-shadow-xl select-none" alt="Logo" />
				<p
					style="filter: drop-shadow(2px 2px 2px #000000);"
					class="text-3xl font-semibold font-mono select-none max-w-60 text-center px-5"
				>
					Welcome to WS-Track!
				</p>
				<!-- <div class="relative shadow-xl overflow-hidden rounded-lg">
					<Card title="Websocket Connection">
						<p class="select-none">
							We are currently tracking <code class="text-slate-950 font-black font-mono"
								>{$tracks.size}</code
							> {$tracks.size == 1 ? "plane" : "planes"} and are rendering <code class="text-slate-950 font-black font-mono">{$rendered_plane_count}</code>.
						</p>
						<p class="select-none">
							And have received <code class="text-slate-800 font-black"
								>{$track_update_count}</code
							>
							track updates on the current tracks/{interval}
							websocket channel.
						</p>
						<br />
						<button
							class="rounded-xl ring-2 ring-sky-500 ring-offset-4 ring-offset-slate-50 dark:ring-offset-slate-900 pointer-events-auto"
							on:click={() => {
								bool = !bool;
							}}
						>
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
						</button>
					</Card>
					<div class="absolute -z-40">
						<BarAnimation inter_speed={interval * 10}></BarAnimation>
					</div>

				</div> -->
			</div> 
		</div>
		<Map></Map>
	</div>
</div>

<!-- <div class="absolute -z-30 bg-[#1c222b] size-6 top-0 right-0"></div> -->
<!-- <div class="absolute -z-30 bg-[#1c222b] size-6 bottom-0 left-0"></div> -->

<style>
	code {
		background: theme('colors.slate.100');
		padding-left: 0.25rem;
		padding-right: 0.25rem;
		border-radius: 0.375rem;
	}

</style>
