<script lang="ts">
  import TopBar from './lib/components/TopBar.svelte';
  import Sidebar from './lib/components/Sidebar.svelte';
  import PlayerBar from './lib/components/PlayerBar.svelte';
  import Home from './pages/Home.svelte';
  import Genre from './pages/Genre.svelte';
  import Search from './pages/Search.svelte';
  import Podcasts from './pages/Podcasts.svelte';
  import Learning from './pages/Learning.svelte';
  import Radio from './pages/Radio.svelte';
  import PlaylistView from './pages/PlaylistView.svelte';

  let page = 'home';
  let playlistId = '';

  let searchBarQuery = '';

  function navigate(p: string) {
    page = p;
    playlistId = '';
  }

  function showPlaylist(id: string) {
    page = 'playlist';
    playlistId = id;
  }

  function handleSearch(q: string) {
    searchBarQuery = q;
    page = 'search';
  }
</script>

<div class="app-shell">
  <TopBar onSearch={handleSearch} />
  <Sidebar {page} onNavigate={navigate} onShowPlaylist={showPlaylist} />
  <main class="main-content">
    {#if page === 'home'}
      <Home onNavigate={navigate} />
    {:else if page === 'genres'}
      <Genre />
    {:else if page === 'radio'}
      <Radio />
    {:else if page === 'search'}
      <Search initialQuery={searchBarQuery} />
    {:else if page === 'podcasts'}
      <Podcasts />
    {:else if page === 'learning'}
      <Learning />
    {:else if page === 'playlist'}
      <PlaylistView {playlistId} onNavigate={navigate} />
    {/if}
  </main>
  <PlayerBar />
</div>

<style>
  :global(*) { box-sizing: border-box; margin: 0; padding: 0; }
  :global(body) {
    background: #0c0c18;
    color: #F0EEF5;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  :global(::-webkit-scrollbar) { width: 6px; }
  :global(::-webkit-scrollbar-track) { background: transparent; }
  :global(::-webkit-scrollbar-thumb) { background: #2a2a44; border-radius: 3px; }
  :global(::-webkit-scrollbar-thumb:hover) { background: #3a3a5a; }
  :global(a) { color: #E8B84B; text-decoration: none; }
  :global(a:hover) { text-decoration: underline; }

  .app-shell { display: flex; min-height: 100vh; }
  .main-content {
    margin-left: 240px;
    margin-top: 64px;
    padding-bottom: 80px;
    flex: 1;
    min-height: calc(100vh - 64px);
  }

  @media (max-width: 768px) {
    .main-content { margin-left: 0; padding-bottom: 72px; }
  }
</style>