<script lang="ts">
	import NextStep from '$lib/components/NextStep.svelte';
	import PlaneContainer from '$lib/components/PlaneContainer.svelte';
	import Plane from '../../../common/model/Plane.js';
	import { tracks } from '$lib/stores/trackStore';
	import { parseTrackString } from '$lib/util/parse_util';
	import { WebSocket } from 'partysocket';
	import { browser } from '$app/environment';

	let bool: boolean = false;
	let ws: WebSocket;

	function change_state() {
		bool = !bool;
	}

	function get_ws_state(): string {
		//if (!browser) return '<div class="bg-gradient-to-r inline-block text-center from-sky-400 to-red-500">CONNECTING</div>'#
		console.log('Websocket status changed: ' + ws.readyState);
		let state_tag = '<div class="bg-gradient-to-r inline-block';
		if (ws.readyState == ws.CLOSED) {
			if (ws.retryCount > 0) {
				state_tag += 'from-purple-400 to-violet-500">RECONNECTING';
			} else {
				state_tag += 'from-amber-400 to-orange-500">DISCONNECTED';
			}
		} else if (ws.readyState == ws.CONNECTING) {
			state_tag += 'from-sky-400 to-blue-500">CONNECTING';
		} else if (ws.readyState == ws.OPEN) {
			state_tag += 'from-lime-400 to-greeen-500">CONNECTED';
		} else {
			state_tag += 'from-rose-400 to-red-600">ERRORED';
		}
		return (state_tag += '</div>');
	}

	if (browser) {
		ws = new WebSocket('ws://sxmaa.net:9001/tracks');
		ws.addEventListener('open', () => {
			console.log('ws opened');
		});

		ws.addEventListener('close', () => {
			console.log('WS closed');
		});

		ws.addEventListener('message', (event: MessageEvent) => {
			//console.log("Got message from websocket: " + event.data);
			const track_updates: Plane[] = parseTrackString(event.data);

			tracks.update((tracks) => {
				for (const track of track_updates) {
					if (tracks.has(track.id)) {
						// Plane already exists, so we just have to change its coords
						let old_plane: Plane | undefined = tracks.get(track.id);
						if (old_plane) {
							old_plane.x = track.x;
							old_plane.y = track.y;
						}
					} else {
						// Plane is new, so we can take the instantiated one
						tracks.set(track.id, track);
					}
				}

				return tracks;
			});
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
			{#if ws}
				{@html ws.readyState}
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
		</NextStep>

		<PlaneContainer planes={tracks}></PlaneContainer>
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
