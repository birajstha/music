<script lang="ts">
  import type { PodcastEpisode } from '../api/types';
  import { player } from '../stores/player';

  export let episode: PodcastEpisode;
  export let active = false;

  function playEpisode() {
    player.play({ ...episode, _type: 'podcast' } as any, [{ ...episode, _type: 'podcast' } as any]);
  }

  function formatDate(d: string) {
    if (!d) return '';
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
</script>

<button class="podcast-card {active ? 'active' : ''}" on:click={playEpisode}>
  <div class="pc-icon">{episode.showIcon || '🎙️'}</div>
  <div class="pc-info">
    <strong class="pc-title">{episode.title}</strong>
    <span class="pc-show">{episode.showName}</span>
    <div class="pc-meta">
      <span class="pc-date">{formatDate(episode.pubDate)}</span>
      {#if episode.duration}
        <span class="pc-dur">{Math.floor(episode.duration / 60)} min</span>
      {/if}
    </div>
  </div>
  <svg class="pc-play" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
</button>

<style>
  .podcast-card {
    display: flex; align-items: center; gap: 14px;
    width: 100%; padding: 14px 16px; border: 1px solid rgba(255,255,255,0.04);
    background: rgba(255,255,255,0.02); border-radius: 10px;
    color: #F0EEF5; cursor: pointer; text-align: left;
    font-family: inherit; font-size: inherit;
    transition: all 0.15s;
  }
  .podcast-card:hover {
    background: rgba(255,255,255,0.04);
    border-color: rgba(232,184,75,0.15);
  }
  .podcast-card.active {
    border-color: rgba(232,184,75,0.3);
    background: rgba(232,184,75,0.04);
  }
  .pc-icon { font-size: 32px; width: 44px; text-align: center; flex-shrink: 0; }
  .pc-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .pc-title {
    font-size: 14px; font-weight: 600;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .pc-show { font-size: 12px; color: #8B89A6; }
  .pc-meta { display: flex; gap: 12px; font-size: 11px; color: #5a5878; }
  .pc-play { color: #5a5878; flex-shrink: 0; transition: color 0.15s; }
  .podcast-card:hover .pc-play { color: #E8B84B; }
  @media (max-width: 768px) {
    .podcast-card { padding: 12px; }
    .pc-icon { font-size: 24px; width: 36px; }
  }
</style>