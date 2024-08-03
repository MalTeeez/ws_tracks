import { writable, type Writable } from "svelte/store";

let uid = 0;

export class Plane {
    id: number;
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.id = uid++;
        this.x = x;
        this.y = y;
    }

    setId(id: number) {
        this.id = id;
    }
}

export const planes: Writable<Map<number, Plane>> = writable(new Map<number, Plane>());

