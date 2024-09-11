import Plane from '../../../../common/model/Plane.js';
import Packet from '../../../../common/model/packet/PacketInterface.js';
import UpdatePacket from '../../../../common/model/packet/UpdatePacket.js'
import DeletePacket from '../../../../common/model/packet/DeletePacket.js'

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

/**
 * @param {ArrayBuffer} buffer
 * @returns {Array<UpdatePacket>}
 */
export function buffer_to_update_packets(buffer: ArrayBuffer): Array<UpdatePacket> {
	const size = UpdatePacket.SIZE;
	let update_packet_array: Array<UpdatePacket> = new Array();
	if (buffer.byteLength % size == 0) {
		const update_count = buffer.byteLength / size;
		for (let i = 0; i < update_count; i++) {
			const packet = UpdatePacket.fromBuffer(buffer.slice(i*size, i*size + size));
			if (packet) {
				update_packet_array.push(packet)
			} else {
				console.warn("Received faulty track update with data: ", buffer.slice(i*size, i*size + size))
			}
		}
	}
	return update_packet_array;
}

/**
 * @param {ArrayBuffer} buffer
 * @returns {Array<DeletePacket>}
 */
export function buffer_to_delete_packets(buffer: ArrayBuffer): Array<DeletePacket> {
	const size = DeletePacket.SIZE;
	let delete_packet_array: Array<DeletePacket> = new Array();
	if (buffer.byteLength % size == 0) {
		const update_count = buffer.byteLength / size;
		for (let i = 0; i < update_count; i++) {
			const packet = DeletePacket.fromBuffer(buffer.slice(i*size, i*size + size));
			if (packet) {
				delete_packet_array.push(packet)
			} else {
				console.warn("Received faulty track delete with data: ", buffer.slice(i*size, i*size + size))
			}
		}
	}
	return delete_packet_array;
}

// Similar function at backend/src/lib/track_util.js packets_to_tracks()
/**
 * Convert a list of update packets to a Map of tracks
 * @param {Array<UpdatePacket>} update_packets Your Array filled with track packets
 * @returns {Array<Plane>} Your track Map filled with planes
 */
export function packets_to_tracks(update_packets: Array<UpdatePacket>): Array<Plane> {
  let tracks: Array<Plane> = [];

  for (const packet of update_packets) {
    let track = packet.toPlane();
    tracks.push(track)
  }

  return tracks;
}

/**
 * Wrapper for packets_to_tracks and buffer_to_packets
 * @param {ArrayBuffer} buffer
 * @returns {Array<Plane>}
 */
export function buffer_to_tracks(buffer: ArrayBuffer): Array<Plane> {
	return packets_to_tracks(buffer_to_update_packets(buffer))
}