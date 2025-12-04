<script lang="ts">
  import { type SVGAttributes } from 'svelte/elements';

  // Define props using Svelte 5 Runes syntax
  let {
    size = 24,
    color = 'currentColor',
    strokeWidth = 2,
    class: className = '',
    ...rest
  } = $props();

  // Icon node data for X icon
  const iconNode = [
    ["line", { x1: "18", y1: "6", x2: "6", y2: "18" }],
    ["line", { x1: "6", y1: "6", x2: "18", y2: "18" }]
  ];
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke={color}
  stroke-width={strokeWidth}
  stroke-linecap="round"
  stroke-linejoin="round"
  class={`lucide-icon lucide-x ${className}`}
  {...rest}
>
  {#each iconNode as [tag, attrs]}
    <svelte:element this={tag} {...attrs} />
  {/each}
</svg>