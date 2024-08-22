//@ts-check
import Plane from "../../../../common/model/Plane.js";
import { queryInstant } from "./prom_util.js";
import { utf16_to_utf8, deep_equal, generateRandomString, random_int, utf8_to_utf16, random_float } from "../../../../common/lib/general_util.js";
import UpdatePacket from "../../../../common/model/packet/UpdatePacket.js";


/**
 * Update tracks with randomly generated ones (+-5 moves)
 * @param {Map<string,Plane>} track_list A reference to a map containing the previous state
 * @param {number} update_amount The amount of the times tracks you want to update each time
 * @param {number} max_x The maximum X value of your planes
 * @param {number} max_y The maximum Y value of your p
 * @returns {Array<string>} A list of id's from the track_list that were updated
 */
export function update_tracks_randomly(track_list, update_amount, max_x, max_y) {
  /**
   * @type {Array<string>}
   */
  let uni_track_updates = [];
  for (let i = 1; i <= update_amount; i++) {
    let id = String(random_int(1, update_amount));
    let plane = track_list.get(id);
    if (plane && plane.x_lon && plane.y_lat) {
      plane.x_lon += random_int(-5, 5);
      plane.y_lat += random_int(-5, 5);

      uni_track_updates.push(id);
    } else {
      track_list.set(id, new Plane(id, random_int(0, max_x), random_int(0, max_y)));
    }
  }
  return uni_track_updates;
}


/**
 * Update tracks with randomly generated ones (+-5 moves)
 * @param {Map<string,Plane>} track_list A reference to a map containing the previous state
 * @param {Map<string, number>} last_update_list A reference to a map containing the timestamp of all tracks latest update
 * @returns {Promise<Array<string>>} A list of id's from the track_list that were updated
 */
export async function update_tracks_prometheus(track_list, last_update_list) {
  /**
   * @type {Array<string>}
   */
  let uni_track_updates = [];
  const prom_tracks = await queryInstant();

  if (prom_tracks) {
    for (const [id, plane] of prom_tracks.entries()) {
      const plane_is_known = track_list.has(id);
      if ((plane_is_known && !deep_equal(plane, track_list.get(id))) || !plane_is_known) {
        // Track is known but has an old state OR track is "new"
        track_list.set(id, plane);
        last_update_list.set(id, Date.now())
        uni_track_updates.push(id);
      }
    }
    if (track_list.size != prom_tracks.size) {
      // Prometheus has removed a track that we still keep, so we need to delete it
      for (const id of track_list.keys()) {
        if (!prom_tracks.has(id)) {
          track_list.delete(id);
          last_update_list.delete(id);
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
 * @param {Map<string, Plane>} planes Your provided map
 * @param {number} max_tracks The amount of tracks to generate
 * @param {number} [max_x] The maximum X value of your planes
 * @param {number} [max_y] The maximum Y value of your planes
 */
export function generateInitial(planes, max_tracks, max_x, max_y) {
  for (let i = 1; i <= max_tracks; i++) {
    const id = generateRandomString(7);
    planes.set(id, new Plane(id, random_float(-180, 180, 5), random_float(-180, 180, 5)));
  }
}


/**
 * Convert a plane to a ws update message
 * @param {Plane} plane Your Plane
 * @returns {string} The ws update message
 */
export function plane_to_message(plane) {
  return `${plane.id},${plane.x_lon},${plane.y_lat};`;
}


/**
 * Convert a list of track updates to an ArrayBuffer of tracks
 * This function is a wrapper for tracks_to_buffer()
 * @param {IterableIterator<string>} track_updates Your track updates array filled with ids
 * @param {Map<string,Plane>} plane_list A reference to a map containing the previous state
 * @returns {ArrayBuffer} Your ArrayBuffer filled with tracks
 */
export function track_updates_to_buffer(track_updates, plane_list) {
  const updated_planes = new Map();

  // Create map from id list and reference state track map
  for (const id of track_updates) {
    const plane = plane_list.get(id);
    if (plane) {
      updated_planes.set(id, plane)
    }
  }
  
  let uint8_list = new Array(updated_planes.size * UpdatePacket.SIZE);
  let offset = 0;
  for (const packet of tracks_to_packets(updated_planes)) {
    const packet_uint8_arr = new Uint8Array(packet.serialize())
    for (let i = 0; i < UpdatePacket.SIZE; i++) {
      uint8_list[offset + i] = packet_uint8_arr[i];
    }
    offset += UpdatePacket.SIZE;
  }
  
  const buffer = new Uint8Array(uint8_list).buffer;

  return buffer;
}

/**
 * Convert a list of update packets to a Map of tracks
 * @param {Array<UpdatePacket>} update_packets Your Array filled with track packets
 * @returns {Map<string, Plane>} Your track Map filled with planes
 */
export function packets_to_tracks(update_packets) {
  let tracks = new Map();

  for (const packet of update_packets) {
    let track = packet.toPlane();
    tracks.set(track.id, track);
  }

  return tracks;
}



/**
 * Convert a Map of tracks to a list of UpdatePackets
 * @param {Map<string, Plane>} tracks Your track Map filled with planes
 * @returns {Array<UpdatePacket>} Your Array filled with track update packets
 */
export function tracks_to_packets(tracks) {
  let update_packets = new Array();

  for (const track of tracks.values()) {
    update_packets.push(UpdatePacket.fromPlane(track))
  }

  return update_packets;
}


/**
 * Convert a Map of tracks to an ArrayBuffer of tracks
 * @param {Map<string, Plane>} tracks Your track Map filled with planes
 * @returns {ArrayBuffer} Your ArrayBuffer filled with tracks
 */
export function tracks_to_buffer(tracks) {
  let buffer = new ArrayBuffer(tracks.size * 15);

  let i = 0;
  for (const id of tracks.keys()) {
    //                      n-th entry * sizeof entry
    let dataView = new DataView(buffer, i * 15, 15);

    // Go through each char of the id, and append that onto our array
    let o = 0;
    for (const char of utf16_to_utf8(id)) {
      dataView.setUint8(o, char);
      o++;
    }

    // Append our coords
    let track = tracks.get(id);
    if (track) {
      /// Longitude
      dataView.setInt32(7, track.get_lon_int());
      /// Latitude
      dataView.setInt32(11, track.get_lat_int());
    }
    // Go to the next plane
    i++;
  }
  return buffer;
}

/**
 * Convert an ArrayBuffer of tracks to a Map of tracks
 * @param {ArrayBuffer} buffer Your ArrayBuffer filled with tracks
 * @returns {Map<string, Plane>} Your track Map filled with planes
 */
export function buffer_to_tracks(buffer) {
  let tracks = new Map();

  for (let i = 0; i < buffer.byteLength / 15; i += 15) {
    //                      n-th entry * sizeof entry
    let dataView = new DataView(buffer, i * 15, 15);

    const id = utf8_to_utf16(new Uint8Array(buffer, i, 7));
    const lon = dataView.getInt32(7) / 100000;
    const lat = dataView.getInt32(11) / 100000;

    tracks.set(id, new Plane(id, lon, lat))
  }

  return tracks;
}