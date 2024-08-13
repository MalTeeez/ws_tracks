<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import PlaneContainer from '$lib/components/PlaneContainer.svelte';
	import { tracks, track_update_count } from '$lib/stores/trackStore';
	import { browser } from '$app/environment';
	import { changeChannel } from '$lib/util/ws_util';
	import TimeSelector from '$lib/components/TimeSelector.svelte';
	import { getInterval } from '../../../common/lib/time_util.js';
	import Map from '$lib/components/Map.svelte';
	import BarAnimation from '$lib/components/BarAnimation.svelte';

	let bool: boolean = false;
	export let interval: number = 500;

	$: {
		if (browser) {
			changeChannel(getInterval(interval));
		}
	}
</script>
<Map></Map>
<div class="top-0 left-0 size-full absolute">
	<div class="relative size-full">
		
		<!--- Place everything under here !--->
		<div id="header" class="w-auto absolute z-50 top-2 right-6">
			<div id="menu-bar">
				<TimeSelector bind:sel_interval={interval}></TimeSelector>
			</div>
		</div>
		
		<div id="plane_div" class="absolute size-full z-20 top-0 left-0">
			<PlaneContainer planes={tracks} inter_speed={interval}></PlaneContainer>
		</div>
		<div class="w-auto relative z-30 left-0 right-0 top-1/4 overflow-hidden">
			<div
				id="center_content"
				class="static flex flex-col items-center gap-y-4"
			>
				<img src="/favicon.png" class="w-32 drop-shadow-xl" alt="Logo" />
				<h1 style="filter: drop-shadow(2px 2px 2px #000000);" class="text-3xl font-semibold font-mono">Welcome to WS-Track!</h1>
				<div class="relative shadow-xl overflow-hidden rounded-lg">
					<Card title="Websocket Connection">
						<p>
							We are currently tracking <code class="text-sky-300"
								>{$tracks.size}</code
							> planes.
						</p>
						<p>
							And have received <code class="text-pink-500"
								>{$track_update_count}</code
							>
							track updates on the current tracks/{interval}
							websocket channel.
						</p>
						<br />
						<button
							class="clicks ring-2 ring-sky-500 ring-offset-4 ring-offset-slate-50 dark:ring-offset-slate-900"
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
					<!-- <div class="absolute -z-30 bg-[#1c222b] size-6 top-0 right-0"></div> -->
					<!-- <div class="absolute -z-30 bg-[#1c222b] size-6 bottom-0 left-0"></div> -->
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	code {
		background: theme('colors.zinc.900');
		padding: theme('spacing[0.5]');
	}

	.clicks {
		border-radius: 0.7rem;
	}
</style>
