<script lang="ts">
    import Plane from '../../../../common/model/Plane.js';
    import type { Writable } from 'svelte/store';
	import Track from './Track.svelte';

	const {
		planes,
		inter_speed,
	}: {
		planes: Writable<Map<string, Plane>>;
		inter_speed: number;
	} = $props();
</script>

<div class="static">
	{#each $planes as [id, plane] (id)}
		<Track {plane} {inter_speed}>
			<p class="select-none">{id}</p>
		</Track>
	{/each}
</div>

<style>
</style>
