// @ts-check

import { round_to_x_decimals } from "../lib/general_util.js";

/*
 *
 *
 * Id format: AABXXXX (7)
 * All chars are alphanumeric, and thereby fit easily into an UInt8
 *
 * Coordinate format: (+|-)\d{,3}(?:\.)d{,5}
 * After multiplying by * 100000:
 * -XXXXXXXX / +XXXXXXXX
 * Which is 32bits (signed for negative values)
 */

/**
 * The Plane object, simple with: ``id, lat, long`` 
 * or detailed with: ``id, lat, lon, rot, alt, roc, spd``
 */
export default class Plane {
  id;
  x_lon;
  y_lat;
  /**
   * @type {number | undefined}
   */
  rotation;
  /**
   * @type {number | undefined}
   */
  altitude;
  /**
   * @type {number | undefined}
   */
  airspeed;
  /**
   * @type {number | undefined}
   */
  rate_of_climb;
  /**
   * Create a new Plane object
   * @param {string} id id of this plane
   * @param {number} x_lon position X
   * @param {number} y_lat position Y
   * @param {number} [rotation]
   * @param {number} [altitude]
   * @param {number} [rate_of_climb]
   * @param {number} [airspeed]
   */
  constructor(id, x_lon, y_lat, rotation, altitude, airspeed, rate_of_climb) {
    this.id = id;
    this.x_lon = x_lon;
    this.y_lat = y_lat;

    if (rotation != undefined) this.rotation = rotation;
    if (altitude != undefined) this.altitude = round_to_x_decimals(altitude, 0);
    if (airspeed != undefined) this.airspeed = airspeed;
    if (rate_of_climb != undefined) this.rate_of_climb = rate_of_climb;
  }

  /**
   * Get the integer variant of the y_lat/latitude value of this plane
   * @returns {number} The Int value, fits into an Int32
   */
  get_lat_int() {
    if (!this.y_lat) return 0;
    return this.y_lat * 100000;
  }

  /**
   * Get the integer variant of the x_lon/longitude value of this plane
   * @returns {number} The Int value, fits into an Int32
   */
  get_lon_int() {
    if (!this.x_lon) return 0;
    return this.x_lon * 100000;
  }

  /**
   * Get a null-safe version of the rotation attribute
   * @returns {number}
   */
  get_safe_rot() {
    return this.rotation ? this.rotation : 0;
  }

  /**
   * Get a null-safe version of the altitude attribute
   * @returns {number}
   */
  get_safe_alt() {
    return this.altitude ? this.altitude : 0;
  }

  /**
   * Get a null-safe version of the airspeed attribute
   * @returns {number}
   */
  get_safe_spd() {
    return this.airspeed ? this.airspeed : 0;
  }

  /**
   * Get a null-safe version of the rate of climb attribute
   * @returns {number}
   */
  get_safe_roc() {
    return this.rate_of_climb ? this.rate_of_climb : 0;
  }
}

/**
 * @param {string} property
 */
export function translate_property(property) {
  switch (property) {
    case "lon":
      return "x_lon";
    case "lat":
      return "y_lat";
    case "rot":
      return "rotation";
    case "hei":
      return "altitude";
    case "spd":
      return "airspeed";
    case "roc":
      return "rate_of_climb";
    default:
      return undefined;
  }
}
