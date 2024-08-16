import Plane from '../../../../common/model/Plane.js';
import { utf8_to_utf16 } from '../../../../common/lib/general_util.js'
import LatLon from 'geodesy/latlon-spherical.js';


export function parse_track_string(track_msg: string): Array<Plane> {
	const tracks: Array<Plane> = new Array<Plane>();
	try {
		const matches: IterableIterator<RegExpExecArray> = track_msg.matchAll(
			/((?<plane_id>[0-9A-Z]{1,6}),(?<x_pos>\d+\.?\d{0,5}),(?<y_pos>\d+\.?\d{0,5});)+?/g,
		);

		for (const group of matches) {
			const track_id: string | undefined = group.at(2);
			const x: string | undefined = group.at(3);
			const y: string | undefined = group.at(4);

			if (track_id && x && y) {
				//console.log("id: " + track_id + ", x: " + x + ", y: " + y + " - from: " + track_msg);
				const plane = new Plane(track_id, Number(x) * 100, Number(y) * 10);
				tracks.push(plane);
			} else {
				console.warn('Failed to parse track update with match data: ' + group);
			}
		}
	} catch (err) {
		console.warn('Failed to parse track update with error: ', err);
	}
	return tracks;
}

// Similar function at backend/src/lib/track_util.js buffer_to_tracks()
/**
 * Convert an ArrayBuffer of tracks to a Map of tracks
 * @param {ArrayBuffer} buffer Your ArrayBuffer filled with tracks
 * @returns {Array<Plane>} Your track Map filled with planes
 */
export function parse_track_buffer(buffer: ArrayBuffer): Array<Plane> {
  let tracks = new Array<Plane>;

  for (let i = 0; i < buffer.byteLength / 15; i += 15) {
    //                      n-th entry * sizeof entry
    let dataView = new DataView(buffer, i * 15, 15);

    const id = utf8_to_utf16(new Uint8Array(buffer, i, 7));
    const lon = dataView.getInt32(7) / 100000;
    const lat = dataView.getInt32(11) / 100000;

    //const p1 = new LatLon(lon, lat)

    tracks.push(new Plane(id, lon * 150, lat * 9.5))
  }

  return tracks;
}