import { utf16_to_utf8, utf8_to_utf16 } from "../../lib/general_util.js";
import Packet from "./PacketInterface.js";

export default class DeletePacket extends Packet {
  /**
   * Stored as ``Uint8``
   * @type {number}
   * @byte_size - 1
   */
  static ID = 2;

  /**
   * The track id of the plane this track belongs to.
   * Maximum of 7 characters, all ASCII
   * 
   * Stored as ``Uint8Array``
   * @byte_size 7
   */
  track_id;

  static SIZE = 9;

  /**
   * Create a new UpdatePacket for a track
   * @param {string} track_id The track id of the plane this track belongs to.
   * Maximum of 7 characters, all ASCII
   */
  // @ts-ignore
  constructor(track_id) {
    super();
    this.track_id = track_id;
  }

    /**
   * @param {ArrayBuffer} buffer
   * @returns {DeletePacket | undefined}
   */
  static fromBuffer(buffer) {
    // Check if this packet has to right length
    if (buffer.byteLength == DeletePacket.SIZE) {
      const dataView = new DataView(buffer);
      let offset = 0;

      // And check if it has the right id
      if (dataView.getUint8(offset) == this.ID) {
        offset += 1;

        // Track ID
        const track_id = utf8_to_utf16(new Uint8Array(buffer, offset, 7));
        offset += 7;

        return new DeletePacket(track_id)
      } else {
        console.log("Packet had wrong id: " + dataView.getUint8(0) + ", we were expecting: " + this.ID)
      }
    } else {
      console.log("Packet had wrong size: " + buffer.byteLength + ", we were expecting: " + this.SIZE)
    }
    return undefined;
  }

  /**
 * @override
 */
  serialize() {
    const buffer = new ArrayBuffer(DeletePacket.SIZE);
    const dataView = new DataView(buffer);
    let offset = 0;

    // Packet ID
    dataView.setUint8(offset, DeletePacket.ID);
    offset += 1;

    // Track ID
    // Go through each char of the id, and append that onto our buffer
    const utf8_string = utf16_to_utf8(this.track_id);
    for (let i = 0; i < 7; i++) {
      const char = utf8_string.at(i);
      if (char) {
        // @ts-ignore We just checked that it is not null
        dataView.setUint8(offset + i, char);
      } else {
        // Set 0 if id isnt long enough
        dataView.setUint8(offset + i, 0);
      }
    }
    offset += 7;

    return buffer;
  }

  /**
   * Serialize this packet into an array of uint8 ints
   * Helpful if you need to append multiple array buffers together
   * @returns {Uint8Array}
   */
  serialize_to_array() {
    return new Uint8Array(this.serialize());
  }
}