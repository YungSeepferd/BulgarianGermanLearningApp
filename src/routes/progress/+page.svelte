<script lang="ts">
  /**
   * Progress Page
   *
   * This page displays the user's comprehensive progress dashboard
   * including level, XP, vocabulary mastery, lesson completion, and more.
   */

  import { $state } from 'svelte';
  import ProgressDashboard from '$lib/components/ProgressDashboard.svelte';
  import { page } from '$app/stores';

  // Page state
  let activeTab = $state('overview');
</script>

<div class="progress-page">
  <div class="page-header">
    <h1 class="page-title">Your Progress</h1>
    <p class="page-subtitle">Track your language learning journey</p>
  </div>

  <div class="progress-container">
    <ProgressDashboard />
  </div>
</div>

<style>
  .progress-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .page-header {
    margin-bottom: 2rem;
    text-align: center;
  }

  .page-title {
    font-size: 2rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 0.5rem 0;
  }

  .page-subtitle {
    font-size: 1.1rem;
    color: #6b7280;
    margin: 0;
  }

  .progress-container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    padding: 1rem;
  }

  /* Responsive styles */
  @media (max-width: 768px) {
    .progress-page {
      padding: 1rem;
    }

    .page-title {
      font-size: 1.5rem;
    }
  }
</style>