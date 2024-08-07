<script lang="ts">
    import Plane from '../../../../common/model/Plane.js';
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
		<Track {plane}>
			{id}
		</Track>
	{/each}
</div>

<style>
</style>
