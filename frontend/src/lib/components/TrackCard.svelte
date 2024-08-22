<script lang="ts">
	import { tweened } from 'svelte/motion';
	import Plane from '../../../../common/model/Plane';
	import { cubicOut } from 'svelte/easing';
	import TrackInfo from './TrackInfo.svelte';
	import { getJSON } from '$lib/util/fetch_util';

	let {
		parent_track,
		parent_x,
		parent_y,
		inter_speed,
		selected = $bindable(),
	}: {
		parent_track: Plane;
		parent_x: number;
		parent_y: number;
		inter_speed: number;
		selected: boolean;
	} = $props();

	let innerWidth = $state(0);
	let innerHeight = $state(0);

	let mainCardElement: HTMLDivElement;
	let card_height: number = $state(-1);
	let icon_visibility: string = $state('visible');
	let is_in_focus: boolean = $state(false);

	let line_length: number = $state(0);
	let line_angle: number = $state(0);
	let line_color: string = $state('ffffffff');

	let full_track: Plane = $state(
		new Plane(parent_track.id, parent_x, parent_y),
	);

	// #region Card positioning
	let dist = { x: 25, y: 200 };

	let x_pos = tweened(parent_x, {
		duration: Math.max(Math.min(inter_speed, 2000), 250),
		easing: cubicOut,
	});

	let y_pos = tweened(parent_y, {
		duration: Math.max(Math.min(inter_speed, 2000), 250),
		easing: cubicOut,
	});

	let in_bottom_half = $state(false);
	let in_right_half = $state(false);
	let has_been_dragged = $state(false);

	$effect(() => update_pos(parent_x, parent_y, innerHeight, innerWidth));

	// Calculate box position
	function update_pos(
		par_x: number,
		par_y: number,
		height: number,
		width: number,
	) {
		// Is in right half?
		in_right_half = parent_x > width / 2;
		// Is in bottom half?
		in_bottom_half = parent_y > height / 2;

		if (!has_been_dragged) {
			$x_pos = par_x + (in_right_half ? dist.x * -1 : dist.x);
			$y_pos = par_y + (in_bottom_half ? dist.y * -1 : dist.y);
		}
	}

	//#region Line drawing
	// Calculate line position, angle, length
	$effect(() => {
		if (mainCardElement) {
			updateCardHeight();
			
			const deltaX = parent_x - $x_pos;
			const deltaY = parent_y - $y_pos;

			line_length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
			line_angle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;

			// Dont let the card get dragged away too far from the track
			if (
				line_length >
				Math.sqrt(Math.pow(innerWidth, 2) + Math.pow(innerHeight, 2)) / 5
			) {
				closeDragElement();
				has_been_dragged = false;
				update_pos(parent_x, parent_y, innerHeight, innerWidth);
			}
		}
	});

	function updateCardHeight() {
		card_height = mainCardElement.clientHeight;
	}

	//#region Card dragging
	function dragMouseDown() {
		is_in_focus = true;
		// Stop binding the function
		document.onmouseup = closeDragElement;
		// Bind the onmousemove to the element while mouse is down
		document.onmousemove = elementDrag;
	}

	function elementDrag(event: MouseEvent) {
		// Move element while onmousemove
		$x_pos = event.clientX;
		$y_pos = event.clientY + mainCardElement.clientHeight / 2 - 13;
		has_been_dragged = true;
	}

	function closeDragElement() {
		// Stop moving when mouse button is released
		document.onmouseup = null;
		document.onmousemove = null;
		is_in_focus = false;
	}

// #region API Request
	// Trigger on inter_speed changes
	$effect(() => {
		// Update on:
		inter_speed;
		// Dont update on contents of this function
		setTimeout(() => {
			keepUpdatingData()
		});
	})

	async function keepUpdatingData() {
		const start_interval = inter_speed;
		let last_actual_update = Date.now();

		while (selected && start_interval == inter_speed) {
			await new Promise<void>(async (resolve) => {
				// Set a timeout for this promise, so we only run it at the current interval speed
				setTimeout(() => resolve(), inter_speed);

				// Get json data from the info api endpoint
				const json = await getJSON('info?id=' + parent_track.id);
				// And parse that data into our updated track
				if (json.last_update != last_actual_update) {
					full_track = new Plane(
						json.id,
						json.x_lon,
						json.y_lat,
						json.rotation,
						json.altitude,
						json.airspeed,
						json.rate_of_climb,
					);
					last_actual_update = json.last_update;
				}

			}).catch((err) =>
				console.warn('Track card update request failed with: ', err),
			);
		}
	}
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<!-- <div
	id="true-middle-indicator"
	class="true-middle bg-yellow-400 absolute h-1 w-1 z-50"
	style="left: {$x_pos}px; top: {$y_pos}px;"
></div> -->

<div
	class="absolute pointer-events-none"
	style="left: {$x_pos.toFixed(2)}px; top: {$y_pos.toFixed(
		2,
	)}px; z-index: {is_in_focus ? 25 : 22}"
	role="group"
>
	<div class="relative true-middle pointer-events-auto">
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			class="interpolate-height min-w-60 max-w-64 drop-shadow-xl backdrop-blur-lg backdrop-saturate-[1.1] backdrop-brightness-90 rounded-lg overflow-hidden"
			style="height: {card_height}px; max-height: 17.5rem;"
			role="tooltip"
			bind:this={mainCardElement}
			onmousedown={dragMouseDown}
		>
			<!-- 			style="height: {card_height}rem; max-height: 17.5rem;"  -->
			<div class="flex flex-col">
				<div id="header" class="grid grid-cols-2 pt-0.5 pb-1 px-1">
					<div
						class="text-sm pl-1 font-sans font-semibold tracking-wide overline select-none"
					>
						{parent_track.id}
					</div>
					<div class="flex flex-row-reverse">
						<button
							class=""
							onclick={() => {
								new Promise(() => {
									line_color = 'ffffff00';
									icon_visibility = 'hidden';
									card_height = 0;
									setTimeout(() => {
										selected = false;
									}, 250);
								});
							}}
						>
							<svg
								class="fill-slate-50 cursor-pointer pointer-events-auto"
								width="20"
								height="20"
								viewBox="0 0 1000 1000"
								visibility={icon_visibility}
								xmlns="http://www.w3.org/2000/svg"
								><path
									d=" M 300 275C 306 275 313 277 318 282C 318 282 500 465 500 465C 500 465 682 282 682 282C 687 278 693 275 700 275C 710 274 719 281 723 290C 727 299 725 310 718 318C 718 318 535 500 535 500C 535 500 718 682 718 682C 724 689 727 698 724 707C 722 715 715 722 707 724C 698 727 689 724 682 718C 682 718 500 535 500 535C 500 535 318 718 318 718C 311 724 302 727 293 724C 285 722 278 715 276 707C 273 698 276 689 282 682C 282 682 465 500 465 500C 465 500 282 318 282 318C 275 311 273 300 277 290C 280 281 290 275 300 275C 300 275 300 275 300 275"
								/></svg
							>
						</button>
						{#if has_been_dragged}
							<button
								class=""
								onclick={() => {
									has_been_dragged = false;
									update_pos(parent_x, parent_y, innerHeight, innerWidth);
								}}
							>
								<svg
									class="fill-slate-50 cursor-pointer pointer-events-auto"
									width="20"
									height="20"
									viewBox="0 0 1000 1000"
									visibility={icon_visibility}
									xmlns="http://www.w3.org/2000/svg"
									><path
										d=" M 788 375C 788 375 788 500 788 500C 788 526 775 545 760 560C 745 575 726 588 700 588C 700 588 438 588 438 588C 438 588 438 650 438 650C 437 680 404 698 379 681C 379 681 234 584 234 584C 221 578 212 565 212 551C 212 551 212 551 212 551C 212 550 212 550 212 550C 212 535 221 522 234 516C 234 516 379 419 379 419C 404 402 437 420 438 450C 438 450 438 513 438 513C 438 513 700 513 700 513C 698 513 703 511 707 507C 711 503 713 498 713 500C 713 500 713 375 713 375C 712 354 729 337 749 337C 771 337 788 354 788 375C 788 375 788 375 788 375"
									/></svg
								>
							</button>
						{/if}
					</div>
				</div>
				<div
					id="info-container"
					class="px-1 pb-1 pt-1 gap-x-1 gap-y-1.5 min-w-0 backdrop-brightness-[0.75] backdrop-blur-xl select-none grid grid-cols-2 overflow-hidden"
				>
					{#if full_track}
						<TrackInfo
							title="Latitude"
							unit_multi="minutes"
							unit_single="minute"
							value={full_track.x_lon}
							{inter_speed}
							decimals={3}
						></TrackInfo>
						<TrackInfo
							title="Longitude"
							unit_multi="minutes"
							unit_single="minute"
							value={full_track.y_lat}
							{inter_speed}
							decimals={3}
						></TrackInfo>
						<TrackInfo
							title="Airspeed"
							unit_multi="knots"
							unit_single="knot"
							value={full_track.get_safe_spd()}
							{inter_speed}
							decimals={1}
						></TrackInfo>
						<TrackInfo
							title="Heading"
							unit_multi="degrees"
							unit_single="degree"
							value={full_track.get_safe_rot()}
							{inter_speed}
							decimals={1}
						></TrackInfo>
						<TrackInfo
							title="Altitude"
							unit_multi="feet"
							unit_single="foot"
							value={full_track.get_safe_alt()}
							{inter_speed}
							decimals={0}
						></TrackInfo>
						<TrackInfo
							title="Climb Rate"
							unit_multi="feet/min"
							unit_single="feet/min"
							value={full_track.get_safe_roc()}
							{inter_speed}
							decimals={1}
						></TrackInfo>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

<div
	class="line z-21"
	style="left:{$x_pos.toFixed(2)}px; top:{$y_pos.toFixed(
		2,
	)}px; width:{line_length.toFixed(2)}px; transform: rotate({line_angle.toFixed(
		2,
	)}deg); background-color: #{line_color}"
></div>

<style>
	.true-middle {
		transform: translate(-50%, -50%);
	}

	.interpolate-height {
		transition:
			max-height 0.25s linear,
			height 0.25s linear;
	}

	.line {
		transition: background-color 0.25s linear;
		height: 2px;
		border-radius: 3px;
		position: absolute;
		transform-origin: 0px 0px;
	}
</style>
