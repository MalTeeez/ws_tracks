// @ts-check
export default class Plane {
  id;
  x;
  y;
  /**
   * Create a new Plane object
   * @param {number} x position X
   * @param {number} y position Y
   * @param {number} id TEMP numeric id
   */
  constructor(x, y, id) {
    this.id = id;
    this.x = x;
    this.y = y;
  }

  /**
  * @param {number} id
  */
  setId(id) {
    this.id = id;
  }

}
