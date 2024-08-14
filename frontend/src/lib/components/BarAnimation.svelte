<script lang="ts">
	import { msToCSS } from "../../../../common/lib/time_util";

    const {
		inter_speed,
	}: {
		inter_speed: number;
	} = $props();
</script>

<div style="animation-duration: {msToCSS(inter_speed)}" class="bar-outer absolute rounded">
	<div style="animation-duration: {msToCSS(inter_speed)}" class="bar-inner rounded-lg"></div>
</div>

<style>
	.bar-inner {
        width: 70%;
        height: 100%;
        animation-iteration-count: infinite;
		animation-timing-function: linear;
		animation-name: color;
         /*background: linear-gradient(0deg, rgba(255,0,0,1) 50%, rgba(0,212,255,1) 50%);*/
	}

	.bar-outer {
		position: absolute;
		width: 0.5rem;
		height: 26rem;
        animation-iteration-count: infinite;
		animation-timing-function: linear;
		animation-name: slide;
		/* top: 26rem; */
		/* left: -2rem; */
        top: 0rem;
        left: 12.5rem;
	}

	@keyframes slide {
		from {
			transform: translate(1.5rem, -12.75rem) rotate(45deg);
		}
		to {   /*                                               */
			transform: translate(-13rem, -36.15rem) rotate(45deg);
		}
	}

    @keyframes color {
        from {
            background-color: rgb(231, 255, 14);
		}
		to {
            background-color: rgb(255, 218, 8);
		}
		
	}

</style>
