// @ts-check
export default class Plane {
  id;
  x;
  y;
  /**
   * @type {number}
   */
  rotation;
  /**
   * @type {number}
   */
  altitude;
  /**
   * @type {number}
   */
  airspeed;
  /**
   * @type {number}
   */
  rate_of_climb;
  /**
   * Create a new Plane object
   * @param {number} id id of this plane
   * @param {number} [x] position X
   * @param {number} [y] position Y
   * @param {number} [rotation]
   * @param {number} [altitude]
   * @param {number} [rate_of_climb]
   * @param {number} [airspeed]
   */
  constructor(id, x, y, rotation, altitude, airspeed, rate_of_climb) {
    this.id = id;
    if (x) this.x = x;
    if (y) this.y = y;

    if (rotation) this.rotation = rotation;
    if (altitude) this.altitude = altitude;
    if (airspeed) this.airspeed = airspeed;
    if (rate_of_climb) this.rate_of_climb = rate_of_climb;
  }
}


/**
 * @param {string} property
 */
export function translate_property(property) {
  switch (property) {
    case 'lon': return 'x';
    case 'lat': return 'y';
    case 'rot': return 'rotation';
    case 'hei': return 'altitude';
    case 'spd': return 'airspeed';
    case 'roc': return 'rate_of_climb';
    default: return undefined;
  }
}