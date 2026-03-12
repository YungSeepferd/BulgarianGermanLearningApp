<script lang="ts">
	import { onMount } from 'svelte';

	let isOnline = $state(false);

	onMount(() => {
		isOnline = navigator.onLine;

		const handleOnline = () => {
			isOnline = true;
		};

		const handleOffline = () => {
			isOnline = false;
		};

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	});

	function retry() {
		window.location.reload();
	}

	function goHome() {
		window.location.href = '/';
	}
</script>

<svelte:head>
	<title>Offline - Bulgarian-German Learning App</title>
	<meta name="description" content="You are currently offline. Please check your internet connection." />
</svelte:head>

<div class="offline-page">
	<div class="offline-content">
		<div class="offline-icon">
			<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<line x1="1" y1="1" x2="23" y2="23"></line>
				<path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
				<path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
				<path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
				<path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
				<path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
				<line x1="12" y1="20" x2="12.01" y2="20"></line>
			</svg>
		</div>

		<h1>You're Offline</h1>
		<p class="offline-message">
			{#if isOnline}
				Your connection has been restored! You can try reloading the page.
			{:else}
				Please check your internet connection and try again.
			{/if}
		</p>

		<div class="offline-actions">
			<button class="btn-primary" onclick={retry}>
				Try Again
			</button>
			<button class="btn-secondary" onclick={goHome}>
				Go Home
			</button>
		</div>

		<div class="offline-tips">
			<h3>Tips:</h3>
			<ul>
				<li>Check your WiFi or mobile data connection</li>
				<li>Try turning airplane mode on and off</li>
				<li>Restart your browser</li>
			</ul>
		</div>
	</div>
</div>

<style>
	.offline-page {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 2rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}

	.offline-content {
		text-align: center;
		max-width: 400px;
		background: white;
		padding: 3rem;
		border-radius: 1rem;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
	}

	.offline-icon {
		color: #6b7280;
		margin-bottom: 1.5rem;
	}

	h1 {
		font-size: 2rem;
		color: #1f2937;
		margin-bottom: 1rem;
	}

	.offline-message {
		color: #6b7280;
		margin-bottom: 2rem;
		line-height: 1.6;
	}

	.offline-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-bottom: 2rem;
	}

	.btn-primary,
	.btn-secondary {
		padding: 0.75rem 1.5rem;
		border-radius: 0.5rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-primary {
		background: #3b82f6;
		color: white;
		border: none;
	}

	.btn-primary:hover {
		background: #2563eb;
	}

	.btn-secondary {
		background: white;
		color: #3b82f6;
		border: 2px solid #3b82f6;
	}

	.btn-secondary:hover {
		background: #eff6ff;
	}

	.offline-tips {
		text-align: left;
		background: #f9fafb;
		padding: 1rem;
		border-radius: 0.5rem;
	}

	.offline-tips h3 {
		font-size: 0.875rem;
		color: #374151;
		margin-bottom: 0.5rem;
	}

	.offline-tips ul {
		list-style: disc;
		padding-left: 1.5rem;
		color: #6b7280;
		font-size: 0.875rem;
	}

	.offline-tips li {
		margin-bottom: 0.25rem;
	}
</style>