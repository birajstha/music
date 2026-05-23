<script lang="ts">
  import { onMount } from 'svelte';
  import { searchTracks } from '../lib/api/music';
  import { player } from '../lib/stores/player';
  import TrackCard from '../lib/components/TrackCard.svelte';
  import GenreGrid from '../lib/components/GenreGrid.svelte';
  import { GENRES } from '../lib/api/constants';
  import type { Track } from '../lib/api/types';

  export let initialGenre = 'trending';
  let activeGenre = initialGenre;
  let tracks: Track[] = [];
  let loading = false;
  const { currentTrack } = player;

  async function loadGenre(id: string) {
    activeGenre = id;
    loading = true;
    tracks = [];
    const genre = GENRES.find(g => g.id === id);
    if (genre) tracks = await searchTracks(genre.query).catch(() => []);
    loading = false;
  }

  onMount(() => loadGenre(activeGenre));
</script>

<div class="page">
  <div class="page-header">
    <h1>🎸 Genres</h1>
    <p>Pick a vibe</p>
  </div>
  <div class="genre-wrap">
    <GenreGrid {activeGenre} onSelect={loadGenre} />
  </div>

  {#if loading}
    <div class="loading"><div class="spinner"></div><p>Loading tracks...</p></div>
  {:else if tracks.length}
    <section class="tracks-section">
      <h2>{GENRES.find(g => g.id === activeGenre)?.label || ''}</h2>
      <div class="track-grid">
        {#each tracks as track}
          <TrackCard {track} queue={tracks} active={$currentTrack?.id === track.id} />
        {/each}
      </div>
    </section>
  {/if}
</div>

<style>
  .page { padding: 32px; }
  .page-header { margin-bottom: 24px; }
  .page-header h1 { color: #fff; font-size: 28px; font-weight: 700; margin: 0 0 4px; }
  .page-header p { color: #b3b3b3; margin: 0; }
  .genre-wrap { margin-bottom: 32px; }
  .loading { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 60px; color: #b3b3b3; }
  .spinner { width: 36px; height: 36px; border: 3px solid #2a2a3a; border-top-color: #7c5cbf; border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .tracks-section h2 { color: #fff; font-size: 20px; font-weight: 700; margin: 0 0 16px; }
  .track-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; }
  @media (max-width: 768px) {
    .page { padding: 16px; }
    .track-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 12px; }
  }
</style>
