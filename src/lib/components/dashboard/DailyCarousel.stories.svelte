<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { fn } from 'storybook/test';
  import DailyCarousel from './DailyCarousel.svelte';

  const { Story } = defineMeta({
    title: 'Dashboard/DailyCarousel',
    component: DailyCarousel,
    tags: ['autodocs'],
    parameters: {
      layout: 'fullscreen',
      docs: {
        description: {
          component: 'A Tinder-style card stack for daily vocabulary practice. Swipe right to mark as known, left to practice more.'
        }
      }
    },
    args: {
      onComplete: fn()
    }
  });
</script>

<!-- Default State -->
<Story name="Default">
  {#snippet children(args)}
    <div style="height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
      <DailyCarousel {...args} />
    </div>
  {/snippet}
</Story>

<!-- With Documentation -->
<Story 
  name="Interactive Demo"
  parameters={{
    docs: {
      description: {
        story: 'Interactive demo of the Daily 10 carousel. Swipe cards left or right, or tap to flip and see translations.'
      }
    }
  }}
>
  {#snippet children(args)}
    <div style="height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
      <DailyCarousel {...args} />
    </div>
  {/snippet}
</Story>
