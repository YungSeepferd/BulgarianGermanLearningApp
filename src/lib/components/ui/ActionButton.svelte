<script lang="ts">
  import { APP_ICONS } from "$lib/constants/icons";

  // Svelte 5 runes props
  let {
    label = "",
    variant = "primary",
    size = "md",
    icon = "",
    disabled = false,
    type = "button",
  } = $props<{
    label?: string;
    variant?:
      | "primary"
      | "secondary"
      | "success"
      | "danger"
      | "practice"
      | "quick-practice"
      | "learn";
    size?: "sm" | "md" | "lg";
    icon?: string; // pass emoji from APP_ICONS or PRACTICE_ICONS
    disabled?: boolean;
    type?: "button" | "submit";
  }>();

  let classes = $derived(() => {
    const base =
      "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none select-none";

    const sizeMap: Record<string, string> = {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-5 text-base",
    };

    const variantMap: Record<string, string> = {
      primary:
        "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500",
      secondary:
        "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-400",
      success:
        "bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-500",
      danger:
        "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500",
      practice:
        "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500",
      "quick-practice":
        "bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500",
      learn:
        "bg-violet-500 text-white hover:bg-violet-600 focus:ring-violet-500",
    };

    return [base, sizeMap[size], variantMap[variant]].join(" ");
  });
</script>

<button {type} class={classes} {disabled}>
  {#if icon}
    <span aria-hidden="true" class="mr-2">{icon}</span>
  {/if}
  <span>{label}</span>
</button>

<style>
  /* No additional styles; relies on Tailwind classes in project */
  button { -webkit-tap-highlight-color: transparent; }
</style>
