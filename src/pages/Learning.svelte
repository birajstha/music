<script lang="ts">
  import { onMount } from 'svelte';
  import { LEARNING_CHANNELS } from '../lib/api/constants';
  import { getLearningVideos } from '../lib/api/music';
  import { player } from '../lib/stores/player';
  import TrackCard from '../lib/components/TrackCard.svelte';
  import type { Track } from '../lib/api/types';

  let activeChannel = LEARNING_CHANNELS[0];
  let tracks: Track[] = [];
  let loading = false;
  const { currentTrack } = player;

  async function loadChannel(ch: typeof LEARNING_CHANNELS[0]) {
    activeChannel = ch;
    loading = true; tracks = [];
    tracks = await getLearningVideos(ch.id).catch(() => []);
    loading = false;
  }

  onMount(() => loadChannel(activeChannel));
</script>

<div class="page">
  <div class="page-header">
    <h1>📚 Learn</h1>
    <p>Top educational YouTube channels — via RSS</p>
  </div>

  <div class="channel-tabs">
    {#each LEARNING_CHANNELS as ch}
      <button
        class="ch-tab {activeChannel.id === ch.id ? 'active' : ''}"
        on:click={() => loadChannel(ch)}
      >
        <span>{ch.icon}</span>
        <span class="ch-name">{ch.name}</span>
      </button>
    {/each}
  </div>

  <div class="channel-header">
    <span class="ch-big-icon">{activeChannel.icon}</span>
    <div>
      <h2>{activeChannel.name}</h2>
      <p>Latest videos — play audio only</p>
    </div>
  </div>

  {#if loading}
    <div class="loading"><div class="spinner"></div><p>Loading videos...</p></div>
  {:else if tracks.length}
    <div class="track-grid">
      {#each tracks as track}
        <TrackCard {track} queue={tracks} active={$currentTrack?.id === track.id} />
      {/each}
    </div>
  {:else}
    <div class="empty"><p>No videos found. Try another channel.</p></div>
  {/if}
</div>

<style>
  .page { padding: 32px; }
  .page-header { margin-bottom: 24px; }
  .page-header h1 { color: #fff; font-size: 28px; font-weight: 700; margin: 0 0 4px; }
  .page-header p { color: #b3b3b3; margin: 0; }
  .channel-tabs { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 4px; margin-bottom: 24px; scrollbar-width: none; }
  .channel-tabs::-webkit-scrollbar { display: none; }
  .ch-tab { display: flex; align-items: center; gap: 8px; padding: 10px 16px; background: #141420; border: 1px solid #2a2a3a; border-radius: 24px; color: #b3b3b3; font-size: 13px; cursor: pointer; white-space: nowrap; flex-shrink: 0; transition: all 0.15s; }
  .ch-tab:hover { background: #1e1e30; color: #fff; }
  .ch-tab.active { background: #1db954; border-color: #1db954; color: #000; font-weight: 700; }
  .channel-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; padding: 20px; background: #141420; border-radius: 12px; }
  .ch-big-icon { font-size: 48px; }
  .channel-header h2 { color: #fff; font-size: 20px; font-weight: 700; margin: 0 0 4px; }
  .channel-header p { color: #b3b3b3; font-size: 13px; margin: 0; }
  .loading { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 60px; color: #b3b3b3; }
  .spinner { width: 36px; height: 36px; border: 3px solid #2a2a3a; border-top-color: #1db954; border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .track-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; }
  .empty { padding: 40px; text-align: center; color: #b3b3b3; }
  @media (max-width: 768px) {
    .page { padding: 16px; }
    .track-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 12px; }
  }
</style>