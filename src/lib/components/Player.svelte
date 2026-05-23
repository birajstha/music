<script lang="ts">
  import { player } from '../stores/player';
  import { formatDuration } from '../api/piped';

  const { playing, loading, progress, duration, volume, muted,
          shuffle, repeat, dataSaver, currentTrack, error } = player;

  let progressBar: HTMLDivElement;

  function hideImg(e: Event) { (e.target as HTMLElement).style.display = 'none'; }

  function onProgressClick(e: MouseEvent) {
    const rect = progressBar.getBoundingClientRect();
    player.seek((e.clientX - rect.left) / rect.width);
  }

  function onVolumeChange(e: Event) {
    player.setVolume(+(e.target as HTMLInputElement).value);
  }

  $: elapsed = $duration ? formatDuration(Math.floor($progress * $duration)) : '0:00';
  $: total = $duration ? formatDuration(Math.floor($duration)) : '0:00';
  $: repeatIcon = $repeat === 'none' ? '🔁' : $repeat === 'one' ? '🔂' : '🔁';
  $: repeatActive = $repeat !== 'none';

  // Avoid `as any` casts in template — compute here
  $: trackThumb = $currentTrack ? ($currentTrack as any).thumbnail || ($currentTrack as any).thumbnailUrl || '' : '';
  $: trackArtist = $currentTrack ? (($currentTrack as any).artist || ($currentTrack as any).showName || '') : '';
</script>

{#if $currentTrack}
<div class="player">
  <!-- Track info -->
  <div class="player-info">
    <img class="player-thumb" src={trackThumb} alt={$currentTrack.title} on:error={hideImg} />
    <div class="player-meta">
      <span class="player-title">{$currentTrack.title}</span>
      <span class="player-artist">{trackArtist}</span>
    </div>
  </div>

  <!-- Controls -->
  <div class="player-center">
    <div class="player-controls">
      <button class="ctrl-btn {$shuffle ? 'active' : ''}" on:click={() => shuffle.update(s => !s)} title="Shuffle">🔀</button>
      <button class="ctrl-btn" on:click={() => player.prev()} title="Previous">⏮</button>
      <button class="play-btn" on:click={() => player.togglePlay()} disabled={$loading}>
        {#if $loading}⏳{:else if $playing}⏸{:else}▶{/if}
      </button>
      <button class="ctrl-btn" on:click={() => player.next()} title="Next">⏭</button>
      <button class="ctrl-btn {repeatActive ? 'active' : ''}"
        on:click={() => repeat.update(r => r === 'none' ? 'all' : r === 'all' ? 'one' : 'none')}
        title="Repeat">{repeatIcon}</button>
    </div>
    <!-- Progress bar -->
    <div class="progress-row">
      <span class="time">{elapsed}</span>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="progress-bar" bind:this={progressBar} on:click={onProgressClick}>
        <div class="progress-fill" style="width: {$progress * 100}%"></div>
      </div>
      <span class="time">{total}</span>
    </div>
  </div>

  <!-- Volume + extras -->
  <div class="player-right">
    {#if $error}<span class="player-err" title={$error}>⚠️</span>{/if}
    <button class="ctrl-btn" on:click={() => player.toggleMute()} title="Mute">
      {$muted || $volume === 0 ? '🔇' : $volume < 0.5 ? '🔉' : '🔊'}
    </button>
    <input type="range" min="0" max="1" step="0.01" value={$volume}
      on:input={onVolumeChange} class="volume-slider" />
    <button class="ctrl-btn {$dataSaver ? 'active' : ''}"
      on:click={() => dataSaver.update(d => !d)} title="Data Saver">
      {$dataSaver ? '🌿' : '📶'}
    </button>
  </div>
</div>
{/if}

<style>
  .player {
    position: fixed; bottom: 0; left: 0; right: 0; height: 80px;
    background: #181823; border-top: 1px solid #2a2a3a;
    display: flex; align-items: center; padding: 0 16px; gap: 16px;
    z-index: 100;
  }
  .player-info { display: flex; align-items: center; gap: 12px; width: 240px; min-width: 180px; overflow: hidden; }
  .player-thumb { width: 48px; height: 48px; border-radius: 6px; object-fit: cover; flex-shrink: 0; background: #2a2a3a; }
  .player-meta { overflow: hidden; }
  .player-title { display: block; color: #fff; font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .player-artist { display: block; color: #b3b3b3; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .player-center { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .player-controls { display: flex; align-items: center; gap: 16px; }
  .ctrl-btn { background: none; border: none; color: #b3b3b3; font-size: 16px; cursor: pointer; padding: 4px; transition: color 0.15s; }
  .ctrl-btn:hover, .ctrl-btn.active { color: #7c5cbf; }
  .play-btn { width: 40px; height: 40px; border-radius: 50%; background: #1db954; border: none; color: #000; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.1s; }
  .play-btn:hover { transform: scale(1.05); }
  .play-btn:disabled { opacity: 0.6; cursor: default; }

  .progress-row { display: flex; align-items: center; gap: 8px; width: 100%; max-width: 500px; }
  .time { color: #b3b3b3; font-size: 11px; min-width: 32px; }
  .progress-bar { flex: 1; height: 4px; background: #3a3a4a; border-radius: 2px; cursor: pointer; position: relative; }
  .progress-bar:hover { height: 6px; }
  .progress-fill { height: 100%; background: #1db954; border-radius: 2px; transition: width 0.1s linear; }

  .player-right { display: flex; align-items: center; gap: 8px; width: 200px; justify-content: flex-end; }
  .volume-slider { width: 80px; accent-color: #7c5cbf; cursor: pointer; }
  .player-err { font-size: 14px; cursor: help; }

  @media (max-width: 768px) {
    .player { height: 64px; padding: 0 12px; gap: 8px; bottom: 60px; }
    .player-info { width: auto; flex: 1; }
    .player-right { display: none; }
    .progress-row { max-width: 200px; }
    .ctrl-btn { font-size: 14px; }
  }
</style>
