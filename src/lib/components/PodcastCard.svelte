<script lang="ts">
  import type { PodcastEpisode, PodcastShow } from '../api/types';
  import { player } from '../stores/player';
  import { formatDuration } from '../api/piped';

  export let episode: PodcastEpisode;
  export let active = false;

  function playEpisode() {
    player.play({ ...episode, _type: 'podcast' });
  }

  function formatDate(s: string) {
    try { return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
    catch { return ''; }
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="pod-card {active ? 'active' : ''}" on:click={playEpisode}>
  <div class="pod-icon">{episode.showIcon}</div>
  <div class="pod-info">
    <p class="pod-show">{episode.showName}</p>
    <p class="pod-title">{episode.title}</p>
    <p class="pod-meta">{formatDate(episode.pubDate)} {episode.duration ? '· ' + formatDuration(episode.duration) : ''}</p>
    {#if episode.description}
      <p class="pod-desc">{episode.description}</p>
    {/if}
  </div>
  <button class="pod-play" on:click|stopPropagation={playEpisode}>
    {active ? '⏸' : '▶'}
  </button>
</div>

<style>
  .pod-card {
    display: flex; align-items: flex-start; gap: 14px;
    background: #141420; border-radius: 10px; padding: 14px;
    cursor: pointer; transition: background 0.15s;
  }
  .pod-card:hover { background: #1e1e30; }
  .pod-card.active { outline: 2px solid #7c5cbf; background: #1e1e30; }
  .pod-icon { font-size: 36px; flex-shrink: 0; width: 48px; text-align: center; }
  .pod-info { flex: 1; overflow: hidden; }
  .pod-show { color: #7c5cbf; font-size: 11px; font-weight: 600; margin: 0 0 3px; text-transform: uppercase; letter-spacing: 0.5px; }
  .pod-title { color: #fff; font-size: 14px; font-weight: 600; margin: 0 0 4px;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .pod-meta { color: #888; font-size: 11px; margin: 0 0 6px; }
  .pod-desc { color: #b3b3b3; font-size: 12px; margin: 0;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .pod-play { flex-shrink: 0; width: 36px; height: 36px; border-radius: 50%;
    background: #1db954; border: none; color: #000; font-size: 14px;
    cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .pod-play:hover { background: #1ed760; }
</style>
