<script lang="ts">
  /**
   * DevToolsPanel - In-browser log inspector for development
   *
   * A slide-in panel that surfaces LoggerService entries with filtering,
   * search, and export. Only renders in dev mode (import.meta.env.DEV).
   *
   * Uses a capped visible window (MAX_VISIBLE) for render performance
   * while the underlying ring buffer holds up to 500 entries.
   */

  import { logger, type LogLevel } from '$lib/services/logger';

  // ── Constants ─────────────────────────────────────────────────────
  const MAX_VISIBLE = 150;

  const LEVEL_ICON: Record<LogLevel, string> = {
    error: '\u{1F534}',
    warn: '\u{1F7E1}',
    info: '\u{1F535}',
    debug: '\u26AA',
  };

  const LEVEL_ORDER: LogLevel[] = ['debug', 'info', 'warn', 'error'];

  /** Deterministic hue from context string for badge colouring */
  function contextHue(ctx: string): number {
    let hash = 0;
    for (let i = 0; i < ctx.length; i++) {
      hash = ctx.charCodeAt(i) + ((hash << 5) - hash);
    }
    return ((hash % 360) + 360) % 360;
  }

  function formatTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-GB', { hour12: false });
  }

  /** Safe JSON stringify that handles circular references */
  function safeStringify(data: unknown): string {
    const seen = new WeakSet();
    try {
      return JSON.stringify(data, (_key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) return '[Circular]';
          seen.add(value);
        }
        return value;
      }, 2);
    } catch {
      return String(data);
    }
  }

  // ── State ─────────────────────────────────────────────────────────

  let isOpen = $state(false);
  let expandedIds = $state(new Set<string>());

  /** Active level filters – all enabled by default */
  let activeLevels = $state<Set<LogLevel>>(new Set(LEVEL_ORDER));

  /** Free-text context filter */
  let contextFilter = $state('');

  /** Revision counter bumped by logger subscription to trigger re-derive */
  let revision = $state(0);

  // Subscribe to logger changes and bump revision
  $effect(() => {
    const unsub = logger.subscribe(() => {
      revision++;
    });
    return unsub;
  });

  // ── Derived data ──────────────────────────────────────────────────

  const stats = $derived.by(() => {
    // Touch revision so Svelte tracks the dependency
    void revision;
    return logger.getStats();
  });

  const filteredEntries = $derived.by(() => {
    void revision;
    const all = logger.getEntries();
    const needle = contextFilter.trim().toLowerCase();

    const filtered = all.filter((e) => {
      if (!activeLevels.has(e.level)) return false;
      if (needle && !e.context.toLowerCase().includes(needle)) return false;
      return true;
    });

    // Newest first, capped for render performance
    return [...filtered].reverse().slice(0, MAX_VISIBLE);
  });

  const errorCount = $derived(stats.error);

  // ── Handlers ──────────────────────────────────────────────────────

  function toggle() {
    isOpen = !isOpen;
  }

  function close() {
    isOpen = false;
  }

  function toggleLevel(level: LogLevel) {
    const next = new Set(activeLevels);
    if (next.has(level)) {
      next.delete(level);
    } else {
      next.add(level);
    }
    activeLevels = next;
  }

  function toggleExpand(id: string) {
    const next = new Set(expandedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    expandedIds = next;
  }

  function handleClear() {
    logger.clear();
    expandedIds = new Set();
  }

  function handleExport() {
    logger.downloadLogs();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && isOpen) {
      close();
    }
  }

  // Register global keyboard listener for Escape
  $effect(() => {
    if (typeof window === 'undefined') return;
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });
</script>

<!-- Only render anything in dev mode -->
{#if import.meta.env.DEV}

<!-- ── Floating trigger button ──────────────────────────────────── -->
<button
  class="devtools-trigger"
  onclick={toggle}
  aria-label="Toggle developer tools panel"
  title="DevTools"
>
  <span class="devtools-trigger__icon">&#x1F41B;</span>
  {#if errorCount > 0}
    <span class="devtools-trigger__badge">{errorCount > 99 ? '99+' : errorCount}</span>
  {/if}
</button>

<!-- ── Backdrop (click to close) ────────────────────────────────── -->
{#if isOpen}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="devtools-backdrop"
    class:devtools-backdrop--visible={isOpen}
    onclick={close}
    role="presentation"
  ></div>
{/if}

<!-- ── Panel ────────────────────────────────────────────────────── -->
<aside
  class="devtools-panel"
  class:devtools-panel--open={isOpen}
  aria-hidden={!isOpen}
  aria-label="Developer tools log panel"
>
  <!-- Header -->
  <header class="devtools-header">
    <div class="flex items-center gap-2">
      <span class="devtools-header__title">DevTools</span>
      {#if stats.total > 0}
        <span class="devtools-header__count">{stats.total}</span>
      {/if}
    </div>
    <button
      class="devtools-close"
      onclick={close}
      aria-label="Close developer tools"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
  </header>

  <!-- Filter bar -->
  <div class="devtools-filters">
    <div class="devtools-filters__levels">
      {#each LEVEL_ORDER as level}
        <button
          class="devtools-level-btn"
          class:devtools-level-btn--active={activeLevels.has(level)}
          class:devtools-level-btn--error={level === 'error'}
          class:devtools-level-btn--warn={level === 'warn'}
          class:devtools-level-btn--info={level === 'info'}
          class:devtools-level-btn--debug={level === 'debug'}
          onclick={() => toggleLevel(level)}
          aria-pressed={activeLevels.has(level)}
          title="Toggle {level} logs"
        >
          <span class="devtools-level-btn__icon">{LEVEL_ICON[level]}</span>
          <span class="devtools-level-btn__label">{level}</span>
        </button>
      {/each}
    </div>
    <input
      type="text"
      class="devtools-search"
      placeholder="Filter by context..."
      bind:value={contextFilter}
      aria-label="Filter logs by context"
    />
  </div>

  <!-- Stats bar -->
  <div class="devtools-stats">
    <span class="devtools-stat devtools-stat--error">{LEVEL_ICON.error} {stats.error}</span>
    <span class="devtools-stat devtools-stat--warn">{LEVEL_ICON.warn} {stats.warn}</span>
    <span class="devtools-stat devtools-stat--info">{LEVEL_ICON.info} {stats.info}</span>
    <span class="devtools-stat devtools-stat--debug">{LEVEL_ICON.debug} {stats.debug}</span>
    <span class="devtools-stat__separator"></span>
    <span class="devtools-stat devtools-stat--total">Showing {filteredEntries.length} / {stats.total}</span>
  </div>

  <!-- Log list -->
  <div class="devtools-logs" role="log" aria-live="off">
    {#if filteredEntries.length === 0}
      <div class="devtools-empty">
        <span class="devtools-empty__icon">&#x1F4ED;</span>
        <span class="devtools-empty__text">
          {stats.total === 0 ? 'No log entries yet' : 'No entries match current filters'}
        </span>
      </div>
    {:else}
      {#each filteredEntries as entry (entry.id)}
        {@const expanded = expandedIds.has(entry.id)}
        {@const hasExtra = !!entry.error?.stack || !!entry.data}
        <button
          class="devtools-entry"
          class:devtools-entry--error={entry.level === 'error'}
          class:devtools-entry--warn={entry.level === 'warn'}
          class:devtools-entry--expanded={expanded}
          onclick={() => { if (hasExtra) toggleExpand(entry.id); }}
          aria-expanded={hasExtra ? expanded : undefined}
          type="button"
        >
          <!-- Main row -->
          <div class="devtools-entry__row">
            <span class="devtools-entry__time">{formatTime(entry.timestamp)}</span>
            <span class="devtools-entry__level">{LEVEL_ICON[entry.level]}</span>
            <span
              class="devtools-entry__context"
              style="--ctx-hue: {contextHue(entry.context)}"
            >{entry.context}</span>
            <span class="devtools-entry__msg" class:devtools-entry__msg--truncated={!expanded && entry.message.length > 80}>
              {expanded ? entry.message : (entry.message.length > 80 ? entry.message.slice(0, 80) + '\u2026' : entry.message)}
            </span>
            {#if hasExtra}
              <span class="devtools-entry__chevron" class:devtools-entry__chevron--open={expanded}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M4 5l2 2 2-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            {/if}
          </div>

          <!-- Expanded detail -->
          {#if expanded}
            <div class="devtools-entry__detail">
              {#if entry.error}
                <div class="devtools-entry__stack-header">
                  <span class="devtools-entry__error-name">{entry.error.name}</span>
                  <span class="devtools-entry__error-msg">{entry.error.message}</span>
                </div>
                {#if entry.error.stack}
                  <pre class="devtools-entry__stack">{entry.error.stack}</pre>
                {/if}
              {/if}
              {#if entry.data !== undefined}
                <pre class="devtools-entry__data">{safeStringify(entry.data)}</pre>
              {/if}
            </div>
          {/if}
        </button>
      {/each}
    {/if}
  </div>

  <!-- Footer -->
  <footer class="devtools-footer">
    <button class="devtools-footer__btn devtools-footer__btn--export" onclick={handleExport}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" class="mr-1.5">
        <path d="M7 1v8M3.5 5.5L7 9l3.5-3.5M2 12h10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Export
    </button>
    <button class="devtools-footer__btn devtools-footer__btn--clear" onclick={handleClear}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" class="mr-1.5">
        <path d="M2.5 4h9M5.5 4V2.5h3V4M3.5 4v7.5h7V4M5.75 6.5v3M8.25 6.5v3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Clear
    </button>
  </footer>
</aside>

{/if}

<style>
  /* ================================================================
     Design Tokens (scoped)
     ================================================================ */
  :root {
    --dt-bg: #0c0e14;
    --dt-bg-elevated: #12151e;
    --dt-bg-hover: #1a1e2b;
    --dt-bg-active: #222839;
    --dt-border: #1e2330;
    --dt-border-subtle: #161a25;
    --dt-text: #c8cdd8;
    --dt-text-muted: #6b7394;
    --dt-text-bright: #e8ecf4;
    --dt-accent: #6c8cff;
    --dt-error: #ff5f6d;
    --dt-error-bg: rgba(255, 95, 109, 0.08);
    --dt-warn: #ffb84d;
    --dt-warn-bg: rgba(255, 184, 77, 0.06);
    --dt-info: #5fa8ff;
    --dt-debug: #6b7394;
    --dt-font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', 'Cascadia Code', ui-monospace, monospace;
    --dt-font-sans: 'Inter', -apple-system, system-ui, sans-serif;
    --dt-panel-w: 420px;
    --dt-radius: 6px;
    --dt-radius-sm: 4px;
    --dt-transition: 280ms cubic-bezier(0.32, 0.72, 0, 1);
  }

  /* ================================================================
     Floating Trigger
     ================================================================ */
  .devtools-trigger {
    position: fixed;
    bottom: 16px;
    left: 16px;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border: 1px solid var(--dt-border);
    border-radius: 12px;
    background: var(--dt-bg);
    color: var(--dt-text);
    cursor: pointer;
    transition: all 200ms ease;
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(255, 255, 255, 0.04) inset;
    -webkit-tap-highlight-color: transparent;
  }

  .devtools-trigger:hover {
    background: var(--dt-bg-hover);
    border-color: var(--dt-accent);
    box-shadow:
      0 4px 16px rgba(108, 140, 255, 0.15),
      0 0 0 1px rgba(108, 140, 255, 0.1) inset;
    transform: translateY(-1px);
  }

  .devtools-trigger:active {
    transform: translateY(0);
  }

  .devtools-trigger__icon {
    font-size: 20px;
    line-height: 1;
  }

  .devtools-trigger__badge {
    position: absolute;
    top: -5px;
    right: -5px;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 9px;
    background: var(--dt-error);
    color: #fff;
    font-family: var(--dt-font-sans);
    font-size: 10px;
    font-weight: 700;
    line-height: 18px;
    text-align: center;
    pointer-events: none;
    animation: badge-pop 300ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  @keyframes badge-pop {
    0% { transform: scale(0); }
    100% { transform: scale(1); }
  }

  /* ================================================================
     Backdrop
     ================================================================ */
  .devtools-backdrop {
    position: fixed;
    inset: 0;
    z-index: 51;
    background: rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(2px);
    animation: backdrop-in 200ms ease forwards;
  }

  @keyframes backdrop-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  /* ================================================================
     Panel
     ================================================================ */
  .devtools-panel {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 52;
    display: flex;
    flex-direction: column;
    width: var(--dt-panel-w);
    max-width: 92vw;
    height: 100dvh;
    background: var(--dt-bg);
    border-right: 1px solid var(--dt-border);
    box-shadow: 4px 0 32px rgba(0, 0, 0, 0.5);
    font-family: var(--dt-font-sans);
    color: var(--dt-text);
    transform: translateX(-100%);
    transition: transform var(--dt-transition);
    will-change: transform;
    contain: layout style;
  }

  .devtools-panel--open {
    transform: translateX(0);
  }

  /* ================================================================
     Header
     ================================================================ */
  .devtools-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 1px solid var(--dt-border);
    background: var(--dt-bg-elevated);
    flex-shrink: 0;
  }

  .devtools-header__title {
    font-family: var(--dt-font-mono);
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: var(--dt-text-bright);
    text-transform: uppercase;
  }

  .devtools-header__count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 22px;
    height: 20px;
    padding: 0 6px;
    border-radius: 10px;
    background: var(--dt-accent);
    color: #fff;
    font-family: var(--dt-font-mono);
    font-size: 10px;
    font-weight: 700;
  }

  .devtools-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    border-radius: var(--dt-radius-sm);
    background: transparent;
    color: var(--dt-text-muted);
    cursor: pointer;
    transition: all 150ms ease;
  }

  .devtools-close:hover {
    background: var(--dt-bg-hover);
    color: var(--dt-text-bright);
  }

  /* ================================================================
     Filters
     ================================================================ */
  .devtools-filters {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 10px 12px;
    border-bottom: 1px solid var(--dt-border-subtle);
    background: var(--dt-bg);
    flex-shrink: 0;
  }

  .devtools-filters__levels {
    display: flex;
    gap: 4px;
  }

  .devtools-level-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border: 1px solid var(--dt-border);
    border-radius: 999px;
    background: transparent;
    color: var(--dt-text-muted);
    font-family: var(--dt-font-sans);
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    transition: all 150ms ease;
    -webkit-tap-highlight-color: transparent;
  }

  .devtools-level-btn:hover {
    background: var(--dt-bg-hover);
    color: var(--dt-text);
  }

  .devtools-level-btn--active.devtools-level-btn--error {
    background: var(--dt-error-bg);
    border-color: color-mix(in srgb, var(--dt-error) 30%, transparent);
    color: var(--dt-error);
  }
  .devtools-level-btn--active.devtools-level-btn--warn {
    background: var(--dt-warn-bg);
    border-color: color-mix(in srgb, var(--dt-warn) 30%, transparent);
    color: var(--dt-warn);
  }
  .devtools-level-btn--active.devtools-level-btn--info {
    background: rgba(95, 168, 255, 0.08);
    border-color: color-mix(in srgb, var(--dt-info) 30%, transparent);
    color: var(--dt-info);
  }
  .devtools-level-btn--active.devtools-level-btn--debug {
    background: rgba(107, 115, 148, 0.1);
    border-color: color-mix(in srgb, var(--dt-debug) 40%, transparent);
    color: var(--dt-text);
  }

  .devtools-level-btn__icon {
    font-size: 10px;
    line-height: 1;
  }

  .devtools-level-btn__label {
    text-transform: capitalize;
  }

  .devtools-search {
    width: 100%;
    padding: 6px 10px;
    border: 1px solid var(--dt-border);
    border-radius: var(--dt-radius-sm);
    background: var(--dt-bg-elevated);
    color: var(--dt-text);
    font-family: var(--dt-font-mono);
    font-size: 12px;
    outline: none;
    transition: border-color 150ms ease;
  }

  .devtools-search::placeholder {
    color: var(--dt-text-muted);
    font-family: var(--dt-font-sans);
    opacity: 0.7;
  }

  .devtools-search:focus {
    border-color: var(--dt-accent);
    box-shadow: 0 0 0 2px rgba(108, 140, 255, 0.15);
  }

  /* ================================================================
     Stats Bar
     ================================================================ */
  .devtools-stats {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px 14px;
    border-bottom: 1px solid var(--dt-border-subtle);
    font-family: var(--dt-font-mono);
    font-size: 11px;
    color: var(--dt-text-muted);
    flex-shrink: 0;
  }

  .devtools-stat {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    white-space: nowrap;
  }

  .devtools-stat--error { color: var(--dt-error); }
  .devtools-stat--warn { color: var(--dt-warn); }
  .devtools-stat--info { color: var(--dt-info); }
  .devtools-stat--debug { color: var(--dt-debug); }
  .devtools-stat--total { color: var(--dt-text-muted); }

  .devtools-stat__separator {
    flex: 1;
  }

  /* ================================================================
     Log List
     ================================================================ */
  .devtools-logs {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    overscroll-behavior: contain;
    scrollbar-width: thin;
    scrollbar-color: var(--dt-bg-active) transparent;
  }

  .devtools-logs::-webkit-scrollbar {
    width: 6px;
  }
  .devtools-logs::-webkit-scrollbar-track {
    background: transparent;
  }
  .devtools-logs::-webkit-scrollbar-thumb {
    background: var(--dt-bg-active);
    border-radius: 3px;
  }

  /* Empty state */
  .devtools-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 48px 24px;
    color: var(--dt-text-muted);
  }

  .devtools-empty__icon {
    font-size: 28px;
    opacity: 0.5;
  }

  .devtools-empty__text {
    font-size: 13px;
    text-align: center;
  }

  /* ================================================================
     Log Entry
     ================================================================ */
  .devtools-entry {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 0;
    border: none;
    border-bottom: 1px solid var(--dt-border-subtle);
    background: transparent;
    color: var(--dt-text);
    font-family: var(--dt-font-sans);
    text-align: left;
    cursor: pointer;
    transition: background 100ms ease;
    -webkit-tap-highlight-color: transparent;
  }

  .devtools-entry:hover {
    background: var(--dt-bg-hover);
  }

  .devtools-entry--error {
    background: var(--dt-error-bg);
  }
  .devtools-entry--error:hover {
    background: rgba(255, 95, 109, 0.12);
  }

  .devtools-entry--warn {
    background: var(--dt-warn-bg);
  }
  .devtools-entry--warn:hover {
    background: rgba(255, 184, 77, 0.1);
  }

  .devtools-entry__row {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 12px;
    min-height: 32px;
  }

  .devtools-entry__time {
    flex-shrink: 0;
    font-family: var(--dt-font-mono);
    font-size: 10px;
    color: var(--dt-text-muted);
    letter-spacing: 0.02em;
  }

  .devtools-entry__level {
    flex-shrink: 0;
    font-size: 10px;
    line-height: 1;
  }

  .devtools-entry__context {
    flex-shrink: 0;
    padding: 1px 6px;
    border-radius: 3px;
    background: hsl(var(--ctx-hue, 200) 50% 20% / 0.45);
    color: hsl(var(--ctx-hue, 200) 70% 75%);
    font-family: var(--dt-font-mono);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.02em;
    white-space: nowrap;
  }

  .devtools-entry__msg {
    flex: 1;
    min-width: 0;
    font-size: 12px;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .devtools-entry--expanded .devtools-entry__msg {
    white-space: normal;
    word-break: break-word;
  }

  .devtools-entry__msg--truncated {
    opacity: 0.85;
  }

  .devtools-entry__chevron {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    color: var(--dt-text-muted);
    transition: transform 200ms ease;
  }

  .devtools-entry__chevron--open {
    transform: rotate(180deg);
  }

  /* Expanded detail */
  .devtools-entry__detail {
    padding: 0 12px 10px 46px;
    animation: detail-in 200ms ease forwards;
  }

  @keyframes detail-in {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .devtools-entry__stack-header {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 6px;
  }

  .devtools-entry__error-name {
    padding: 1px 6px;
    border-radius: 3px;
    background: rgba(255, 95, 109, 0.15);
    color: var(--dt-error);
    font-family: var(--dt-font-mono);
    font-size: 11px;
    font-weight: 700;
  }

  .devtools-entry__error-msg {
    color: var(--dt-text);
    font-size: 12px;
  }

  .devtools-entry__stack,
  .devtools-entry__data {
    margin: 0;
    padding: 8px 10px;
    border-radius: var(--dt-radius-sm);
    background: var(--dt-bg-elevated);
    border: 1px solid var(--dt-border);
    color: var(--dt-text-muted);
    font-family: var(--dt-font-mono);
    font-size: 10px;
    line-height: 1.55;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 200px;
    scrollbar-width: thin;
    scrollbar-color: var(--dt-bg-active) transparent;
  }

  .devtools-entry__data {
    color: var(--dt-info);
    max-height: 160px;
  }

  /* ================================================================
     Footer
     ================================================================ */
  .devtools-footer {
    display: flex;
    gap: 8px;
    padding: 10px 12px;
    border-top: 1px solid var(--dt-border);
    background: var(--dt-bg-elevated);
    flex-shrink: 0;
  }

  .devtools-footer__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    padding: 7px 12px;
    border: 1px solid var(--dt-border);
    border-radius: var(--dt-radius);
    background: transparent;
    color: var(--dt-text);
    font-family: var(--dt-font-sans);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 150ms ease;
    -webkit-tap-highlight-color: transparent;
  }

  .devtools-footer__btn:hover {
    background: var(--dt-bg-hover);
    border-color: var(--dt-text-muted);
  }

  .devtools-footer__btn--export:hover {
    border-color: var(--dt-accent);
    color: var(--dt-accent);
  }

  .devtools-footer__btn--clear:hover {
    border-color: var(--dt-error);
    color: var(--dt-error);
  }

  /* ================================================================
     Reduced motion
     ================================================================ */
  @media (prefers-reduced-motion: reduce) {
    .devtools-panel {
      transition: none;
    }
    .devtools-trigger {
      transition: none;
    }
    .devtools-trigger__badge {
      animation: none;
    }
    .devtools-entry__detail {
      animation: none;
    }
    .devtools-backdrop {
      animation: none;
    }
  }
</style>
