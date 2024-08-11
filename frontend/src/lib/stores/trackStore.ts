import { writable, type Writable } from "svelte/store";
import Plane from '../../../../common/model/Plane.js';


export const tracks: Writable<Map<string, Plane>> = writable(new Map<string, Plane>());

export const track_update_count: Writable<number> = writable(0);