<script lang="ts">
  import ProgressDashboard from '$lib/components/ProgressDashboard.svelte';
  import { progressService } from '$lib/services/progress';
  import { learningSession } from '$lib/state/session.svelte';

  // Initialize progress service
  progressService.getProgressSummary();
</script>

<div class="dashboard-container">
  <ProgressDashboard />
</div>

<style>
  .dashboard-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    min-height: 100vh;
    background-color: #f5f5f5;
  }

  @media (max-width: 768px) {
    .dashboard-container {
      padding: 1rem;
    }
  }
</style>