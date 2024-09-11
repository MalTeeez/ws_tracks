<script lang="ts">
	import { update_state, update_trigger } from '$lib/stores/stores';
	import { getJSON } from '$lib/util/fetch_util';
	import { projectCoords } from '$lib/util/map_util';
	import { fade } from 'svelte/transition';
	import Plane from '../../../../common/model/Plane';
	import { pickHexfromGradient } from '../../../../common/lib/general_util';

	let {
		current_track,
		history_range,
		inter_speed,
		selected = $bindable(),
		innerHeight,
		innerWidth,
	}: {
		current_track: ext_track;
		history_range: number;
		inter_speed: number;
		selected: boolean;
		innerHeight: number;
		innerWidth: number;
	} = $props();

	interface ext_track {
		track: Plane;
		time: number;
	}


	interface map_point {
		x: number;
		y: number;
		length: number | undefined;
		angle: number | undefined;
		lat: number;
		lng: number;
		alt: number;
		spd: number;
		time: number;
		color: [number, number, number];
		show_counter: boolean;
	}

	// TODO: Length on zoom change not updating?
	//       Current line updates & push onto stack if changed

	let last_actual_update: number = 0;
	let timestamp_counter: number = 0;
	let history_range_millis = $state(0);

	$effect(() => {
		history_range_millis = Date.now() - history_range * 1000 * 60;
	});

	const track_history: Array<map_point> = $state(new Array());

	getHistoryData();

	async function getHistoryData() {
		await new Promise<void>(async (resolve) => {
			// Set a timeout for this promise, so we only run it at the current interval speed
			setTimeout(() => resolve(), inter_speed);

			// Get json data from the info api endpoint
			const json = await getJSON('history?id=' + current_track.track.id);
			// And parse that data into our updated track
			for (const entry of json) {
				const prev_point = track_history.at(-1);
				let point: map_point;

				// Handle our timestamp counter
				timestamp_counter++;
				const show_counter = timestamp_counter % 10 == 0;
				if (timestamp_counter >= 10) timestamp_counter = 0;

				if (prev_point) {
					const line = calcLine(
						entry[1].x_lon,
						entry[1].y_lat,
						entry[1].altitude,
						prev_point.x,
						prev_point.y,
					);

					point = {
						x: line.x,
						y: line.y,
						length: line.length,
						angle: line.angle,
						lng: entry[1].x_lon,
						lat: entry[1].y_lat,
						alt: entry[1].altitude,
						spd: entry[1].airspeed,
						time: entry[0],
						color: getAltitudeColor(entry[1].altitude),
						show_counter: show_counter,
					};
				} else {
					const coords = projectCoords(
						{
							lat: entry[1].y_lat,
							lng: entry[1].x_lon,
							alt: entry[1].altitude,
						},
						innerWidth,
						innerHeight,
					);

					point = {
						x: coords.x,
						y: coords.y,
						length: undefined,
						angle: undefined,
						lng: entry[1].x_lon,
						lat: entry[1].y_lat,
						alt: entry[1].altitude,
						spd: entry[1].airspeed,
						time: entry[0],
						color: getAltitudeColor(entry[1].altitude),
						show_counter: show_counter,
					};
				}

				track_history.push(point);
			}
		}).catch((err) =>
			console.warn('Track card update request failed with: ', err),
		);
	}

	$effect(() => {
		$update_trigger;
		// Update is map update, so we:
		//  update the position for our map_points
		if (!$update_state) {
			setTimeout(() => {
				// Update history list
				let prev_point: map_point | undefined;
				for (const point of track_history) {
					const coords = projectCoords(
						{
							lat: point.lat,
							lng: point.lng,
							alt: point.alt,
						},
						innerWidth,
						innerHeight,
					);
					point.x = coords.x;
					point.y = coords.y;

					if (prev_point) {
						const line = calcLine(
							point.lng,
							point.lat,
							point.alt,
							prev_point.x,
							prev_point.y,
						);

						point.length = line.length;
						point.angle = line.angle;
					}

					prev_point = point;
				}
			});
		}
		// Update is actual track update, so we:
		//  recalculate our actual track lines position.
		else {
			setTimeout(() => {
				if (last_actual_update < current_track.time) {
					const prev_point = track_history.at(-1);

					// Handle our timestamp counter
					timestamp_counter++;
					const show_counter = timestamp_counter % 10 == 0;
					if (timestamp_counter >= 10) timestamp_counter = 0;

					if (prev_point) {
						const line = calcLine(
							current_track.track.x_lon,
							current_track.track.y_lat,
							current_track.track.get_safe_alt(),
							prev_point.x,
							prev_point.y,
						);

						const current_point: map_point = {
							x: line.x,
							y: line.y,
							length: line.length,
							angle: line.angle,
							lng: current_track.track.x_lon,
							lat: current_track.track.y_lat,
							alt: current_track.track.get_safe_alt(),
							spd: current_track.track.get_safe_spd(),
							time: current_track.time,
							color: getAltitudeColor(current_track.track.get_safe_alt()),
							show_counter: show_counter,
						};
						setTimeout(() => {
							if (current_point) {
								track_history.push(current_point);
							}
						}, inter_speed - inter_speed / 4)
						last_actual_update = current_track.time;
					}
				}
			});
		}
	});

	function trackEqualsPoint(
		track: Plane,
		point: map_point | undefined,
	): boolean {
		if (!point) return false;
		return (
			track.x_lon == point.x &&
			track.y_lat == point.y &&
			track.get_safe_alt() == point.alt &&
			track.get_safe_spd() == point.spd
		);
	}

	/**
	 * Calculate the properties of a line from coords, previous x & y and altitude for coord to xy precision
	 * @param lon_x
	 * @param lat_y
	 * @param alt
	 * @param prev_x
	 * @param prev_y
	 * @returns A line structure
	 */
	function calcLine(
		lon_x: number,
		lat_y: number,
		alt: number,
		prev_x: number,
		prev_y: number,
	) {
		const coords = projectCoords(
			{
				lng: lon_x,
				lat: lat_y,
				alt: alt,
			},
			innerWidth,
			innerHeight,
		);

		const deltaX = prev_x - coords.x;
		const deltaY = prev_y - coords.y;

		let line_length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
		const line_angle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;
		
		if (line_length > 0 ) {
			line_length += Math.min(innerWidth / innerHeight / line_length * 8 + 1, 2.5);
		}
		
		return {
			x: coords.x,
			y: coords.y,
			length: line_length,
			angle: line_angle,
		};
	}

	function getAltitudeColor(altitude: number) {
		const start_color: [number, number, number] = [0, 242, 96];
		const end_color: [number, number, number] = [5, 117, 230];

		const max_alt = 32786;
		altitude = Math.min(altitude, max_alt) / max_alt;

		return pickHexfromGradient(start_color, end_color, altitude)
	}

</script>

{#each track_history as track}
	{#if track.time >= history_range_millis && track.length}
		<div transition:fade>
			<div
				class="line z-17"
				style="
                    left:{track.x}px; 
                    top:{track.y + 2}px; 
                    width:{track.length}px; 
                    transform: rotate({track.angle}deg); 
                    background-color: rgba({track.color[0]},{track.color[1]},{track.color[2]}, 1)
                "
			>
				{#if track.show_counter}
					{#if track.angle && track.angle > 0 && track.angle > -170}
						<div style="transform: rotate({track.angle * -1}deg); ">
							<p class="text-slate-800 font-bold font-mono drop-shadow-lg z-18">{new Date(track.time).getHours() + ":" + new Date(track.time).getMinutes()}
							</p>
						</div>
					{:else}
						<p class="text-slate-800 font-bold font-mono drop-shadow-lg z-18">{new Date(track.time).getHours() + ":" + new Date(track.time).getMinutes()}
						</p>
					{/if}
				{/if}
			</div>
		</div>
	{/if}
{/each}

<style>
	.line {
		transition: background-color 0.25s linear;
		border-radius: 3px;
		height: 4px;
		position: absolute;
		transform-origin: 0px 0px;
	}
</style>
