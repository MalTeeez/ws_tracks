import { round_to_x_decimals, utf16_to_utf8, utf8_to_utf16 } from "../../lib/general_util.js";
import Plane from "../Plane.js";
import Packet from "./PacketInterface.js";

// @ts-check
/**
 * Needed bits for size
 * Example track msg: CFG791X,9.81639,51.87444;
 * Needed bytes:        7      4        4         (15 bytes) (out of date, but you get the point)
 * Type:              UInt8   Int32    Int32
 * 
 * */
export default class UpdatePacket extends Packet {
  /**
   * Stored as ``Uint8``
   * @type {number}
   * @byte_size - 1
   */
  static ID = 1;

  /**
   * The track id of the plane this track belongs to.
   * Maximum of 7 characters, all ASCII
   * 
   * Stored as ``Uint8Array``
   * @byte_size 7
   */
  track_id;
  /**
   * This tracks longitude, multiplied to an int.
   * Maximum 9 digits precision, negative allowed.
   * 
   * Stored as ``Int32``
   * @byte_size 4
   */
  x_lon;
  /**
   * This tracks latitude, multiplied to an int.
   * Maximum 9 digits precision, negative allowed.
   * 
   * Stored as ``Int32``
   * @byte_size 4
   */
  y_lat;
  /**
   * This tracks altitude.
   * Maximum 9 digits precision, negative forbidden.
   * 
   * Stored as ``Uint32``
   * @byte_size 4
   */
  altitude;
  /**
   * This track heading / rotation.
   * Maximum 3 digits precision, negative allowed.
   * 
   * Stored as ``Int16``
   * @byte_size 2
   */
  heading;

  static SIZE = 22;

  /**
   * Create a new UpdatePacket for a track
   * @param {string} track_id The track id of the plane this track belongs to.
   * Maximum of 7 characters, all ASCII
   * @param {number} x_lon This tracks latitude, multiplied to an int.
   * Maximum 9 digits precision, negative allowed.
   * @param {number} y_lat This tracks altitude.
   * Maximum 9 digits precision, negative forbidden.
   * @param {number} altitude This tracks altitude.
   * Maximum 9 digits precision, negative forbidden.
   */
  // @ts-ignore
  constructor(track_id, x_lon, y_lat, altitude, heading) {
    super();
    this.track_id = track_id;
    this.x_lon = x_lon;
    this.y_lat = y_lat;
    this.altitude = round_to_x_decimals(altitude, 0);
    this.heading = round_to_x_decimals(heading, 0);
  }

  /**
   * @param {ArrayBuffer} buffer
   * @returns {UpdatePacket | undefined}
   */
  static fromBuffer(buffer) {
    // Check if this packet has to right length
    if (buffer.byteLength == UpdatePacket.SIZE) {
      const dataView = new DataView(buffer);
      let offset = 0;

      // And check if it has the right id
      if (dataView.getUint8(offset) == this.ID) {
        offset += 1;

        // Track ID
        const track_id = utf8_to_utf16(new Uint8Array(buffer, offset, 7));
        offset += 7;

        // Longitude & Latitude & Altitude
        const x_lon = dataView.getInt32(offset);
        offset += 4;
        const y_lat = dataView.getInt32(offset);
        offset += 4;
        const altitude = dataView.getUint32(offset);
        offset += 4;
        const heading = dataView.getInt16(offset);
        offset += 2;

        return new UpdatePacket(track_id, x_lon, y_lat, altitude, heading)
      } else {
        console.log("Packet had wrong id: " + dataView.getUint8(0) + ", we were expecting: " + this.ID)
      }
    } else {
      console.log("Packet had wrong size: " + buffer.byteLength + ", we were expecting: " + this.SIZE)
    }
    return undefined;
  }

  /**
   * Create an update packet from a plane object. Parses safely.
   * @param {Plane} plane
   * @returns {UpdatePacket}
   */
  static fromTrack(plane) {
    return new UpdatePacket(
      plane.id, 
      plane.get_lon_int(), 
      plane.get_lat_int(), 
      plane.get_safe_alt(),
      plane.get_safe_rot()
    )
  }

  /**
   * Create a plane object from an update packet. Parses safely.
   * @returns {Plane}
   */
  toPlane() {
    const plane = new Plane(
        this.track_id, 
        this.x_lon / 100000, 
        this.y_lat / 100000
    );
    plane.altitude = this.altitude;
    plane.rotation = this.heading;
    return plane;
  }

  /**
 * @override
 */
  serialize() {
    const buffer = new ArrayBuffer(UpdatePacket.SIZE);
    const dataView = new DataView(buffer);
    let offset = 0;

    // Packet ID
    dataView.setUint8(offset, UpdatePacket.ID);
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

    // Longitude & Latitude & Altitude
    dataView.setInt32(offset, this.x_lon);
    offset += 4;
    dataView.setInt32(offset, this.y_lat);
    offset += 4;
    dataView.setUint32(offset, this.altitude);
    offset += 4;
    dataView.setInt16(offset, this.heading);

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
