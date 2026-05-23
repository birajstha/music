<script lang="ts">
  import Sidebar from './lib/components/Sidebar.svelte';
  import Player from './lib/components/Player.svelte';
  import Home from './pages/Home.svelte';
  import Genre from './pages/Genre.svelte';
  import Search from './pages/Search.svelte';
  import Podcasts from './pages/Podcasts.svelte';
  import Learning from './pages/Learning.svelte';
  import Radio from './pages/Radio.svelte';

  let page = 'home';

  function navigate(p: string) { page = p; }
</script>

<div class="app">
  <Sidebar {page} onNavigate={navigate} />
  <main class="main-content">
    {#if page === 'home'}
      <Home onNavigate={navigate} />
    {:else if page === 'genres'}
      <Genre />
    {:else if page === 'radio'}
      <Radio />
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
    background: #08080f; color: #fff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    overflow-x: hidden;
  }
  :global(::-webkit-scrollbar) { width: 6px; }
  :global(::-webkit-scrollbar-track) { background: #08080f; }
  :global(::-webkit-scrollbar-thumb) { background: #2a2a3a; border-radius: 3px; }
  .app { display: flex; min-height: 100vh; }
  .main-content {
    margin-left: 220px; flex: 1;
    padding-bottom: 100px; min-height: 100vh;
  }
  @media (max-width: 768px) {
    .main-content { margin-left: 0; padding-bottom: 144px; }
  }
</style>