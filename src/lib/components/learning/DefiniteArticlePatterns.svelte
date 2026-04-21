<script lang="ts">
  /**
   * DefiniteArticlePatterns - Bulgarian Definite Article Visualization
   *
   * Bulgarian uniquely uses definite article SUFFIXES instead of separate words.
   * This is a key feature that distinguishes Bulgarian from other Slavic languages
   * and German.
   *
   * Patterns:
   * - Masculine: -ът/-я (subject), -а/-я (object)
   * - Feminine: -та
   * - Neuter: -то
   * - Plural: -те
   */

  interface Props {
    gender: string;
    bulgarianWord: string;
  }

  let { gender, bulgarianWord }: Props = $props();

  // Get the base form (without definite article if present)
  const baseForm = $derived(bulgarianWord
    .replace(/ът$|я$|а$/, '')  // masculine endings
    .replace(/та$/, '')        // feminine
    .replace(/то$/, '')        // neuter
    .replace(/те$/, '')        // plural
  );

  const patterns = $derived.by(() => {
    switch (gender) {
      case 'masculine':
        return {
          label: 'Masculine Definite Article',
          bulgarianLabel: 'Мъжки определителен член',
          rules: [
            {
              suffix: '-ът/-ят',
              example: `${baseForm}ът`,
              usage: 'Subject form (who/what)',
              bulgarianUsage: 'Кой? Какво? (подлог)'
            },
            {
              suffix: '-а/-я',
              example: `${baseForm}а`,
              usage: 'Object form (whom/what)',
              bulgarianUsage: 'Кого? Какво? (допълнение)'
            }
          ]
        };
      case 'feminine':
        return {
          label: 'Feminine Definite Article',
          bulgarianLabel: 'Женски определителен член',
          rules: [
            {
              suffix: '-та',
              example: `${baseForm}та`,
              usage: 'All cases',
              bulgarianUsage: 'За всички падежи'
            }
          ]
        };
      case 'neuter':
        return {
          label: 'Neuter Definite Article',
          bulgarianLabel: 'Среден определителен член',
          rules: [
            {
              suffix: '-то',
              example: `${baseForm}то`,
              usage: 'All cases',
              bulgarianUsage: 'За всички падежи'
            }
          ]
        };
      default:
        return null;
    }
  });

  const pluralPattern = $derived({
    suffix: '-те',
    example: `${baseForm}те`,
    usage: 'Plural definite (all genders)',
    bulgarianUsage: 'Множествено число (всички родове)'
  });
</script>

{#if patterns}
  <div class="definite-article-patterns">
    <div class="patterns-header">
      <h5>{patterns.label}</h5>
      <span class="bulgarian-label">{patterns.bulgarianLabel}</span>
    </div>

    <div class="rules-grid">
      {#each patterns.rules as rule}
        <div class="rule-card">
          <div class="suffix-badge">{rule.suffix}</div>
          <div class="example">{rule.example}</div>
          <div class="usage">
            <span class="usage-en">{rule.usage}</span>
            <span class="usage-bg">{rule.bulgarianUsage}</span>
          </div>
        </div>
      {/each}
    </div>

    <!-- Plural (all genders) -->
    <div class="plural-section">
      <div class="rule-card plural-card">
        <div class="suffix-badge">{pluralPattern.suffix}</div>
        <div class="example">{pluralPattern.example}</div>
        <div class="usage">
          <span class="usage-en">{pluralPattern.usage}</span>
          <span class="usage-bg">{pluralPattern.bulgarianUsage}</span>
        </div>
      </div>
    </div>

    <div class="comparison-note">
      <span class="note-icon">💡</span>
      <p>Unlike German (der/die/das), Bulgarian attaches the definite article as a suffix to the noun!</p>
    </div>
  </div>
{/if}

<style>
  .definite-article-patterns {
    margin-top: var(--space-3);
    padding: var(--space-3);
    background: linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-elevated) 100%);
    border-radius: var(--radius-md);
    border: 1px solid var(--warning);
  }

  .patterns-header {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    margin-bottom: var(--space-3);
  }

  .patterns-header h5 {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--warning);
  }

  .bulgarian-label {
    font-size: 0.75rem;
    color: var(--text-secondary);
    font-style: italic;
  }

  .rules-grid {
    display: grid;
    gap: var(--space-2);
    margin-bottom: var(--space-2);
  }

  .rule-card {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: var(--space-2);
    padding: var(--space-2);
    background: var(--bg-card);
    border-radius: var(--radius-sm);
    align-items: center;
  }

  .suffix-badge {
    grid-row: 1 / 3;
    padding: var(--space-1) var(--space-2);
    background-color: var(--warning);
    color: var(--bg-base);
    font-weight: 700;
    font-size: 0.875rem;
    border-radius: var(--radius-sm);
    white-space: nowrap;
  }

  .example {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    font-family: var(--font-body);
  }

  .usage {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .usage-en {
    font-size: 0.75rem;
    color: var(--text-secondary);
  }

  .usage-bg {
    font-size: 0.75rem;
    color: var(--warning);
    font-style: italic;
  }

  .plural-section {
    border-top: 1px dashed var(--warning);
    padding-top: var(--space-2);
    margin-top: var(--space-2);
  }

  .plural-card {
    background-color: var(--bg-surface);
    border: 1px solid var(--warning);
  }

  .comparison-note {
    display: flex;
    gap: var(--space-2);
    align-items: flex-start;
    margin-top: var(--space-3);
    padding: var(--space-2);
    background-color: var(--bg-card);
    border-radius: var(--radius-sm);
    font-size: 0.75rem;
  }

  .note-icon {
    font-size: 1rem;
  }

  .comparison-note p {
    margin: 0;
    color: var(--warning);
    line-height: 1.4;
  }

  @media (max-width: 640px) {
    .rule-card {
      grid-template-columns: 1fr;
    }

    .suffix-badge {
      grid-row: auto;
      justify-self: start;
    }
  }
</style>
