<script lang="ts">
  import { onMount } from 'svelte';
  import { searchTracks } from '../lib/api/music';
  import { player } from '../lib/stores/player';
  import TrackCard from '../lib/components/TrackCard.svelte';
  import { GENRES } from '../lib/api/constants';
  import type { Track } from '../lib/api/types';

  let activeGenre = 'trending';
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
    <h1>Genres</h1>
    <p>Pick a vibe</p>
  </div>

  <div class="genre-strip">
    {#each GENRES as g}
      <button
        class="genre-tag {activeGenre === g.id ? 'active' : ''}"
        on:click={() => loadGenre(g.id)}
      >
        {g.label}
      </button>
    {/each}
  </div>

  {#if loading}
    <div class="loading"><div class="spinner"></div></div>
  {:else if tracks.length}
    <section>
      <h2 class="section-title">{GENRES.find(g => g.id === activeGenre)?.label || 'Music'}</h2>
      <div class="track-grid">
        {#each tracks as track}
          <TrackCard {track} queue={tracks} active={$currentTrack?.id === track.id} />
        {/each}
      </div>
    </section>
  {:else}
    <div class="empty"><p>No tracks found for this genre</p></div>
  {/if}
</div>

<style>
  .page { padding: 32px; }
  .page-header { margin-bottom: 20px; }
  .page-header h1 { color: #F0EEF5; font-size: 28px; font-weight: 700; margin: 0 0 4px; }
  .page-header p { color: #8B89A6; margin: 0; font-size: 14px; }
  .genre-strip { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 28px; scrollbar-width: none; }
  .genre-strip::-webkit-scrollbar { display: none; }
  .genre-tag {
    padding: 8px 18px; border-radius: 20px; border: none;
    background: rgba(255,255,255,0.04); color: #8B89A6;
    font-size: 13px; cursor: pointer; white-space: nowrap;
    transition: all 0.15s; flex-shrink: 0;
  }
  .genre-tag:hover { background: rgba(255,255,255,0.08); color: #F0EEF5; }
  .genre-tag.active { background: rgba(232,184,75,0.12); color: #E8B84B; }
  .loading { display: flex; justify-content: center; padding: 60px; }
  .spinner { width: 32px; height: 32px; border: 3px solid rgba(232,184,75,0.1); border-top-color: #E8B84B; border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .section-title { color: #F0EEF5; font-size: 20px; font-weight: 600; margin: 0 0 16px; }
  .track-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; }
  .empty { text-align: center; padding: 60px; color: #8B89A6; }
  @media (max-width: 768px) {
    .page { padding: 16px; }
    .track-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }
  }
</style>