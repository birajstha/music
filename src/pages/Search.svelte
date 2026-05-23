<script lang="ts">
  import { get } from 'svelte/store';
  import { searchTracks } from '../lib/api/music';
  import { player } from '../lib/stores/player';
  import TrackCard from '../lib/components/TrackCard.svelte';
  import type { Track } from '../lib/api/types';

  export let initialQuery = '';
  let query = initialQuery;
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

  // Auto-search if initial query provided(from top bar)
  $: if (initialQuery && !searched) {
    query = initialQuery;
    doSearch();
  }
</script>

<div class="page">
  <div class="page-header">
    <h1>Search</h1>
  </div>

  {#if searched && !loading}
    {#if tracks.length === 0}
      <div class="empty">
        <p>No results for <strong>{query}</strong></p>
        <p class="hint">Try a different search term</p>
      </div>
    {:else}
      <div class="results-meta">{tracks.length} results</div>
      <div class="track-grid">
        {#each tracks as track}
          <TrackCard {track} queue={tracks} active={$currentTrack?.id === track.id} />
        {/each}
      </div>
    {/if}
  {:else if !searched}
    <div class="suggestions">
      <p class="suggest-label">Try searching for</p>
      <div class="chips">
        {#each ['Lo-fi beats', 'Nepali pop', 'Classic rock', 'Jazz piano', 'EDM 2024', 'Hip hop', 'Ambient', 'Indie folk'] as s}
          <button class="chip" on:click={() => { query = s; doSearch(); }}>{s}</button>
        {/each}
      </div>
    </div>
  {:else}
    <div class="loading"><div class="spinner"></div></div>
  {/if}
</div>

<style>
  .page { padding: 32px; max-width: 800px; margin: 0 auto; }
  .page-header { margin-bottom: 24px; }
  .page-header h1 { color: #F0EEF5; font-size: 28px; font-weight: 700; margin: 0; }
  .results-meta { color: #8B89A6; font-size: 12px; margin-bottom: 16px; }
  .track-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; }
  .loading { display: flex; justify-content: center; padding: 60px; }
  .spinner { width: 32px; height: 32px; border: 3px solid rgba(232,184,75,0.1); border-top-color: #E8B84B; border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .empty { text-align: center; padding: 60px 0; }
  .empty p { color: #8B89A6; font-size: 15px; }
  .empty strong { color: #F0EEF5; }
  .empty .hint { color: #5a5878; font-size: 12px; margin-top: 4px; }
  .suggestions { text-align: center; padding: 40px 0; }
  .suggest-label { color: #8B89A6; font-size: 13px; margin-bottom: 16px; }
  .chips { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
  .chip { padding: 8px 18px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; color: #8B89A6; font-size: 13px; cursor: pointer; transition: all 0.15s; }
  .chip:hover { background: rgba(232,184,75,0.08); border-color: rgba(232,184,75,0.2); color: #E8B84B; }
  @media (max-width: 768px) {
    .page { padding: 16px; }
    .track-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }
  }
</style>