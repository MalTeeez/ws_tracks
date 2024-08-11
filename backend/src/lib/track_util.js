//@ts-check
import Plane from "../../../common/model/Plane.js";
import { planes } from "../ws_track.js";
import { queryInstant } from "./prom_util.js";
import { deepEqual, randomInt } from "./general_util.js"

/**
 * Update tracks with randomly generated ones (+-5 moves)
 * @param {Map<number,Plane>} track_list A reference to a map containing the previous state
 * @param {number} update_amount The amount of the times tracks you want to update each time
 * @param {number} max_x The maximum X value of your planes
 * @param {number} max_y The maximum Y value of your p
 * @returns {Array<number>} A list of id's from the track_list that were updated
 */
export function update_tracks_randomly(track_list, update_amount, max_x, max_y) {
    /**
     * @type {Array<number>}
     */
    let uni_track_updates = [];
    for (let i = 1; i <= update_amount; i++) {
        let id = String(randomInt(1, update_amount));
        let plane = track_list.get(id);
        if (plane && plane.x && plane.y) {
            plane.x += randomInt(-5, 5);
            plane.y += randomInt(-5, 5);

            uni_track_updates.push(id);
        } else {
            track_list.set(id, new Plane(id, randomInt(0, max_x), randomInt(0, max_y)));
        }
    }
    return uni_track_updates;
}

/**
 * Update tracks with randomly generated ones (+-5 moves)
 * @param {Map<number,Plane>} track_list A reference to a map containing the previous state
 * @returns {Promise<Array<number>>} A list of id's from the track_list that were updated
 */
export async function update_tracks_prometheus(track_list) {
    /**
     * @type {Array<number>}
     */
    let uni_track_updates = [];
    const prom_tracks = await queryInstant();

    if (prom_tracks) {
        for (const [id, plane] of prom_tracks.entries()) {
            const plane_is_known = track_list.has(id);
            if ((plane_is_known && !deepEqual(plane, track_list.get(id))) || !plane_is_known) {
                // Track is known but has an old state OR track is "new"
                track_list.set(id, plane);
                uni_track_updates.push(id);
            }
        }
        if (track_list.size != prom_tracks.size) {
            // Prometheus has removed a track that we still keep, so we need to delete it
            for (const id of track_list.keys()) {
                if (!prom_tracks.has(id)) {
                    planes.delete(id);
                    //console.log("Removed out-of-date track " + id);
                }
            }
        }
    }
    //console.log("Prometheus had " + uni_track_updates.length + " track updates");
    return uni_track_updates;
}

/**
 * Generate a set number of fake plane tracks and fill a provided map with them
 * @param {Map<number, Plane>} planes Your provided map
 * @param {number} max_tracks The amount of tracks to generate
 * @param {number} max_x The maximum X value of your planes
 * @param {number} max_y The maximum Y value of your planes
 */
export function generateInitial(planes, max_tracks, max_x, max_y) {
    for (let i = 1; i <= max_tracks; i++) {
        planes.set(i, new Plane(String(i), randomInt(0, max_x), randomInt(0, max_y)));
    }
}

/**
 * Convert a plane to a ws update message
 * @param {Plane} plane Your Plane
 * @returns {string} The ws update message
 */
export function plane_to_message(plane) {
    return `${plane.id},${plane.x},${plane.y};`;
}