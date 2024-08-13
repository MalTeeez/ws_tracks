<script lang="ts">
	import { msToCSS } from "../../../../common/lib/time_util";

    const {
		inter_speed,
	}: {
		inter_speed: number;
	} = $props();
</script>

<div style="animation-duration: {msToCSS(inter_speed)}" class="sun absolute rounded">
	<div style="animation-duration: {msToCSS(inter_speed)}" class="dot rounded-lg"></div>
</div>

<style>
	.dot {
        width: 70%;
        height: 100%;
        animation-iteration-count: infinite;
		animation-timing-function: linear;
		animation-name: color;
         /*background: linear-gradient(0deg, rgba(255,0,0,1) 50%, rgba(0,212,255,1) 50%);*/
	}

	.sun {
		position: absolute;
		width: 0.5rem;
		height: 26rem;
        animation-iteration-count: infinite;
		animation-timing-function: cubic-bezier(0.445, 0.05, 0.55, 0.95);
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
            background-color: rgb(3, 30, 88);
		}
		to {
            background-color: rgb(13, 239, 247);
		}
		
	}

</style>
