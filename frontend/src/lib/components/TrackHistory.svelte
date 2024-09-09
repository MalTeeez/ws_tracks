<script lang="ts">
	import { update_state } from '$lib/stores/stores';
	import { getJSON } from '$lib/util/fetch_util';
	import { projectCoords } from '$lib/util/map_util';
	import { fade } from 'svelte/transition';
	import Plane from '../../../../common/model/Plane';

	let {
		current_track,
		history_range,
		inter_speed,
		selected = $bindable(),
		innerHeight,
		innerWidth,
	}: {
		current_track: Plane;
		history_range: number;
		inter_speed: number;
		selected: boolean;
		innerHeight: number;
		innerWidth: number;
	} = $props();

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
	}

    // TODO: Length on zoom change not updating?
    //       Current line updates & push onto stack if changed

    let current_x: number;
    let current_y: number;
    let current_length: number;
    let current_angle: number;

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
			const json = await getJSON('history?id=' + current_track.id);
			// And parse that data into our updated track
			for (const entry of json) {
				const coords = projectCoords(
					{
						lat: entry[1].y_lat,
						lng: entry[1].x_lon,
						alt: entry[1].altitude,
					},
					innerWidth,
					innerHeight,
				);

				const prev_point = track_history.at(-1);
				let point: map_point;

				if (prev_point) {
					const deltaX = prev_point.x - coords.x;
					const deltaY = prev_point.y - coords.y;

					const line_length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
					const line_angle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;

					point = {
						x: coords.x,
						y: coords.y,
						length: line_length * 1.15,
						angle: line_angle,
						lng: entry[1].x_lon,
						lat: entry[1].y_lat,
						alt: entry[1].altitude,
						spd: entry[1].airspeed,
						time: entry[0],
					};
				} else {
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
					};
				}

				track_history.push(point);
			}
		}).catch((err) =>
			console.warn('Track card update request failed with: ', err),
		);
	}

	$effect(() => {
        // Update is map update, so we:
		//  update the position for our map_points
		if (!$update_state) {
			setTimeout(() => {
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
				}
			});
		} 
        // Update is actual track update, so we:
        //  recalculate our actual track lines position.
        else {

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
</script>

{#each track_history as track}
	{#if track.time >= history_range_millis && track.length}
		<div transition:fade>
			<!-- <div
				id="true-middle-indicator"
				class="absolute z-50 size-2 rounded-md bg-yellow-400"
				style="left: {track.x}px; top: {track.y}px; transform: translate(-50%, -50%);"
			></div> -->
			<div
				class="line z-21"
				style="
                    left:{track.x}px; 
                    top:{track.y}px; 
                    width:{track.length}px; 
                    transform: rotate({track.angle}deg); 
                    background-color: #FFFFFF
                "
			></div>
		</div>
	{/if}
{/each}
    <div
				class="line z-21"
				style="
                    left:{current_x}px; 
                    top:{current_y}px; 
                    width:{current_length}px; 
                    transform: rotate({current_angle}deg); 
                    background-color: #FFFFFF
                "
			></div>

<style>
    .line {
		transition: background-color 0.25s linear;
		height: 5px;
		border-radius: 3px;
		position: absolute;
		transform-origin: 0px 0px;
	}
</style>
