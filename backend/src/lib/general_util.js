//@ts-check

/**
 * @param {number} min
 * @param {number} max
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Check for the equality of two objects, possibly on a deeper level
 * @param {any} x Your first object
 * @param {any} y The object you want to your first one to
 * @returns {boolean} Whether these objects are the same
 */
export function deepEqual(x, y) {
  const ok = Object.keys,
    tx = typeof x,
    ty = typeof y;
  return x && y && tx === "object" && tx === ty
    ? ok(x).length === ok(y).length && ok(x).every((key) => deepEqual(x[key], y[key]))
    : x === y;
}

/**
 * @param {number} value
 * @param {number} [decimals]
 */
export function round_to_x_decimals(value, decimals) {
  if (!decimals) {
    decimals = 2;
  }
  value = value * Math.pow(10, decimals);
  value = Math.round(value);
  value = value / Math.pow(10, decimals);
  return value;
}

/**
 * Delay execution by a given time
 * @param {number} t Time in millis 
 * @returns A promise to await
 */
export function delay(t) {
  return /** @type {Promise<void>} */(new Promise(function (resolve) {
    setTimeout(function () {
      resolve();
    }, t);
  }));
}