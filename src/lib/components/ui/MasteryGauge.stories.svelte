<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import MasteryGauge from './MasteryGauge.svelte';

  const { Story } = defineMeta({
    title: 'UI/MasteryGauge',
    component: MasteryGauge,
    tags: ['autodocs'],
    parameters: {
      layout: 'centered',
      docs: {
        description: {
          component: 'A visual gauge showing vocabulary mastery level from 0-100% with 5 segments.'
        }
      }
    },
    argTypes: {
      mastery: {
        control: { type: 'range', min: 0, max: 100, step: 1 },
        description: 'Mastery percentage (0-100)'
      }
    },
    args: {
      mastery: 50
    }
  });
</script>

<!-- Empty (0%) -->
<Story name="Empty" args={{ mastery: 0 }} />

<!-- 20% Mastery -->
<Story name="Twenty Percent" args={{ mastery: 20 }} />

<!-- 40% Mastery -->
<Story name="Forty Percent" args={{ mastery: 40 }} />

<!-- 60% Mastery -->
<Story name="Sixty Percent" args={{ mastery: 60 }} />

<!-- 80% Mastery -->
<Story name="Eighty Percent" args={{ mastery: 80 }} />

<!-- Full Mastery (100%) -->
<Story name="Full Mastery" args={{ mastery: 100 }} />

<!-- All Levels Demo -->
<Story name="All Levels">
  {#snippet children(args)}
    <div style="display: flex; flex-direction: column; gap: 12px; padding: 16px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="width: 80px; font-size: 14px;">0%</span>
        <MasteryGauge mastery={0} />
      </div>
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="width: 80px; font-size: 14px;">20%</span>
        <MasteryGauge mastery={20} />
      </div>
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="width: 80px; font-size: 14px;">40%</span>
        <MasteryGauge mastery={40} />
      </div>
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="width: 80px; font-size: 14px;">60%</span>
        <MasteryGauge mastery={60} />
      </div>
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="width: 80px; font-size: 14px;">80%</span>
        <MasteryGauge mastery={80} />
      </div>
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="width: 80px; font-size: 14px;">100%</span>
        <MasteryGauge mastery={100} />
      </div>
    </div>
  {/snippet}
</Story>
