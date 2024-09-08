import { tracks, track_update_count, update_state } from '$lib/stores/stores';
import { WebSocket } from 'partysocket';
import Plane from '../../../../common/model/Plane';
import { buffer_to_tracks } from './parse_util';

let ws: WebSocket;
let base_url: string = 'sxmaa.net:9001/tracks';
let curr_interval: number;

export function closeWS() {
	if (ws) ws.close();
}

export function changeChannel(channel: number) {
	curr_interval = channel;
	console.log('Switching interval channel to ' + channel);
	if (ws) {
		ws.close();
	}
	initWS(base_url, String(channel));
	track_update_count.update(() => {
		return 0;
	});
	if (ws) {
		ws.reconnect();
	}
}

function initWS(base: string, channel: string) {
	base_url = base;
	ws = new WebSocket('ws://' + base_url + '/' + channel, [], {
		startClosed: true,
	});
	ws.binaryType = 'arraybuffer';
	add_listeners(ws);
}

function add_listeners(ws: WebSocket) {
	ws.addEventListener('open', () => {
		console.log('WS opened');
	});

	ws.addEventListener('close', () => {
		console.log('WS closed');
	});

	ws.addEventListener('message', handle_track_update);
}

function handle_track_update(event: MessageEvent) {
	const track_updates: Plane[] = buffer_to_tracks(event.data);

	track_update_count.update((count) => {
		count += track_updates.length;
		return count;
	});
	tracks.update((tracks) => {
		for (const track of track_updates) {
			if (tracks.has(track.id)) {
				// Plane already exists, but we have to replace it to update the svelte reactions
				let old_plane: Plane | undefined = tracks.get(track.id);
				if (old_plane) {
					old_plane.x_lon = track.x_lon;
					old_plane.y_lat = track.y_lat;
					old_plane.altitude = track.get_safe_alt();
					old_plane.rotation = track.get_safe_rot();
				}
			} else {
				// Plane is new, so we can take the instantiated one
				tracks.set(track.id, track);
			}
		}

		return tracks;
	});
	update_state.update(() => {return true})
}

export function get_ws_state(ws: WebSocket): string {
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

export function get_current_interval(): number {
	return curr_interval;
}
