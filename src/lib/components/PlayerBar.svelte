<script lang="ts">
  import { player } from '../stores/player';
  import type { PlayerItem } from '../api/types';

  let showQueue = false;

  function onSeek(e: Event) { player.seek(+(e.target as HTMLInputElement).value); }
  function onVolume(e: Event) { player.setVolume(+(e.target as HTMLInputElement).value); }
  function toggleShuffle() { player.shuffle.update((s: boolean) => !s); }
  function toggleRepeat() {
    player.repeat.update((r: string) => r === 'none' ? 'all' : r === 'all' ? 'one' : 'none');
  }

  $: track = $player.currentTrack;
  $: progressPct = $player.progress * 100;
  $: dur = $player.duration && isFinite($player.duration) ? $player.duration : 0;
  $: cur = dur > 0 && $player.progress >= 0 ? Math.floor($player.progress * dur) : 0;
  $: timeStr = `${Math.floor(cur / 60)}:${String(cur % 60).padStart(2, '0')}`;
  $: totalStr = dur > 0 ? `${Math.floor(dur / 60)}:${String(Math.floor(dur % 60)).padStart(2, '0')}` : '--:--';
  $: queueItems = $player.queue;
  $: qIndex = $player.currentIndex;
  $: trackThumb = track ? ((track as any).thumbnail || '') : '';
  $: trackArtist = track ? ((track as any).artist || '') : '';
</script>

<footer class="player-bar" class:has-track={track}>
  <div class="pb-left">
    {#if track}
      <img class="pb-thumb" src={trackThumb} alt="" loading="lazy" />
      <div class="pb-info">
        <div class="pb-title">{track.title}</div>
        <div class="pb-artist">{trackArtist}</div>
      </div>
    {:else}
      <div class="pb-empty">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
        <span>No track playing</span>
      </div>
    {/if}
  </div>

  <div class="pb-center">
    <div class="pb-controls">
      <button class="pb-btn" on:click={toggleShuffle} class:active={$player.shuffle} title="Shuffle">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>
      </button>
      <button class="pb-btn" on:click={() => player.prev()} title="Previous">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
      </button>
      <button class="pb-btn pb-play" on:click={() => player.togglePlay()} disabled={$player.loading || !track}>
        {#if $player.loading}
          <div class="spinner-sm"></div>
        {:else if $player.playing}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>
        {:else}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        {/if}
      </button>
      <button class="pb-btn" on:click={() => player.next()} title="Next">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
      </button>
      <button class="pb-btn" on:click={toggleRepeat} class:active={$player.repeat !== 'none'} title="Repeat">
        {#if $player.repeat === 'one'}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/><circle cx="14" cy="12" r="1" fill="currentColor"/></svg>
        {:else}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>
        {/if}
      </button>
    </div>
    <div class="pb-progress">
      <span class="pb-time">{timeStr}</span>
      <div class="pb-bar-wrap">
        <input type="range" class="pb-bar" min="0" max="1" step="0.001"
          value={$player.progress} on:input={onSeek}
          style="--pct: {progressPct}%" />
      </div>
      <span class="pb-time">{totalStr}</span>
    </div>
  </div>

  <div class="pb-right">
    <button class="pb-btn" on:click={() => player.toggleMute()} title="Mute">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        {#if $player.muted || $player.volume === 0}
          <path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M23 9l-6 6M17 9l6 6"/>
        {:else if $player.volume < 0.5}
          <path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 010 7.07"/>
        {:else}
          <path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/>
        {/if}
      </svg>
    </button>
    <div class="pb-vol-wrap">
      <input type="range" class="pb-vol" min="0" max="1" step="0.01"
        value={$player.volume} on:input={onVolume}
        style="--pct: {$player.volume * 100}%" />
    </div>
    <button class="pb-btn queue-btn" on:click={() => showQueue = !showQueue} title="Queue" class:active={showQueue}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
      {#if queueItems.length > 0}
        <span class="queue-badge">{queueItems.length}</span>
      {/if}
    </button>
  </div>
</footer>

{#if showQueue}
  <div class="queue-panel">
    <div class="queue-header">
      <h3>Queue</h3>
      <button class="queue-close" on:click={() => showQueue = false}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </div>
    {#if queueItems.length === 0}
      <p class="queue-empty">Queue is empty</p>
    {:else}
      <div class="queue-list">
        {#each queueItems as item, i}
          <button class="queue-item" class:active={i === qIndex} on:click={() => player.play(item, queueItems)}>
            <img class="qi-thumb" src={item.thumbnail || ''} alt="" />
            <div class="qi-info">
              <span class="qi-title">{item.title || ''}</span>
              <span class="qi-artist">{item.artist || ''}</span>
            </div>
            {#if i === qIndex}
              <span class="qi-now">Now</span>
            {/if}
          </button>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  .player-bar {
    position: fixed; bottom: 0; left: 0; right: 0; height: 72px;
    background: rgba(12, 12, 24, 0.92);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-top: 1px solid rgba(255,255,255,0.04);
    display: flex; align-items: center; gap: 16px;
    padding: 0 16px; z-index: 200;
  }
  .player-bar.has-track { background: rgba(14, 14, 28, 0.95); }
  .pb-left { width: 260px; display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
  .pb-thumb { width: 44px; height: 44px; border-radius: 6px; object-fit: cover; flex-shrink: 0; }
  .pb-info { min-width: 0; }
  .pb-title { color: #F0EEF5; font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .pb-artist { color: #8B89A6; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .pb-empty { display: flex; align-items: center; gap: 8px; color: #5a5878; font-size: 12px; }
  .pb-center { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; max-width: 600px; margin: 0 auto; }
  .pb-controls { display: flex; align-items: center; gap: 12px; }
  .pb-btn { background: none; border: none; color: #8B89A6; cursor: pointer; padding: 4px; border-radius: 6px; display: flex; align-items: center; transition: all 0.12s; position: relative; }
  .pb-btn:hover { color: #F0EEF5; }
  .pb-btn.active { color: #E8B84B; }
  .pb-btn:disabled { opacity: 0.4; cursor: default; }
  .pb-play { width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.08); justify-content: center; }
  .pb-play:hover { background: rgba(255,255,255,0.14); color: #F0EEF5; }
  .spinner-sm { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.1); border-top-color: #F0EEF5; border-radius: 50%; animation: spin 0.6s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .pb-progress { display: flex; align-items: center; gap: 8px; width: 100%; }
  .pb-time { color: #5a5878; font-size: 10px; min-width: 32px; text-align: center; }
  .pb-bar-wrap { flex: 1; }
  .pb-bar { -webkit-appearance: none; appearance: none; width: 100%; height: 4px; border-radius: 2px; outline: none; cursor: pointer; background: linear-gradient(to right, #E8B84B 0%, #E8B84B var(--pct), rgba(255,255,255,0.06) var(--pct), rgba(255,255,255,0.06) 100%); }
  .pb-bar::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; background: #E8B84B; border-radius: 50%; border: none; cursor: pointer; box-shadow: 0 0 6px rgba(232,184,75,0.3); opacity: 0; transition: opacity 0.12s; }
  .pb-bar:hover::-webkit-slider-thumb, .pb-bar:active::-webkit-slider-thumb { opacity: 1; }
  .pb-bar::-moz-range-thumb { width: 12px; height: 12px; background: #E8B84B; border-radius: 50%; border: none; cursor: pointer; }
  .pb-right { width: 200px; display: flex; align-items: center; gap: 8px; justify-content: flex-end; flex-shrink: 0; }
  .pb-vol-wrap { width: 80px; }
  .pb-vol { -webkit-appearance: none; appearance: none; width: 100%; height: 4px; border-radius: 2px; outline: none; cursor: pointer; background: linear-gradient(to right, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.3) var(--pct), rgba(255,255,255,0.06) var(--pct), rgba(255,255,255,0.06) 100%); }
  .pb-vol::-webkit-slider-thumb { -webkit-appearance: none; width: 10px; height: 10px; background: #F0EEF5; border-radius: 50%; border: none; cursor: pointer; }
  .pb-vol::-moz-range-thumb { width: 10px; height: 10px; background: #F0EEF5; border-radius: 50%; border: none; cursor: pointer; }
  .queue-btn { position: relative; }
  .queue-badge { position: absolute; top: -2px; right: -2px; background: #E8B84B; color: #0c0c18; font-size: 9px; font-weight: 700; min-width: 14px; height: 14px; border-radius: 7px; display: flex; align-items: center; justify-content: center; line-height: 1; padding: 0 3px; }
  .queue-panel { position: fixed; bottom: 72px; right: 16px; width: 320px; max-height: 400px; background: #1a1a30; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; overflow: hidden; z-index: 300; box-shadow: 0 -4px 24px rgba(0,0,0,0.4); }
  .queue-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.04); }
  .queue-header h3 { color: #F0EEF5; font-size: 14px; font-weight: 600; margin: 0; }
  .queue-close { background: none; border: none; color: #5a5878; cursor: pointer; padding: 4px; border-radius: 4px; }
  .queue-close:hover { color: #F0EEF5; }
  .queue-empty { padding: 24px; text-align: center; color: #5a5878; font-size: 12px; }
  .queue-list { max-height: 330px; overflow-y: auto; }
  .queue-item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 8px 16px; background: none; border: none; color: #F0EEF5; cursor: pointer; text-align: left; transition: background 0.1s; }
  .queue-item:hover { background: rgba(255,255,255,0.03); }
  .queue-item.active { background: rgba(232,184,75,0.06); }
  .qi-thumb { width: 32px; height: 32px; border-radius: 4px; object-fit: cover; flex-shrink: 0; }
  .qi-info { flex: 1; min-width: 0; }
  .qi-title { display: block; font-size: 12px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .qi-artist { display: block; font-size: 10px; color: #8B89A6; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .qi-now { font-size: 10px; color: #E8B84B; font-weight: 600; }
  @media (max-width: 768px) {
    .player-bar { padding: 0 10px; gap: 8px; height: 64px; }
    .pb-left { width: auto; max-width: 120px; }
    .pb-thumb { width: 36px; height: 36px; }
    .pb-artist { display: none; }
    .pb-right { width: auto; }
    .pb-vol-wrap { display: none; }
    .queue-panel { right: 8px; left: 8px; width: auto; bottom: 64px; }
  }
</style>