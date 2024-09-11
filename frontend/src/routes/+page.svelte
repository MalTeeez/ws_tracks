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

	export let interval: number = 500;

	$: {
		if (browser) {
			changeChannel(getInterval(interval));
		}
	}

	let innerWidth = 0;
	let innerHeight = 0;

	let card_active: boolean = true;
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<div
	class="pointer-events-none absolute left-0 top-0 size-full overflow-hidden"
>
	<div class="pointer-events-none relative size-full">
		<!--- Place everything under here !--->
		<!-- START OF DEBUG ELEMENTS -->
		<!-- <div class="absolute top-1/4 right-1/4 text-6xl z-50 bg-black select-none">w: {innerWidth} , h: {innerHeight}</div> -->
		<!-- <div class="absolute top-1/2 w-full h-1 bg-red-700 z-10" draggable="false"></div> -->
		<!-- <div class="absolute left-1/2 w-1 h-full bg-red-700 z-10" draggable="false"></div> -->
		<!--  END OF DEBUG ELEMENTS -->

		<div id="header" class="absolute right-6 top-2 z-40 w-auto">
			<div id="menu-bar">
				<TimeSelector bind:sel_interval={interval}></TimeSelector>
			</div>
		</div>

		<div id="plane_div" class="absolute left-0 top-0 size-full">
			<PlaneContainer planes={tracks} inter_speed={interval}></PlaneContainer>
		</div>
		{#if card_active}
			<div class="relative left-0 top-[18%] z-30 w-fit overflow-hidden">
				<div
					id="center_content"
					class="static flex flex-col items-center gap-y-4 px-8"
				>
					<img
						src="/favicon.png"
						class="w-32 select-none drop-shadow-xl"
						alt="Logo"
					/>
					<p
						style="filter: drop-shadow(2px 2px 2px #000000);"
						class="max-w-60 select-none px-5 text-center font-mono text-3xl font-semibold"
					>
						Welcome to WS-Track!
					</p>
					<div class="relative overflow-hidden rounded-lg shadow-xl">
						<Card title="Websocket Connection" bind:enabled={card_active}>
							<p class="select-none">
								We are currently tracking <code
									class="font-mono font-black text-slate-950"
									>{$tracks.size}</code
								>
								{$tracks.size == 1 ? 'plane' : 'planes'} and are rendering
								<code class="font-mono font-black text-slate-950"
									>{$rendered_plane_count}</code
								>.
							</p>
							<p class="select-none">
								And have received <code class="font-black text-slate-800"
									>{$track_update_count}</code
								>
								track updates on the current tracks/{interval}
								websocket channel.
							</p>
							<br />
						</Card>
						<div class="absolute -z-40">
							<BarAnimation inter_speed={interval * 10}></BarAnimation>
						</div>
					</div>
				</div>
			</div>
		{:else}
			<div class="relative left-0 top-[18%] pl-2">
				<button
					class="pointer-events-auto cursor-pointer"
					onclick={() => {
						card_active = !card_active;
					}}
				>
					<div
						class="absolute rounded-lg p-0.5 pl-3 pr-2 text-center drop-shadow-xl backdrop-blur-lg backdrop-brightness-90 backdrop-saturate-[1.1]"
					>
						Expand Card
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							width="24"
							height="24"
							class="inline fill-slate-900 drop-shadow-lg"
							><path
								d="M17,9.17a1,1,0,0,0-1.41,0L12,12.71,8.46,9.17a1,1,0,0,0-1.41,0,1,1,0,0,0,0,1.42l4.24,4.24a1,1,0,0,0,1.42,0L17,10.59A1,1,0,0,0,17,9.17Z"
							></path></svg
						>
					</div>
				</button>
			</div>
		{/if}
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
