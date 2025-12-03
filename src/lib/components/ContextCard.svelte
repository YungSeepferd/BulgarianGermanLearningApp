 <script lang="ts">
import { spring } from 'svelte/motion';
import { getGameState } from '$lib/game.svelte';
const gameState = getGameState();

let flipped = $state(false);
let xRay = $state(false);
let isPressing = $state(false);

const rotation = spring(0, {
	stiffness: 0.1,
	damping: 0.2
});

import { browser } from '$app/environment';

$effect.pre(() => {
	if (browser && isPressing) {
		const timer = setTimeout(() => {
			xRay = true;
		}, 500);

		return () => {
			clearTimeout(timer);
		};
	}
	return () => {};
});

	function flip() {
		if (xRay) return;
		flipped = !flipped;
		rotation.set(flipped ? 180 : 0);
	}

	function handlePressStart() {
		isPressing = true;
	}

	function handlePressEnd() {
		isPressing = false;
		xRay = false;
	}
</script>

 <button
class="relative h-96 w-64 select-none rounded-2xl border border-white/20 bg-white/10 p-6 shadow-lg backdrop-blur-lg"
style="transform-style: preserve-3d; transition: transform 0.5s;"
onclick={flip}
onmousedown={handlePressStart}
onmouseup={handlePressEnd}
onmouseleave={handlePressEnd}
aria-label={"Card: " + (gameState.currentCard ? gameState.currentCard.bulgarian_text : "language card")}
tabindex="0"
role="button"
>
<!-- X-Ray Mode -->
{#if xRay && gameState.currentCard}
	<div
		class="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-black/50 p-4 backdrop-blur-2xl"
	>
		{#each gameState.currentCard.literal_breakdown as segment}
			<div class="my-2 text-center">
				<p class="text-xl font-bold text-white">{segment.segment}</p>
				<p class="text-md text-white/80">{segment.literal} ({segment.grammar_tag})</p>
			</div>
		{/each}
	</div>
{/if}

<!-- Front of the Card -->
{#if gameState.currentCard}
<div
	class="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-white/10 p-6 text-center"
	style="backface-visibility: hidden; transform: rotateY({$rotation}deg);"
>
	<div class="text-6xl">{gameState.currentCard.emoji_anchor}</div>
	<h2 class="mt-4 text-3xl font-bold text-white">{gameState.currentCard.bulgarian_text}</h2>
	<p class="mt-2 text-lg text-white/70">{gameState.currentCard.transliteration}</p>
</div>

<!-- Back of the Card -->
<div
	class="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-white/10 p-6 text-center"
	style="backface-visibility: hidden; transform: rotateY({$rotation + 180}deg);"
>
	<h3 class="text-2xl font-bold text-white">{gameState.currentCard.german_meaning}</h3>
	<p class="mt-4 text-base text-white/80">{gameState.currentCard.context_note}</p>
</div>
{/if}
</button>

<style>
	.backdrop-blur-lg {
		backdrop-filter: blur(20px);
	}
	.select-none {
		user-select: none;
	}
</style>