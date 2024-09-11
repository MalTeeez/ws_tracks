import { writable, type Writable } from 'svelte/store';
import Plane from '../../../../common/model/Plane.js';

export type ext_track = {
	track: Plane;
	time: number;
	following: boolean;
}

export const tracks: Writable<Map<string, ext_track>> = writable(
	new Map<string, ext_track>(),
);

export const track_update_count: Writable<number> = writable(0);


export const rendered_plane_count: Writable<number> = writable(0);

/**
 * is_track_update
 */ 							
export const update_state: Writable<boolean> = writable(false);
export const update_trigger: Writable<number> = writable(0);