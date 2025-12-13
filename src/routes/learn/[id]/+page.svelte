<script lang="ts">
  import { appState } from '$lib/state/app-state';
  import type { VocabularyItem } from '$lib/types/vocabulary';
  import Flashcard from '$lib/components/Flashcard.svelte';
  let { data } = $props<{ data: { item: VocabularyItem | null } }>();
  let item = $derived<VocabularyItem | null>(data?.item ?? null);
  let error = $derived<string | null>(item ? null : (appState.languageMode === 'DE_BG' ? 'Eintrag nicht gefunden' : 'Записът не е намерен'));

  const dirArrow = $derived(appState.languageMode === 'DE_BG' ? '→' : '←');
</script>

<div class="learn-container">
  {#if error}
    <div class="state-block" role="alert"><p>{error}</p></div>
  {:else if item}
    <!-- Flip card primary learn UI -->
    <div class="learn-card">
      <Flashcard vocabularyItem={item} />
    </div>
    <header class="hero">
      <div class="hero__main">
        <h1 class="hero__title">{item.german}</h1>
        <div class="hero__arrow">{dirArrow}</div>
        <h2 class="hero__subtitle">{item.bulgarian}</h2>
      </div>
      <div class="hero__badges">
        {#if item.cefrLevel}<span class="badge badge--cefr">CEFR {item.cefrLevel}</span>{/if}
        <span class="badge badge--pos">{item.partOfSpeech}</span>
        {#if item.categories?.length}
          {#each item.categories.slice(0, 3) as cat}
            <span class="badge badge--cat">{cat}</span>
          {/each}
        {/if}
      </div>
    </header>

    <div class="content-grid">
      <!-- Left column: context & examples -->
      <section class="panel">
        <div class="panel__header">
          <h3>{appState.languageMode === 'DE_BG' ? 'Kontext & Beispiele' : 'Контекст и примери'}</h3>
        </div>
        {#if (item as any).exampleSentences?.length}
          <ul class="example-list">
            {#each (item as any).exampleSentences.slice(0,8) as ex}
              <li class="example-row">
                <span class="example-src">{ex.source ?? ex.de ?? ''}</span>
                <span class="example-arrow">{dirArrow}</span>
                <span class="example-tgt">{ex.target ?? ex.bg ?? ''}</span>
              </li>
            {/each}
          </ul>
        {:else}
          <p class="muted">{appState.languageMode === 'DE_BG' ? 'Noch keine Beispiele' : 'Все още няма примери'}</p>
        {/if}
      </section>

      <!-- Right column: properties & etymology -->
      <section class="panel">
        <div class="panel__header">
          <h3>{appState.languageMode === 'DE_BG' ? 'Formen & Eigenschaften' : 'Форми и свойства'}</h3>
        </div>
        <div class="property-grid">
          {#if (item as any).article}<div class="prop"><span class="prop__label">Artikel</span><span class="prop__value">{(item as any).article}</span></div>{/if}
          {#if (item as any).gender}<div class="prop"><span class="prop__label">Genus</span><span class="prop__value">{(item as any).gender}</span></div>{/if}
          {#if (item as any).declension}<div class="prop"><span class="prop__label">Deklination</span><span class="prop__value">{(item as any).declension}</span></div>{/if}
          {#if (item as any).conjugation}<div class="prop"><span class="prop__label">Konjugation</span><span class="prop__value">{(item as any).conjugation}</span></div>{/if}
        </div>
        <div class="panel__section">
          <h4>{appState.languageMode === 'DE_BG' ? 'Etymologie' : 'Етимология'}</h4>
          {#if (item as any).metadata?.etymology}
            <p class="etymology">{(item as any).metadata.etymology}</p>
          {:else}
            <p class="muted">{appState.languageMode === 'DE_BG' ? 'Keine Daten vorhanden' : 'Няма налични данни'}</p>
          {/if}
        </div>
        <div class="panel__section">
          <h4>{appState.languageMode === 'DE_BG' ? 'Verwandte Formen' : 'Свързани форми'}</h4>
          {#if (item as any).alternatives?.length}
            <ul class="tag-list">
              {#each (item as any).alternatives as alt}
                <li class="tag">{alt}</li>
              {/each}
            </ul>
          {:else}
            <p class="muted">{appState.languageMode === 'DE_BG' ? 'Keine Daten vorhanden' : 'Няма налични данни'}</p>
          {/if}
        </div>
      </section>
    </div>

    <!-- Actions -->
    <div class="actions">
      <a class="button" href="/practice" aria-label={appState.languageMode === 'DE_BG' ? 'Mit diesem Wort üben' : 'Упражнявай тази дума'}>
        {appState.languageMode === 'DE_BG' ? 'Üben' : 'Упражнения'}
      </a>
      <a class="button button--secondary" href="/vocabulary">{appState.languageMode === 'DE_BG' ? 'Zurück zum Wörterbuch' : 'Назад към речника'}</a>
    </div>
  {/if}
</div>

<style>
  .learn-container {
    max-width: var(--container-max-width);
    margin: 0 auto;
    padding: var(--space-7) var(--space-5) var(--space-7);
    color: var(--color-neutral-dark);
  }
  .learn-card { display: flex; justify-content: center; margin-bottom: var(--space-5); }
  .hero {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    margin-bottom: var(--space-6);
  }
  .hero__main { display: flex; align-items: baseline; gap: var(--space-3); }
  .hero__title { margin: 0; font-size: var(--text-3xl); font-weight: var(--font-extrabold); color: var(--color-neutral-dark); }
  .hero__subtitle { margin: 0; font-size: var(--text-2xl); color: var(--color-primary-darker); }
  .hero__arrow { color: var(--color-neutral-text); font-size: var(--text-xl); }
  .hero__badges { display: flex; flex-wrap: wrap; gap: var(--space-2); }
  .badge { padding: var(--space-1) var(--space-2); border-radius: 999px; font-size: var(--text-sm); border: 1px solid var(--color-neutral-border); }
  .badge--cefr { background: var(--color-warning-light); border-color: var(--color-warning); }
  .badge--pos { background: var(--color-primary-light); border-color: var(--color-primary); }
  .badge--cat { background: var(--color-secondary-light); }

  .content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-5); }
  .panel { border: 1px solid var(--color-neutral-border); border-radius: var(--border-radius-xl); background: var(--color-neutral-light); padding: var(--space-5); box-shadow: var(--shadow-card); }
  .panel__header h3 { margin: 0 0 var(--space-3) 0; font-size: var(--text-lg); }
  .panel__section { margin-top: var(--space-4); }

  .example-list { list-style: none; padding: 0; margin: 0; display: grid; gap: var(--space-2); }
  .example-row { display: grid; grid-template-columns: 1fr auto 1fr; gap: var(--space-2); }
  .example-arrow { color: var(--color-neutral-text); }

  .property-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: var(--space-3); }
  .prop { display: flex; justify-content: space-between; gap: var(--space-2); padding: var(--space-2); border: 1px dashed var(--color-neutral-border); border-radius: var(--border-radius-md); }
  .prop__label { color: var(--color-neutral-text); }
  .prop__value { color: var(--color-neutral-dark); font-weight: var(--font-semibold); }
  .etymology { color: var(--color-neutral-dark); }
  .tag-list { display: flex; flex-wrap: wrap; gap: var(--space-2); list-style: none; padding: 0; margin: 0; }
  .tag { padding: var(--space-1) var(--space-2); border-radius: 999px; background: var(--color-primary-light); color: var(--color-primary-darker); }

  .actions { display: flex; gap: var(--space-3); margin-top: var(--space-6); }
  .button { padding: var(--space-3) var(--space-4); border-radius: var(--border-radius-lg); background: var(--color-button-primary); color: #fff; text-decoration: none; font-weight: var(--font-semibold); }
  .button--secondary { background: var(--color-secondary-light); color: var(--color-neutral-dark); border: 1px solid var(--color-neutral-border); }

  .state-block { text-align: center; color: var(--color-neutral-text); }
  /* removed unused spinner styles */

  @media (max-width: var(--breakpoint-md)) {
    .content-grid { grid-template-columns: 1fr; }
    .hero { flex-direction: column; align-items: flex-start; }
  }
</style>
