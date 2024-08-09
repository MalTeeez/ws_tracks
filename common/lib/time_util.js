/**
 * @type {Array<number>}
 */
export const Interval = [5000, 2000, 500, 100, 50, 25];

/**
 * 
 * @param {number} ms Your time in milliseconds
 * @param {string} padding Optional padding between the number and its unit
 * @returns {string} A formatted string with your number and the fitting unit
 */
export function msToString(ms, padding = '') {
	let seconds = Math.round((ms / 1000) * 10) / 10;
	if (seconds > 1) return seconds + padding + 's';
	else return String(ms) + padding + 'ms';
}

/**
 * Get the nearest available interval to your provided time
 * @param {number} ms Your time in milliseconds
 * @returns {number} The nearest interval in milliseconds
 */
export function getInterval(ms) {
	let min = 5001;
    let min_interval = 500;
	for (let interval of Interval) {
		if (Math.min(Math.abs(ms - interval), min) != min) {
			min = Math.abs(ms - interval);
			min_interval = interval;
		}
	}
	return min_interval;
}

/**
 * Wait for x milliseconds (don't forget to await func)
 * @param {number} delay Milliseconds to wait
 * @returns A promise which resolves after x millis (needs to be awaited)
 */
export function later(delay) {
	return new Promise(function (resolve) {
		setTimeout(resolve, delay);
	});
}


/**
 * Format an interval into a css compatible string
 * @param {number} interval The interval to convert
 * @returns {string}
 */
export function msToCSS(interval) {
	return (interval / 1000).toFixed(1) + 's'
}
