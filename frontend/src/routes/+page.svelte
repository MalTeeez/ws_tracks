<script lang="ts">
	import NextStep from '$lib/components/NextStep.svelte';
	import PlaneContainer from '$lib/components/PlaneContainer.svelte';
	import { browser } from '$app/environment';
	import { planes, Plane } from '$lib/stores/trackStore';
	import { parseTrackString } from '$lib/util/parse_util';

	let bool: boolean = false;

	function change_state() {
		bool = !bool;
	}

	if (browser) {
		const socket = new WebSocket('ws://sxmaa.net:9001/tracks');
		socket.addEventListener('open', () => {
			console.log('Opened');
		});
		socket.addEventListener('message', (event: MessageEvent) => {
			//console.log("Got message from websocket: " + event.data);
			const plane: Plane | undefined = parseTrackString(event.data);
			if (plane) {
				planes.update((planes) => planes.set(plane.id, plane));
			} else {
				console.log(
					"Failed to parse track update with content: '" + event.data + "'",
				);
			}
		});
	}
</script>

<main class="flex h-screen flex-col items-center justify-center">
	<img src="/favicon.png" class="w-32 drop-shadow-xl" alt="o7 Logo" />
	<h1 class="text-3xl font-bold">Welcome to WS-Track</h1>
	<h2 class="my-6 text-2xl">Status:</h2>
	<div id="main" class="flex max-w-5xl justify-center gap-4 px-3">
		<NextStep title="Websocket Connection">
			{#if bool}
				<p
					class="font-sans font-semibold underline decoration-2 decoration-sky-500/[.33]"
				>
					True!
				</p>
			{:else}
				<p
					class="font-sans font-semibold underline decoration-2 decoration-fuchsia-500/[.33]"
				>
					False?
				</p>
			{/if}
			<p>
				Edit <code class="text-lime-300">src/routes/+page.svelte</code> to see your
				changes live.
			</p>
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
			<button class="clicks" on:click={change_state}> Hi! </button>
		</NextStep>

		<PlaneContainer {planes}></PlaneContainer>
	</div>
</main>

<style>
	code {
		background: theme('colors.zinc.900');
		padding: theme('spacing[0.5]');
	}

	.clicks {
		border-radius: 0.7rem;
		border-color: skyblue;
		border-style: dashed;
		border-width: 2px;
	}
</style>
