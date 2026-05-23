<script lang="ts">
  import type { Track } from '../api/types';
  import { player } from '../stores/player';

  export let track: Track;
  export let queue: Track[] = [];
  export let active = false;

  function playTrack() {
    const items = (queue.length ? queue : [track]).map(t => ({ ...t, _type: 'track' as const }));
    player.play({ ...track, _type: 'track' }, items);
  }

  function handleImgError(e: Event) {
    const el = e.target as HTMLImageElement;
    el.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect fill='%23141428'/%3E%3C/svg%3E";
  }
</script>

<button class="track-card {active ? 'active' : ''}" on:click={playTrack}>
  <div class="thumb-wrap">
    <img class="thumb" src={track.thumbnail} alt={track.title} on:error={handleImgError} loading="lazy" />
    <div class="overlay">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
    </div>
  </div>
  <div class="info">
    <p class="title">{track.title}</p>
    <p class="artist">{track.artist}</p>
  </div>
</button>

<style>
  .track-card {
    background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04);
    border-radius: 10px; overflow: hidden; cursor: pointer;
    transition: all 0.2s; text-align: left; width: 100%; padding: 0;
    font-family: inherit; color: inherit;
  }
  .track-card:hover {
    background: rgba(255,255,255,0.04);
    border-color: rgba(232,184,75,0.15);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  }
  .track-card.active {
    border-color: rgba(232,184,75,0.3);
    background: rgba(232,184,75,0.04);
  }
  .thumb-wrap { position: relative; aspect-ratio: 1; overflow: hidden; }
  .thumb { width: 100%; height: 100%; object-fit: cover; display: block; }
  .overlay {
    position: absolute; inset: 0;
    background: rgba(0,0,0,0.5);
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.15s; color: #F0EEF5;
  }
  .track-card:hover .overlay { opacity: 1; }
  .info { padding: 10px 12px 12px; }
  .title {
    font-size: 13px; font-weight: 600; color: #F0EEF5; margin: 0 0 3px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .artist {
    font-size: 11px; color: #8B89A6; margin: 0;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
</style>