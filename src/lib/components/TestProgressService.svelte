<script lang="ts">
  import { progressService } from '$lib/services/index';
  import { Debug } from '$lib/utils';

  Debug.log('TestProgressService', 'Loading ProgressService...');
  Debug.log('TestProgressService', 'ProgressService instance loaded', { instance: progressService });

  // Force migration
  progressService.forceMigration();
  Debug.log('TestProgressService', 'Migration completed');
</script>

<div>
  Test ProgressService - check console logs
</div>