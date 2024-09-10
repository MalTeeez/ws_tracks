import { writable, type Writable } from 'svelte/store';
import Plane from '../../../../common/model/Plane.js';

export const tracks: Writable<Map<string, Plane>> = writable(
	new Map<string, Plane>(),
);

export const track_update_count: Writable<number> = writable(0);


export const rendered_plane_count: Writable<number> = writable(0);

/**
 * is_track_update
 */ 							
export const update_state: Writable<boolean> = writable(false);
export const update_trigger: Writable<number> = writable(0);