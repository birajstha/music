<script lang="ts">
  import Sidebar from './lib/components/Sidebar.svelte';
  import Player from './lib/components/Player.svelte';
  import Home from './pages/Home.svelte';
  import Genre from './pages/Genre.svelte';
  import Search from './pages/Search.svelte';
  import Podcasts from './pages/Podcasts.svelte';
  import Learning from './pages/Learning.svelte';

  let page = 'home';

  function navigate(p: string) { page = p; }

  // Global keyboard shortcuts
  function onKeyDown(e: KeyboardEvent) {
    if ((e.target as HTMLElement).tagName === 'INPUT') return;
    if (e.code === 'Space') { e.preventDefault(); /* player togglePlay handled in store */ }
  }
</script>

<svelte:window on:keydown={onKeyDown} />

<div class="app">
  <Sidebar {page} onNavigate={navigate} />

  <main class="main-content">
    {#if page === 'home'}
      <Home onNavigate={navigate} />
    {:else if page === 'genres'}
      <Genre />
    {:else if page === 'search'}
      <Search />
    {:else if page === 'podcasts'}
      <Podcasts />
    {:else if page === 'learning'}
      <Learning />
    {/if}
  </main>

  <Player />
</div>

<style>
  :global(*) { box-sizing: border-box; margin: 0; padding: 0; }
  :global(body) {
    background: #0a0a0f;
    color: #fff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    overflow-x: hidden;
  }
  :global(::-webkit-scrollbar) { width: 6px; }
  :global(::-webkit-scrollbar-track) { background: #0a0a0f; }
  :global(::-webkit-scrollbar-thumb) { background: #2a2a3a; border-radius: 3px; }
  :global(::-webkit-scrollbar-thumb:hover) { background: #3a3a5a; }

  .app { display: flex; min-height: 100vh; }
  .main-content {
    margin-left: 220px;
    flex: 1;
    padding-bottom: 100px; /* space for player */
    min-height: 100vh;
    overflow-y: auto;
  }

  @media (max-width: 768px) {
    .main-content {
      margin-left: 0;
      padding-bottom: 144px; /* player (64px) + tabbar (60px) + gap */
    }
  }
</style>
