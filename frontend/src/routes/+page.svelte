<script lang="ts">
	import NextStep from '$lib/components/NextStep.svelte';
	import PlaneContainer from '$lib/components/PlaneContainer.svelte';
	import { tracks } from '$lib/stores/trackStore';
	import { browser } from '$app/environment';
	import { changeChannel } from '$lib/util/ws_util';
	import TimeSelector from '$lib/components/TimeSelector.svelte';
	import { getInterval } from '../../../common/lib/time_util.js';

	let bool: boolean = false;
	export let interval: number = 500;

	$: {
		if (browser) {
        	changeChannel(getInterval(interval));
		}
    }

	function change_state() {
		bool = !bool;
	}

</script>

<div id="menu-bar" class="flex flex-row-reverse mr-8">
	<TimeSelector bind:sel_interval={interval}></TimeSelector>
</div>

<main class="flex h-auto p-20 flex-col items-center justify-center">
	<img src="/favicon.png" class="w-32 drop-shadow-xl" alt="Logo"/>
	<h1 class="text-3xl font-bold">Welcome to WS-Track</h1>
	<h2 class="my-6 text-2xl">Status</h2>
	<div id="main" class="flex max-w-5xl justify-center gap-4 px-3">
		<!-- <NextStep title="Websocket Connection">
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
				The source for these cards is in <code class="text-lime-300"
					>src/lib/components/NextStep.svelte</code
				>.
			</p>
			<p>
				There's some global styling in <code class="text-lime-300"
					>src/app.css</code
				>.
			</p>
			<br />
			<button
				class="clicks ring-2 ring-sky-500 ring-offset-4 ring-offset-slate-50 dark:ring-offset-slate-900"
				on:click={change_state}
			>
				Hi!
			</button>
		</NextStep> -->

		<PlaneContainer planes={tracks} inter_speed={interval}></PlaneContainer>
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
