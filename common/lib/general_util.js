//@ts-check

/**
 * @param {number} min
 * @param {number} max
 */
export function random_int(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * @param {number} min
 * @param {number} max
 * @param {number} [decimals]
 */
export function random_float(min, max, decimals) {
  return round_to_x_decimals(Math.random() * (max - min + 1) + min, decimals);
}

/**
 * Check for the equality of two objects, possibly on a deeper level
 * @param {any} x Your first object
 * @param {any} y The object you want to your first one to
 * @returns {boolean} Whether these objects are the same
 */
export function deep_equal(x, y) {
  const ok = Object.keys,
    tx = typeof x,
    ty = typeof y;
  return x && y && tx === "object" && tx === ty
    ? ok(x).length === ok(y).length && ok(x).every((key) => deep_equal(x[key], y[key]))
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

/**
 * 
 * @param {string} str Your UTF16 string
 * @returns {Uint8Array} An array of ascii chars (numbers)
 */
export function utf16_to_utf8(str) {
  // Javascript strings are utf16, so we need to first convert ours to utf8
  var utf8 = unescape(encodeURIComponent(str));

  var arr = new Uint8Array(utf8.length)
  for (var i = 0; i < utf8.length; i++) {
    arr[i] = utf8.charCodeAt(i)
  }
  return arr;
}

/**
 * 
 * @param {Uint8Array} arr Your utf8 char array
 * @returns {string} The converted utf16 string
 */
export function utf8_to_utf16(arr) {
  let string = "";
  for (let i = 0; i < arr.length; i++) {
    // @ts-ignore arr[i] will never go oob, since we dont loop over the length of arr.length
    string += String.fromCharCode(arr[i]);
  }
  return string;
}

/**
 * Generate a random 1 byte char string of a set length
 * @param {number} length
 * @returns {string}
 */
export function generateRandomString(length) {
  let string = "";
  for (let i = 0; i < length; i++) {
    string += String.fromCharCode(random_int(32, 126));
  }
  return string;
}


/* FROM https://developers.google.com/maps/documentation/tile/2d-tiles-overview
var TILE_SIZE = 256;

function fromLatLngToPoint(latLng) {
  var mercator = -Math.log(Math.tan((0.25 + latLng.lat() / 360) * Math.PI));
  return {
    x: TILE_SIZE * (latLng.lng() / 360 + 0.5),
    y: TILE_SIZE / 2 * (1 +  mercator / Math.PI)
  };
}

function fromLatLngToTileCoord(latLng, zoom) {
  var point = fromLatLngToPoint(latLng);
  var scale = Math.pow(2, zoom);

  return {
    x: Math.floor(point.x * scale / TILE_SIZE),
    y: Math.floor(point.y * scale / TILE_SIZE),
    z: zoom
  };
}
*/