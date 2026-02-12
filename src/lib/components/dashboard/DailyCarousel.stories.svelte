<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { fn } from 'storybook/test';
  import DailyCarousel from './DailyCarousel.svelte';

  const { Story } = defineMeta({
    title: 'Dashboard/DailyCarousel',
    component: DailyCarousel,
    tags: ['autodocs'],
    parameters: {
      layout: 'fullscreen'
    },
    args: {
      onComplete: fn()
    }
  });
</script>

<Story name="Default" />

<Story name="Interactive Demo" />
