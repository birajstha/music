<script lang="ts">
  import { onMount } from 'svelte';
  import { PODCAST_SHOWS, fetchPodcastEpisodes } from '../lib/api/podcasts';
  import PodcastCard from '../lib/components/PodcastCard.svelte';
  import { player } from '../lib/stores/player';
  import type { PodcastEpisode } from '../lib/api/types';

  let activeShow = PODCAST_SHOWS[0];
  let episodes: PodcastEpisode[] = [];
  let loading = false;
  const { currentTrack } = player;

  async function loadShow(show: typeof PODCAST_SHOWS[0]) {
    activeShow = show;
    loading = true; episodes = [];
    episodes = await fetchPodcastEpisodes(show).catch(() => []);
    loading = false;
  }

  onMount(() => loadShow(activeShow));
</script>

<div class="page">
  <div class="page-header">
    <h1>🎙️ Podcasts</h1>
    <p>Top shows, free & ad-free</p>
  </div>

  <!-- Show tabs -->
  <div class="show-tabs">
    {#each PODCAST_SHOWS as show}
      <button
        class="show-tab {activeShow.id === show.id ? 'active' : ''}"
        on:click={() => loadShow(show)}
      >
        <span class="show-icon">{show.icon}</span>
        <span class="show-name">{show.name}</span>
      </button>
    {/each}
  </div>

  <!-- Active show header -->
  <div class="show-header">
    <div class="show-big-icon">{activeShow.icon}</div>
    <div>
      <h2>{activeShow.name}</h2>
      <p>{activeShow.host}</p>
    </div>
  </div>

  {#if loading}
    <div class="loading"><div class="spinner"></div><p>Loading episodes...</p></div>
  {:else if !episodes.length}
    <div class="empty"><p>No episodes found. Try again.</p></div>
  {:else}
    <div class="episode-list">
      {#each episodes as ep}
        <PodcastCard episode={ep} active={$currentTrack?.id === ep.id} />
      {/each}
    </div>
  {/if}
</div>

<style>
  .page { padding: 32px; }
  .page-header { margin-bottom: 24px; }
  .page-header h1 { color: #fff; font-size: 28px; font-weight: 700; margin: 0 0 4px; }
  .page-header p { color: #b3b3b3; margin: 0; }
  .show-tabs { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 4px; margin-bottom: 24px; scrollbar-width: none; }
  .show-tabs::-webkit-scrollbar { display: none; }
  .show-tab { display: flex; align-items: center; gap: 8px; padding: 10px 16px; background: #141420; border: 1px solid #2a2a3a; border-radius: 24px; color: #b3b3b3; font-size: 13px; cursor: pointer; white-space: nowrap; transition: all 0.15s; flex-shrink: 0; }
  .show-tab:hover { background: #1e1e30; color: #fff; }
  .show-tab.active { background: #7c5cbf; border-color: #7c5cbf; color: #fff; }
  .show-icon { font-size: 18px; }
  .show-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; padding: 20px; background: #141420; border-radius: 12px; }
  .show-big-icon { font-size: 48px; }
  .show-header h2 { color: #fff; font-size: 20px; font-weight: 700; margin: 0 0 4px; }
  .show-header p { color: #b3b3b3; font-size: 13px; margin: 0; }
  .loading { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 60px; color: #b3b3b3; }
  .spinner { width: 36px; height: 36px; border: 3px solid #2a2a3a; border-top-color: #7c5cbf; border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .empty { padding: 40px; text-align: center; color: #b3b3b3; }
  .episode-list { display: flex; flex-direction: column; gap: 10px; }
  @media (max-width: 768px) { .page { padding: 16px; } }
</style>
