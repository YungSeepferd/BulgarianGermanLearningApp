<script lang="ts">
  import { getDIContainer } from '$lib/services/di-container';
  import { Debug } from '$lib/utils';

  Debug.log('TestProgressService', 'Loading ProgressService...');
  const progressService = getDIContainer().getService('progressService');
  Debug.log('TestProgressService', 'ProgressService instance loaded', { instance: progressService });

  // Force migration
  progressService.forceMigration();
  Debug.log('TestProgressService', 'Migration completed');
</script>

<div>
  Test ProgressService - check console logs
</div>