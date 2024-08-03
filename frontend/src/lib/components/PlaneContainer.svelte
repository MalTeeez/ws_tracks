<script lang="ts">
	import { Plane } from '$lib/stores/trackStore';
	import type { Writable } from 'svelte/store';
	import Track from './Track.svelte';

	const {
        planes,
	}: {
        planes: Writable<Map<number, Plane>>;
	} = $props();
</script>

<div class="static">
    {#each $planes as [id, plane]}
        <Track x={plane.x} y={plane.y}>
            {id}
        </Track>
    {/each}
</div>

<style>

</style>