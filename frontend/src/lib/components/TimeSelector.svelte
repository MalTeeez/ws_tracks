<script lang="ts">
	import {
		getInterval,
		Interval,
		msToString,
	} from '../../../../common/lib/time_util';
	import { closeWS } from '$lib/util/ws_util';
	import { fade } from 'svelte/transition';

	let expanded: boolean = false;
	export let sel_interval: number = getInterval(501);
	let prev_interval: number;
	let disabled: boolean = false;

	function expand() {
		expanded = expanded ? false : true;
	}
</script>

<div class="flex rounded-md bg-[#24282e] drop-shadow-xl pointer-events-auto">
	<button
		class="relative px-2 pr-4 inline-flex min-w-14 toolbar-button"
		title="Choose refresh time interval"
		tabindex="0"
		on:click={expand}
		><div class="button-pre-exp font-mono antialiased">
			{#if !disabled}
				{msToString(sel_interval, ' ')}
			{:else}
				Off
			{/if}
		</div>
		<div class="pl-1 justify-end">
			{#if !expanded}
				<div transition:fade={{ duration: 200 }}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						width="16"
						height="16"
						class="svg-chevron absolute"
						><path
							d="M17,9.17a1,1,0,0,0-1.41,0L12,12.71,8.46,9.17a1,1,0,0,0-1.41,0,1,1,0,0,0,0,1.42l4.24,4.24a1,1,0,0,0,1.42,0L17,10.59A1,1,0,0,0,17,9.17Z"
						></path></svg
					>
				</div>
			{:else}
				<div transition:fade={{ duration: 200 }}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						width="16"
						height="16"
						class="svg-chevron absolute"
						><path
							d="M17,13.41,12.71,9.17a1,1,0,0,0-1.42,0L7.05,13.41a1,1,0,0,0,0,1.42,1,1,0,0,0,1.41,0L12,11.29l3.54,3.54a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29A1,1,0,0,0,17,13.41Z"
						></path></svg
					>
				</div>
			{/if}
		</div>
	</button>
</div>

<div class="pointer-events-auto">
	{#if expanded}
		<div
			transition:fade={{ duration: 200 }}
			tabindex="-1"
			class="absolute"
			style="z-index: 45; transform: translate(3px, 0px); will-change: transform;"
		>
			<span data-focus-scope-start="true"></span>
			<div tabindex="-1" class="menu-container" role="menu">
				{#if disabled}
					<button
						class="menu-item font-mono font-semibold text-neutral-300 antialiased bg-neutral-500 hover:bg-neutral-600"
						title="Turn off auto refresh"
						tabindex="-1"
						on:click={() => {
							disabled = false;
							expanded = false;
							let prev_interval = sel_interval;
							sel_interval = -1;
							sel_interval = prev_interval;
						}}
						><div class="text-wrap-flow">
							<span class="text-wrap">Off</span>
						</div></button
					>
				{:else}
					<button
						class="menu-item font-mono font-semibold text-neutral-300 antialiased hover:bg-neutral-500"
						title="Turn off auto refresh"
						tabindex="-1"
						on:click={() => {
							closeWS();
							disabled = true;
							expanded = false;
						}}
						><div class="text-wrap-flow">
							<span class="text-wrap">Off</span>
						</div></button
					>
				{/if}
				{#each Interval as value}
					{#if value == sel_interval && !disabled}
						<button
							class="menu-item font-mono font-semibold text-neutral-300 antialiased bg-neutral-500 hover:bg-neutral-600"
							title={String(value) + ' milliseconds'}
							tabindex="-1"
							on:click={() => {
								if (disabled) {
									sel_interval = -1;
								}
								sel_interval = value;
								expanded = false;
								disabled = false;
							}}
							><div class="text-wrap-flow">
								<span class="text-wrap">{msToString(value)}</span>
							</div></button
						>
					{:else}
						<button
							class="menu-item font-mono font-semibold text-neutral-300 antialiased hover:bg-neutral-500"
							title={String(value) + ' milliseconds'}
							tabindex="-1"
							on:click={() => {
								if (disabled) {
									sel_interval = -1;
								}
								sel_interval = value;
								expanded = false;
								disabled = false;
							}}
							><div class="text-wrap-flow">
								<span class="text-wrap">{msToString(value)}</span>
							</div></button
						>
					{/if}
				{/each}
			</div>
			<span data-focus-scope-end="true"></span>
		</div>
	{/if}
</div>

<style>
	.menu-item {
		cursor: pointer;
		white-space: nowrap;
		display: flex;
		flex-direction: column;
		-moz-box-align: stretch;
		align-items: stretch;
		padding: 4px 16px;
		min-height: 32px;
		margin: 0px;
		border: medium;
		width: 100%;
		position: relative;
	}

	.text-wrap {
		display: flex;
		flex-direction: row;
		-moz-box-align: center;
		align-items: center;
		-moz-box-pack: start;
		justify-content: flex-start;
		gap: 8px;
	}

	.text-wrap-flow {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.menu-container {
		background: #181b1f;
		box-shadow: rgb(1, 4, 9) 0px 8px 24px;
		display: inline-block;
		border-radius: 2px;
		padding: 4px 0px;
	}

	.toolbar-button {
		position: relative;
		display: flex;
		-moz-box-align: center;
		align-items: center;
		height: 32px;
		border-radius: 2px;
		line-height: 30px;
		font-weight: 500;
		white-space: nowrap;
		transition:
			background 250ms cubic-bezier(0.4, 0, 0.2, 1),
			box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1),
			border-color 250ms cubic-bezier(0.4, 0, 0.2, 1),
			color 250ms cubic-bezier(0.4, 0, 0.2, 1);
		color: rgba(204, 204, 220, 0.65);
		background: transparent;
		border: 1px solid transparent;
	}

	.button-pre-exp {
		-moz-box-flex: 1;
		flex-grow: 1;
		padding-right: 4px;
	}

	.svg-chevron {
		display: inline-block;
		fill: currentcolor;
		flex-shrink: 0;
		line-height: 0;
		vertical-align: middle;
		transform: translate(-5px, -6.5px);
	}
</style>
