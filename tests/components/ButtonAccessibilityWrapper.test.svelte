<script lang="ts">
  import Button from '$lib/components/ui/button/button.svelte';
  import { type VariantProps } from "tailwind-variants";
  import type { Button as ButtonPrimitive } from "bits-ui";

  type $$Props = ButtonPrimitive.RootProps &
    VariantProps<typeof import('$lib/components/ui/button').buttonVariants> & {
      text?: string;
      'aria-label'?: string;
      'aria-describedby'?: string;
    };

  let {
    variant,
    size,
    class: className,
    disabled,
    text = 'Button',
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedby,
    ...rest
  } = $props();
</script>

<Button
  {variant}
  {size}
  class={className}
  {disabled}
  aria-label={ariaLabel}
  aria-describedby={ariaDescribedby}
  {...rest}
>
  {text}
</Button>