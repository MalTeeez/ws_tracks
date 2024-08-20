<script lang="ts">
	import { cubicOut } from 'svelte/easing';
	import { tweened } from 'svelte/motion';
	import { fade } from 'svelte/transition';
	import { round_to_x_decimals } from '../../../../common/lib/general_util';

	let {
		title,
		value,
		unit_single,
		unit_multi,
		inter_speed,
	}: {
		title: string;
		value: number;
		unit_single: string;
		unit_multi: string;
		inter_speed: number;
	} = $props();

	let prev_val: number = $state(-1);
	let interpolated_value = tweened(value, {
		duration: inter_speed,
		easing: cubicOut,
	});
	/**
	 * -1: went down, 0: stayed the same, 1: went up
	 * */
	let change_state: number = $state(0);

	// TODO: Add logic for strong increase, then display 2 chevrons

	$effect(() => {
		const rnd_value = round_to_x_decimals(value, 2);
		// Check how it changed compared to the last value
		if (prev_val != -1) {
			if (prev_val > rnd_value) {
				// went down
				change_state = -1;
			} else if (prev_val < rnd_value) {
				// went up
				change_state = 1;
			} else {
				// stayed the same
				change_state = 0;
			}
		}
		// And assign the evaluated current value as the last value
		prev_val = rnd_value;
	});
</script>

<div class="pointer-events-auto relative size-full pt-0.5 pb-1.5 pl-1 pr-2 border rounded-md border-dashed w-full hover:border-solid bg-[#ffffff22] hover:bg-[#ffffff55] interpolate-height">
	<div class="grouptext flex flex-col">
		<div id="title" class="overflow-hidden mr-4 pb-0.5 ">
			<h6 class="font-medium font-mono drop-shadow-lg leading-5">{title}</h6>
		</div>
		<!-- transition:fade={{ duration: 200 }} -->
		<div id="data" class="leading-3 whitespace-nowrap flex justify-between">
			<p class="pl-1 font-bold text-[14px] inline text-slate-50 drop-shadow-md">{$interpolated_value.toFixed(1)}</p>
			<p class="text-[11px] inline text-slate-200 font-bold drop-shadow-md">{value == 1 ? unit_single : unit_multi}</p>
		</div>
		<div class="absolute right-0.5 top-1 drop-shadow-md">
			<!-- transition:fade={{ duration: 200 }} -->
			{#if change_state == 1}
				<div>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						width="24"
						height="24"
						class="svg-chevron"
						style="fill: #ea580c;"
						><path
							d="M17,9.17a1,1,0,0,0-1.41,0L12,12.71,8.46,9.17a1,1,0,0,0-1.41,0,1,1,0,0,0,0,1.42l4.24,4.24a1,1,0,0,0,1.42,0L17,10.59A1,1,0,0,0,17,9.17Z"
						></path></svg
					>
				</div>
			{:else if change_state == -1}
				<div style="fill: #16a34a;">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						width="24"
						height="24"
						class="svg-chevron"
						><path
							d="M17,13.41,12.71,9.17a1,1,0,0,0-1.42,0L7.05,13.41a1,1,0,0,0,0,1.42,1,1,0,0,0,1.41,0L12,11.29l3.54,3.54a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29A1,1,0,0,0,17,13.41Z"
						></path></svg
					>
				</div>
			{:else if change_state == 0}
				<div style="fill: rgb(203 213 225);">
					<svg
						width="24"
						height="24"
						viewBox="0 0 1000 1000"
						xmlns="http://www.w3.org/2000/svg"
						><path
							d=" M 850 462C 850 462 850 538 850 538C 850 538 150 538 150 538C 150 538 150 462 150 462"
						/></svg
					>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.svg-chevron {
		display: inline-block;
		flex-shrink: 0;
		line-height: 0;
		vertical-align: middle;
	}

	.interpolate-height {
		transition: background-color 0.25s ease-out;
	}
</style>
