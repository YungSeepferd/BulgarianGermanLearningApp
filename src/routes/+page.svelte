<script lang="ts">
  import TandemPractice from '$lib/components/TandemPractice.svelte';
  
  // Using Svelte 5 features - reactive state
  let pageTitle = $state("Tandem Learning System");
  let pageDescription = $state("Learn Bulgarian and German together with instant direction switching");
</script>

<svelte:head>
  <title>{pageTitle} - BulgarianGerman Learning App</title>
  <meta name="description" content={pageDescription} />
</svelte:head>

<div class="hero-section">
  <div class="hero-content">
    <h1 class="hero-title">{pageTitle}</h1>
    <p class="hero-description">{pageDescription}</p>
    
    <div class="cta-container">
      <a href="/learn" class="cta-button primary">Start Learning 🚀</a>
      <a href="/vocabulary" class="cta-button secondary">Browse Vocabulary</a>
    </div>

    <div class="hero-features">
      <div class="feature">
        <span class="feature-icon">🔄</span>
        <span class="feature-text">Instant direction switching</span>
      </div>
      <div class="feature">
        <span class="feature-icon">🌍</span>
        <span class="feature-text">Collective learning progress</span>
      </div>
      <div class="feature">
        <span class="feature-icon">⚡</span>
        <span class="feature-text">No login required</span>
      </div>
    </div>
  </div>
</div>

<div class="main-content">
  <!-- Legacy Component for Reference/Testing -->
  <!-- <TandemPractice /> -->
</div>

<div class="info-section">
  <div class="info-card">
    <h3>How it works</h3>
    <p>The Tandem Learning System allows you to instantly switch between learning directions. Practice German → Bulgarian or Bulgarian → German with a single click.</p>
  </div>
  <div class="info-card">
    <h3>Collective Progress</h3>
    <p>Your learning contributes to the community's progress. See how many times each word has been practiced by learners worldwide.</p>
  </div>
  <div class="info-card">
    <h3>Smart Search</h3>
    <p>Search for specific words or grammar rules, then instantly practice them in your preferred direction.</p>
  </div>
</div>

<footer>
  <div class="footer-content">
    <p>BulgarianGerman Learning App - Tandem Learning System</p>
    <p class="footer-note">Built with Svelte 5 • Deployed on GitHub Pages • Powered by community learning</p>
  </div>
</footer>

<style>
  .hero-section {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 3rem 1rem;
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .hero-content {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .hero-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    line-height: 1.2;
  }
  
  .hero-description {
    font-size: 1.2rem;
    margin-bottom: 2rem;
    opacity: 0.9;
    line-height: 1.4;
  }

  .cta-container {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 3rem;
  }

  .cta-button {
    padding: 1rem 2rem;
    border-radius: 999px;
    font-weight: 700;
    text-decoration: none;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .cta-button.primary {
    background: white;
    color: #667eea;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }

  .cta-button.secondary {
    background: rgba(255,255,255,0.2);
    color: white;
    border: 2px solid rgba(255,255,255,0.4);
  }

  .cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0,0,0,0.15);
  }
  
  .hero-features {
    display: flex;
    justify-content: center;
    gap: 2rem;
    flex-wrap: wrap;
  }
  
  .feature {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    opacity: 0.9;
  }
  
  .feature-icon {
    font-size: 1.2rem;
  }
  
  .main-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    margin-bottom: 3rem;
  }
  
  .info-section {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    margin-bottom: 3rem;
  }
  
  .info-card {
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .info-card h3 {
    color: #2c3e50;
    margin-bottom: 0.75rem;
    font-size: 1.2rem;
  }
  
  .info-card p {
    color: #6c757d;
    line-height: 1.5;
    margin: 0;
  }
  
  footer {
    background: #f8f9fa;
    border-top: 1px solid #dee2e6;
    padding: 2rem 1rem;
    text-align: center;
  }
  
  .footer-content p {
    margin: 0.5rem 0;
    color: #6c757d;
  }
  
  .footer-note {
    font-size: 0.9rem;
    opacity: 0.8;
  }
  
  @media (max-width: 768px) {
    .hero-title {
      font-size: 2rem;
    }
    
    .hero-description {
      font-size: 1rem;
    }
    
    .hero-features {
      gap: 1rem;
    }
    
    .feature {
      font-size: 0.8rem;
    }
    
    .info-section {
      padding: 0 0.5rem;
    }
  }
</style>