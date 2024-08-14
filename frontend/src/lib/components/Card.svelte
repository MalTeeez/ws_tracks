<script lang="ts">
	import type { Snippet } from 'svelte';

	let visible: boolean = true;
	const {
		title,
		children,
	}: {
		title: string;
		children: Snippet;
	} = $props();
</script>

<div class="relative">
	<button class="absolute top-2 right-2 z-30">
		<svg
			class="fill-slate-400 cursor-pointer pointer-events-auto"
			width="24"
			height="24"
			viewBox="0 0 1000 1000"
			xmlns="http://www.w3.org/2000/svg"
			><path
				d=" M 300 275C 306 275 313 277 318 282C 318 282 500 465 500 465C 500 465 682 282 682 282C 687 278 693 275 700 275C 710 274 719 281 723 290C 727 299 725 310 718 318C 718 318 535 500 535 500C 535 500 718 682 718 682C 724 689 727 698 724 707C 722 715 715 722 707 724C 698 727 689 724 682 718C 682 718 500 535 500 535C 500 535 318 718 318 718C 311 724 302 727 293 724C 285 722 278 715 276 707C 273 698 276 689 282 682C 282 682 465 500 465 500C 465 500 282 318 282 318C 275 311 273 300 277 290C 280 281 290 275 300 275C 300 275 300 275 300 275"
			/></svg
		>
	</button>
	<!-- right-0 -->
	<section 
		id="card"
		class="flex mx-auto left-0 top-0 min-w-52 max-w-60 min-h-[22.6rem] flex-col gap-2 py-6 px-8 drop-shadow-xl text-center backdrop-blur-lg backdrop-saturate-[1.1] backdrop-brightness-90"
	>
		<h1 class="mb-2 text-xl text-center font-bold select-none">{title}</h1>
		<div class="flex flex-col gap-4">
			{@render children()}
		</div>
	</section>
</div>

<style>
</style>
