<script lang="ts">
  import { onMount } from 'svelte';
  import { LEARNING_CHANNELS } from '../lib/api/constants';
  import { searchTracks } from '../lib/api/music';
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
    tracks = await searchTracks(ch.query).catch(() => []);
    loading = false;
  }

  onMount(() => loadChannel(activeChannel));
</script>

<div class="page">
  <div class="page-header">
    <h1>Learning</h1>
    <p>Educational videos from top YouTube channels</p>
  </div>

  <div class="channel-strip">
    {#each LEARNING_CHANNELS as ch}
      <button
        class="ch-tag {activeChannel.id === ch.id ? 'active' : ''}"
        on:click={() => loadChannel(ch)}
      >
        <span class="ch-icon">{ch.icon}</span>
        <span>{ch.name}</span>
      </button>
    {/each}
  </div>

  <div class="channel-header">
    <span class="ch-icon-large">{activeChannel.icon}</span>
    <div>
      <h2>{activeChannel.name}</h2>
      <p class="ch-desc">Latest uploads</p>
    </div>
  </div>

  {#if loading}
    <div class="loading"><div class="spinner"></div></div>
  {:else if tracks.length}
    <div class="track-grid">
      {#each tracks as track}
        <TrackCard {track} queue={tracks} active={$currentTrack?.id === track.id} />
      {/each}
    </div>
  {:else}
    <div class="empty"><p>No videos found</p></div>
  {/if}
</div>

<style>
  .page { padding: 32px; }
  .page-header { margin-bottom: 20px; }
  .page-header h1 { color: #F0EEF5; font-size: 28px; font-weight: 700; margin: 0 0 4px; }
  .page-header p { color: #8B89A6; margin: 0; font-size: 14px; }
  .channel-strip { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 20px; scrollbar-width: none; }
  .channel-strip::-webkit-scrollbar { display: none; }
  .ch-tag {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 20px; border: none;
    background: rgba(255,255,255,0.04); color: #8B89A6;
    font-size: 13px; cursor: pointer; white-space: nowrap;
    transition: all 0.15s; flex-shrink: 0;
  }
  .ch-tag:hover { background: rgba(255,255,255,0.08); color: #F0EEF5; }
  .ch-tag.active { background: rgba(232,184,75,0.12); color: #E8B84B; }
  .ch-icon { font-size: 18px; }
  .channel-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; padding: 20px; background: rgba(255,255,255,0.02); border-radius: 12px; }
  .ch-icon-large { font-size: 40px; }
  .channel-header h2 { color: #F0EEF5; font-size: 20px; font-weight: 600; margin: 0 0 4px; }
  .ch-desc { color: #8B89A6; font-size: 13px; margin: 0; }
  .loading { display: flex; justify-content: center; padding: 60px; }
  .spinner { width: 32px; height: 32px; border: 3px solid rgba(232,184,75,0.1); border-top-color: #E8B84B; border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .track-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; }
  .empty { text-align: center; padding: 60px; color: #8B89A6; }
  @media (max-width: 768px) {
    .page { padding: 16px; }
    .track-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }
  }
</style>