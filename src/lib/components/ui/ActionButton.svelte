<script lang="ts">
  // import { APP_ICONS } from "$lib/constants/icons";

  // Svelte 5 runes props
  let {
    label = "",
    variant = "primary",
    size = "md",
    icon = "",
    disabled = false,
    type = "button",
    onclick,
    ...rest
  } = $props<{
    label?: string;
    variant?:
      | "primary"
      | "secondary"
      | "success"
      | "danger"
      | "practice"
      | "quick-practice"
      | "learn"
      | "text";
    size?: "sm" | "md" | "lg";
    icon?: string; // pass emoji from APP_ICONS or PRACTICE_ICONS
    disabled?: boolean;
    type?: "button" | "submit";
    onclick?: (event: MouseEvent) => void;
    [key: string]: any;
  }>();

  let classes = $derived.by(() => {
    const base =
      "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none select-none action-btn";

    const sizeMap: Record<string, string> = {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-5 text-base",
    };

    return [base, sizeMap[size], `variant-${variant}`].join(" ");
  });
</script>

<button {type} class={classes} {disabled} {onclick} {...rest}>
  {#if icon}
    <span aria-hidden="true" class="mr-2">{icon}</span>
  {/if}
  <span>{label}</span>
</button>

<style>
  button {
    -webkit-tap-highlight-color: transparent;
    font-family: var(--font-body);
  }

  .variant-primary {
    background-color: var(--accent);
    color: var(--bg-base);
  }
  .variant-primary:hover:not(:disabled) {
    opacity: 0.9;
  }

  .variant-secondary {
    background-color: var(--bg-elevated);
    color: var(--text-primary);
    border: 1px solid var(--border-subtle);
  }
  .variant-secondary:hover:not(:disabled) {
    background-color: var(--bg-surface);
  }

  .variant-success {
    background-color: #10b981;
    color: white;
  }
  .variant-success:hover:not(:disabled) {
    background-color: #059669;
  }

  .variant-danger {
    background-color: #ef4444;
    color: white;
  }
  .variant-danger:hover:not(:disabled) {
    background-color: #dc2626;
  }

  .variant-practice {
    background-color: var(--accent);
    color: var(--bg-base);
  }
  .variant-practice:hover:not(:disabled) {
    opacity: 0.9;
  }

  .variant-quick-practice {
    background-color: #f59e0b;
    color: white;
  }
  .variant-quick-practice:hover:not(:disabled) {
    background-color: #d97706;
  }

  .variant-learn {
    background-color: #8b5cf6;
    color: white;
  }
  .variant-learn:hover:not(:disabled) {
    background-color: #7c3aed;
  }
</style>
