<script lang="ts">
  import type { Track } from '../api/types';
  import { player } from '../stores/player';
  import { formatDuration } from '../api/music';

  export let track: Track;
  export let queue: Track[] = [];
  export let active = false;

  function playTrack() {
    const items = (queue.length ? queue : [track]).map(t => ({ ...t, _type: 'track' as const }));
    player.play({ ...track, _type: 'track' }, items);
  }

  function handleImgError(e: Event) {
    const el = e.target as HTMLImageElement;
    el.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect fill='%23141420'/%3E%3C/svg%3E";
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="track-card {active ? 'active' : ''}" on:click={playTrack}>
  <div class="thumb-wrap">
    <img class="thumb" src={track.thumbnail} alt={track.title} on:error={handleImgError} />
    <div class="overlay">
      <span class="play-icon">{active ? '▶' : '▶'}</span>
    </div>
  </div>
  <div class="info">
    <p class="title">{track.title}</p>
    <p class="artist">{track.artist}</p>
    <p class="duration">{formatDuration(track.duration)}</p>
  </div>
</div>

<style>
  .track-card {
    background: #141420; border-radius: 10px; overflow: hidden;
    cursor: pointer; transition: background 0.15s, transform 0.15s;
  }
  .track-card:hover { background: #1e1e30; transform: translateY(-2px); }
  .track-card.active { background: #1e1e30; outline: 2px solid #7c5cbf; }
  .thumb-wrap { position: relative; aspect-ratio: 1; overflow: hidden; }
  .thumb { width: 100%; height: 100%; object-fit: cover; display: block; }
  .overlay {
    position: absolute; inset: 0; background: rgba(0,0,0,0.4);
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.15s;
  }
  .track-card:hover .overlay { opacity: 1; }
  .play-icon { font-size: 32px; color: #fff; text-shadow: 0 2px 8px rgba(0,0,0,0.8); }
  .info { padding: 10px 12px 12px; }
  .title { color: #fff; font-size: 13px; font-weight: 600; margin: 0 0 4px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .artist { color: #b3b3b3; font-size: 11px; margin: 0 0 4px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .duration { color: #666; font-size: 11px; margin: 0; }
</style>
