export const Interval: Array<number> = [5000, 2000, 500, 100, 50, 25];

export function msToString(ms: number, padding: string = ''): string {
	let seconds: number = Math.round((ms / 1000) * 10) / 10;
	if (seconds > 1) return seconds + padding + 's';
	else return String(ms) + padding + 'ms';
}

export function getInterval(ms: number): number {
	let min: number = 5001;
    let min_interval: number = 500;
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
export function later(delay: number) {
	return new Promise(function (resolve) {
		setTimeout(resolve, delay);
	});
}
