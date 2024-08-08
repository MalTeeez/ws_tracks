<script lang="ts">
	import { getInterval, Interval, msToString } from '$lib/util/time_util';
	import { fade } from 'svelte/transition';

	let expanded: boolean = false;
	let sel_interval: number = getInterval(501);

	/*
    			<!-- <button
				class="menu-item"
				role="menuitemradio"
				data-role="menuitem"
				aria-label="Turn off auto refresh"
				aria-checked="false"
				tabindex="-1"
				><div class="text-wrap">
					<span class="text-wrap">Off</span>
					<div class="css-84nudp"></div>
				</div></button
			> -->
            */

	function expand() {
		expanded = expanded ? false : true;
	}

</script>

<div class="self-end">
	<div class="relative inline-flex">
		<button
			class="toolbar-button"
			title="Choose refresh time interval"
			tabindex="0"
			on:click={expand}
			><div class="button-pre-exp">{msToString(sel_interval, " ")}</div>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				width="16"
				height="16"
				class="svg-chevron"
				><path
					d="M17,9.17a1,1,0,0,0-1.41,0L12,12.71,8.46,9.17a1,1,0,0,0-1.41,0,1,1,0,0,0,0,1.42l4.24,4.24a1,1,0,0,0,1.42,0L17,10.59A1,1,0,0,0,17,9.17Z"
				></path></svg
			></button
		>
	</div>
	{#if expanded}
		<div transition:fade={{ duration: 200 }}
			tabindex="-1"
			class="fixed"
			style="z-index: 1111; transform: translate(-7px, 0px); will-change: transform;"
		>
			<span data-focus-scope-start="true"></span>
			<div tabindex="-1" class="menu-container" role="menu">
				{#each Interval as value}
					<button
						class="menu-item"
						title={String(value) + ' milliseconds'}
						tabindex="-1" 
						on:click={() => {sel_interval=value}}
						><div class="text-wrap">
							<span class="text-wrap">{msToString(value)}</span>
						</div></button
					>
				{/each}
			</div>
			<span data-focus-scope-end="true"></span>
		</div>
	{/if}
</div>

<style>
	.menu-item {
		background: none;
		cursor: pointer;
		white-space: nowrap;
		color: rgb(204, 204, 220);
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

	.text-wrap {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.menu-container {
		background: rgb(24, 27, 31);
		box-shadow: rgb(1, 4, 9) 0px 8px 24px;
		display: inline-block;
		border-radius: 2px;
		padding: 4px 0px;
	}

	.menu-container:hover {
		background: rgb(171, 173, 176);
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
		padding: 0px 8px;
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
	}
</style>
