<script lang="ts">
  import { onMount } from 'svelte';
  import { PODCAST_SHOWS, fetchPodcastEpisodes } from '../lib/api/podcasts';
  import PodcastCard from '../lib/components/PodcastCard.svelte';
  import { player } from '../lib/stores/player';
  import type { PodcastEpisode, PodcastShow } from '../lib/api/types';

  let activeShow: PodcastShow = PODCAST_SHOWS[0];
  let episodes: PodcastEpisode[] = [];
  let loading = false;

  const { currentTrack } = player;

  async function loadShow(show: PodcastShow) {
    activeShow = show;
    loading = true; episodes = [];
    episodes = await fetchPodcastEpisodes(show).catch(() => []);
    loading = false;
  }

  onMount(() => loadShow(activeShow));
</script>

<div class="page">
  <div class="page-header">
    <h1>Podcasts</h1>
    <p>Top shows, free and ad-free</p>
  </div>

  <div class="show-strip">
    {#each PODCAST_SHOWS as show}
      <button
        class="show-tag {activeShow.id === show.id ? 'active' : ''}"
        on:click={() => loadShow(show)}
      >
        <span>{show.icon}</span>
        <span>{show.name}</span>
      </button>
    {/each}
  </div>

  <div class="show-header">
    <span class="show-icon-large">{activeShow.icon}</span>
    <div>
      <h2>{activeShow.name}</h2>
      <p class="show-host">{activeShow.host}</p>
    </div>
  </div>

  {#if loading}
    <div class="loading"><div class="spinner"></div></div>
  {:else if episodes.length === 0}
    <div class="empty"><p>No episodes found</p></div>
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
  .page-header { margin-bottom: 20px; }
  .page-header h1 { color: #F0EEF5; font-size: 28px; font-weight: 700; margin: 0 0 4px; }
  .page-header p { color: #8B89A6; margin: 0; font-size: 14px; }
  .show-strip { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 20px; scrollbar-width: none; }
  .show-strip::-webkit-scrollbar { display: none; }
  .show-tag {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 20px; border: none;
    background: rgba(255,255,255,0.04); color: #8B89A6;
    font-size: 13px; cursor: pointer; white-space: nowrap;
    transition: all 0.15s; flex-shrink: 0;
  }
  .show-tag:hover { background: rgba(255,255,255,0.08); color: #F0EEF5; }
  .show-tag.active { background: rgba(232,184,75,0.12); color: #E8B84B; }
  .show-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; padding: 20px; background: rgba(255,255,255,0.02); border-radius: 12px; }
  .show-icon-large { font-size: 44px; }
  .show-header h2 { color: #F0EEF5; font-size: 20px; font-weight: 600; margin: 0 0 4px; }
  .show-host { color: #8B89A6; font-size: 13px; margin: 0; }
  .loading { display: flex; justify-content: center; padding: 60px; }
  .spinner { width: 32px; height: 32px; border: 3px solid rgba(232,184,75,0.1); border-top-color: #E8B84B; border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .episode-list { display: flex; flex-direction: column; gap: 8px; }
  .empty { text-align: center; padding: 60px; color: #8B89A6; }
  @media (max-width: 768px) { .page { padding: 16px; } }
</style>