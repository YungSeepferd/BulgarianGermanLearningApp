<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import EnrichmentBadge from './EnrichmentBadge.svelte';

  const { Story } = defineMeta({
    title: 'Vocabulary/EnrichmentBadge',
    component: EnrichmentBadge,
    tags: ['autodocs'],
    parameters: {
      layout: 'centered',
      docs: {
        description: {
          component: 'Badge displaying enrichment status and metadata for vocabulary items.'
        }
      }
    },
    argTypes: {
      type: {
        control: 'select',
        options: ['enriched', 'partial', 'basic'],
        description: 'Enrichment level'
      },
      size: {
        control: 'select',
        options: ['sm', 'md', 'lg'],
        description: 'Badge size'
      }
    }
  });
</script>

<!-- Enriched Badge -->
<Story name="Enriched" args={{ type: 'enriched' }} />

<!-- Partial Enrichment -->
<Story name="Partial" args={{ type: 'partial' }} />

<!-- Basic/Badge -->
<Story name="Basic" args={{ type: 'basic' }} />

<!-- Small Size -->
<Story name="Small" args={{ type: 'enriched', size: 'sm' }} />

<!-- Large Size -->
<Story name="Large" args={{ type: 'enriched', size: 'lg' }} />
