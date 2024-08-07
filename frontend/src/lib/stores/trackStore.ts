import { writable, type Writable } from "svelte/store";
import Plane from '../../../../common/model/Plane.js';

let uid = 0;


export const tracks: Writable<Map<number, Plane>> = writable(new Map<number, Plane>());

