<script lang="ts">
  import { searchTracks } from '../lib/api/music';
  import { player } from '../lib/stores/player';
  import TrackCard from '../lib/components/TrackCard.svelte';
  import type { Track } from '../lib/api/types';

  let query = '';
  let tracks: Track[] = [];
  let loading = false;
  let searched = false;
  const { currentTrack } = player;

  async function doSearch() {
    if (!query.trim()) return;
    loading = true; searched = true; tracks = [];
    tracks = await searchTracks(query).catch(() => []);
    loading = false;
  }

  function onKey(e: KeyboardEvent) { if (e.key === 'Enter') doSearch(); }
</script>

<div class="page">
  <div class="page-header">
    <h1>🔍 Search</h1>
  </div>
  <div class="search-bar">
    <input
      type="text" placeholder="Search songs, artists..."
      bind:value={query} on:keydown={onKey}
      autofocus
    />
    <button on:click={doSearch} disabled={loading || !query.trim()}>
      {loading ? '⏳' : '🔍'}
    </button>
  </div>

  {#if loading}
    <div class="loading"><div class="spinner"></div><p>Searching...</p></div>
  {:else if searched && !tracks.length}
    <div class="empty"><p>No results for "<em>{query}</em>"</p><p>Try a different search.</p></div>
  {:else if tracks.length}
    <div class="results-header"><h2>{tracks.length} results for "{query}"</h2></div>
    <div class="track-grid">
      {#each tracks as track}
        <TrackCard {track} queue={tracks} active={$currentTrack?.id === track.id} />
      {/each}
    </div>
  {:else}
    <div class="suggestions">
      <p>Try searching for:</p>
      <div class="chips">
        {#each ['Lofi beats', 'Nepali pop', 'Classic rock', 'Jazz piano', 'EDM 2024', 'Hip hop', 'Taylor Swift', 'The Weeknd'] as s}
          <button class="chip" on:click={() => { query = s; doSearch(); }}>{s}</button>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .page { padding: 32px; }
  .page-header h1 { color: #fff; font-size: 28px; font-weight: 700; margin: 0 0 24px; }
  .search-bar { display: flex; gap: 10px; margin-bottom: 32px; }
  .search-bar input {
    flex: 1; padding: 14px 18px; background: #1e1e30; border: 1px solid #2a2a3a;
    border-radius: 30px; color: #fff; font-size: 15px; outline: none;
    transition: border-color 0.15s;
  }
  .search-bar input:focus { border-color: #7c5cbf; }
  .search-bar input::placeholder { color: #666; }
  .search-bar button {
    width: 52px; height: 52px; border-radius: 50%; background: #7c5cbf;
    border: none; font-size: 20px; cursor: pointer; transition: background 0.15s;
  }
  .search-bar button:hover { background: #9370d8; }
  .search-bar button:disabled { opacity: 0.5; cursor: default; }
  .loading { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 60px; color: #b3b3b3; }
  .spinner { width: 36px; height: 36px; border: 3px solid #2a2a3a; border-top-color: #7c5cbf; border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .empty, .suggestions { padding: 40px; text-align: center; color: #b3b3b3; }
  .empty em { color: #fff; }
  .chips { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 16px; }
  .chip { padding: 8px 18px; background: #1e1e30; border: 1px solid #2a2a3a; border-radius: 20px; color: #b3b3b3; font-size: 13px; cursor: pointer; transition: all 0.15s; }
  .chip:hover { background: #2a2a3a; color: #fff; border-color: #7c5cbf; }
  .results-header h2 { color: #b3b3b3; font-size: 14px; font-weight: 500; margin: 0 0 16px; }
  .track-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; }
  @media (max-width: 768px) {
    .page { padding: 16px; }
    .track-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 12px; }
  }
</style>
