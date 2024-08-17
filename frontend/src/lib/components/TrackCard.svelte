<script lang="ts">
	import { spring, tweened } from 'svelte/motion';
	import Plane from '../../../../common/model/Plane';
	import { cubicInOut, cubicOut, linear } from 'svelte/easing';

	let innerWidth = $state(0);
	let innerHeight = $state(0);

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

	let dist = { x: 50, y: 100 };

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

	let mainCardElement: HTMLDivElement;
	let card_height: number = $state(4);
	let icon_visibility: string = $state("visible");

	let line_length: number = $state(0);
	let line_angle: number = $state(0);
	let line_color: string = $state('ffffffff');

	// Calculate line position, angle, length
	$effect(() => {
		if (mainCardElement) {
			const deltaX = parent_x - $x_pos;
			const deltaY = parent_y - $y_pos;

			line_length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
			line_angle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;

			// Dont let the card get dragged away too far from the track
			if (
				line_length >
				Math.sqrt(Math.pow(innerWidth, 2) + Math.pow(innerHeight, 2)) / 6
			) {
				closeDragElement();
				has_been_dragged = false;
				update_pos(parent_x, parent_y, innerHeight, innerWidth);
			}
		}
	});

	function dragMouseDown() {
		// Stop binding the function
		mainCardElement.onmouseup = closeDragElement;
		// Bind the onmousemove to the element while mouse is down
		mainCardElement.onmousemove = elementDrag;
	}

	function elementDrag(event: MouseEvent) {
		// Move element while onmousemove
		$x_pos = event.clientX;
		$y_pos = event.clientY;
		has_been_dragged = true;
	}

	function closeDragElement() {
		// Stop moving when mouse button is released
		mainCardElement.onmouseup = null;
		mainCardElement.onmousemove = null;
	}
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<!-- <div
	id="true-middle-indicator"
	class="true-middle bg-yellow-400 absolute h-1 w-1 z-50"
	style="left: {$x_pos}px; top: {$y_pos}px;"
></div> -->

<div
	class="absolute pointer-events-auto z-20"
	style="left: {$x_pos}px; top: {$y_pos}px;"
	role="group"
>
	<div class="relative true-middle">
		<button
			class="absolute top-[2px] right-[2px]"
			onclick={() => {
				new Promise(() => {
					line_color = 'ffffff00';
					card_height = 0;
					icon_visibility = "hidden";
					setTimeout(() => {
						selected = false;
					}, 250);
				});
			}}
		>
			<svg
				class="fill-slate-950 cursor-pointer pointer-events-auto"
				width="12"
				height="12"
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
				class="absolute top-[2px] right-[14px]"
				onclick={() => {
					has_been_dragged = false;
					update_pos(parent_x, parent_y, innerHeight, innerWidth);
				}}
			>
				<svg
					class="fill-slate-950 cursor-pointer pointer-events-auto"
					width="12"
					height="12"
					viewBox="0 0 1000 1000"
					visibility={icon_visibility}
					xmlns="http://www.w3.org/2000/svg"
					><path
						d=" M 788 375C 788 375 788 500 788 500C 788 526 775 545 760 560C 745 575 726 588 700 588C 700 588 438 588 438 588C 438 588 438 650 438 650C 437 680 404 698 379 681C 379 681 234 584 234 584C 221 578 212 565 212 551C 212 551 212 551 212 551C 212 550 212 550 212 550C 212 535 221 522 234 516C 234 516 379 419 379 419C 404 402 437 420 438 450C 438 450 438 513 438 513C 438 513 700 513 700 513C 698 513 703 511 707 507C 711 503 713 498 713 500C 713 500 713 375 713 375C 712 354 729 337 749 337C 771 337 788 354 788 375C 788 375 788 375 788 375"
					/></svg
				>
			</button>
		{/if}
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			bind:this={mainCardElement}
			onmousedown={dragMouseDown}
			class="w-10 bg-blue-400 overflow-hidden interpolate-height"
			style="height: {card_height}rem;"
			role="tooltip"
		></div>
	</div>
</div>

<div
	class="line z-22"
	style="left:{$x_pos}px; top:{$y_pos}px; width:{line_length}px; transform: rotate({line_angle}deg); background-color: #{line_color}"
></div>

<style>
	.true-middle {
		transform: translate(-50%, -50%);
	}

	.interpolate-height {
		transition: height 0.25s linear;
	}

	.line {
		transition: background-color 0.25s linear;
		height: 2px;
		border-radius: 3px;
		position: absolute;
		transform-origin: 0px 0px;
	}
</style>
