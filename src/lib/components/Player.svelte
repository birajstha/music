<script lang="ts">
  import { player } from '../stores/player';
  import { formatDuration } from '../api/music';
  import { createPlaylist, addToPlaylist, playlists } from '../stores/playlists';
  import type { Track } from '../api/types';

  const { playing, loading, progress, duration, volume, muted,
          shuffle, repeat, currentTrack, error } = player;

  let showAddMenu = false;
  let newPlaylistName = '';

  function hideImg(e: Event) { (e.target as HTMLElement).style.display = 'none'; }

  function onSeek(e: Event) {
    const val = +(e.target as HTMLInputElement).value;
    player.seek(val);
  }

  function onVolumeChange(e: Event) {
    player.setVolume(+(e.target as HTMLInputElement).value);
  }

  $: elapsed = $duration && isFinite($duration) ? formatDuration(Math.floor($progress * $duration)) : '--:--';
  $: total = $duration && isFinite($duration) ? formatDuration(Math.floor($duration)) : 'LIVE';
  $: repeatIcon = $repeat === 'none' ? '🔁' : $repeat === 'one' ? '🔂' : '🔁';
  $: repeatActive = $repeat !== 'none';
  $: trackThumb = $currentTrack ? ($currentTrack as any).thumbnail || '' : '';
  $: trackArtist = $currentTrack ? (($currentTrack as any).artist || ($currentTrack as any).showName || '') : '';
  $: isRadio = $currentTrack?._type === 'radio';
  $: isPodcast = $currentTrack?._type === 'podcast';

  function addToNewPlaylist() {
    if (!newPlaylistName.trim() || !$currentTrack) return;
    const id = createPlaylist(newPlaylistName.trim());
    addToPlaylist(id, $currentTrack as Track);
    newPlaylistName = '';
    showAddMenu = false;
  }

  function addToExistingPlaylist(id: string) {
    if ($currentTrack) {
      addToPlaylist(id, $currentTrack as Track);
      showAddMenu = false;
    }
  }
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
    {#if !isRadio && !isPodcast}
      <div class="add-menu-wrap">
        <button class="add-btn" on:click={() => showAddMenu = !showAddMenu}>➕</button>
        {#if showAddMenu}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div class="add-menu" on:click|stopPropagation>
            <p class="menu-title">Add to Playlist</p>
            {#each $playlists as pl}
              <button class="menu-item" on:click={() => addToExistingPlaylist(pl.id)}>{pl.name}</button>
            {/each}
            <div class="menu-new">
              <input type="text" bind:value={newPlaylistName} placeholder="New playlist..."
                on:keydown={(e) => e.key === 'Enter' && addToNewPlaylist()} />
              <button on:click={addToNewPlaylist}>+</button>
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Controls -->
  <div class="player-center">
    <div class="player-controls">
      <button class="ctrl-btn {$shuffle ? 'active' : ''}" on:click={() => shuffle.update(s => !s)}>🔀</button>
      <button class="ctrl-btn" on:click={() => player.prev()}>⏮</button>
      <button class="play-btn" on:click={() => player.togglePlay()} disabled={$loading}>
        {#if $loading}⏳{:else if $playing}⏸{:else}▶{/if}
      </button>
      <button class="ctrl-btn" on:click={() => player.next()}>⏭</button>
      <button class="ctrl-btn {repeatActive ? 'active' : ''}"
        on:click={() => repeat.update(r => r === 'none' ? 'all' : r === 'all' ? 'one' : 'none')}>{repeatIcon}</button>
    </div>
    <div class="progress-row">
      <span class="time">{elapsed}</span>
      <input type="range" class="progress-slider" min="0" max="1" step="0.001"
        value={$progress} on:input={onSeek}
        disabled={isRadio}
        style="background: linear-gradient(to right, #7c5cbf 0%, #7c5cbf {$progress * 100}%, #3a3a4a {$progress * 100}%, #3a3a4a 100%);" />
      <span class="time">{total}</span>
    </div>
  </div>

  <!-- Volume -->
  <div class="player-right">
    {#if $error}<span class="player-err" title={$error}>⚠️</span>{/if}
    <button class="ctrl-btn" on:click={() => player.toggleMute()}>
      {$muted || $volume === 0 ? '🔇' : $volume < 0.5 ? '🔉' : '🔊'}
    </button>
    <input type="range" class="volume-slider" min="0" max="1" step="0.01"
      value={$volume} on:input={onVolumeChange} />
  </div>
</div>
{/if}

<style>
  .player {
    position: fixed; bottom: 0; left: 0; right: 0; height: 80px;
    background: #120f1a; border-top: 1px solid #2a2a3a;
    display: flex; align-items: center; padding: 0 16px; gap: 16px;
    z-index: 100;
  }
  .player-info { display: flex; align-items: center; gap: 12px; width: 260px; min-width: 180px; overflow: visible; position: relative; }
  .player-thumb { width: 48px; height: 48px; border-radius: 6px; object-fit: cover; flex-shrink: 0; background: #2a2a3a; }
  .player-meta { overflow: hidden; flex: 1; }
  .player-title { display: block; color: #fff; font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .player-artist { display: block; color: #aaa; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .add-btn { background: none; border: 1px solid #555; color: #aaa; font-size: 12px; border-radius: 4px; padding: 2px 6px; cursor: pointer; flex-shrink: 0; }
  .add-btn:hover { border-color: #7c5cbf; color: #7c5cbf; }
  .add-menu-wrap { position: relative; }
  .add-menu {
    position: absolute; bottom: 100%; left: 0; margin-bottom: 8px;
    background: #1e1e30; border: 1px solid #2a2a3a; border-radius: 10px;
    padding: 10px; min-width: 200px; z-index: 200;
  }
  .menu-title { color: #aaa; font-size: 11px; margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.5px; }
  .menu-item { display: block; width: 100%; background: none; border: none; color: #fff; padding: 6px 8px; text-align: left; cursor: pointer; border-radius: 4px; font-size: 12px; }
  .menu-item:hover { background: #2a2a3a; }
  .menu-new { display: flex; gap: 4px; margin-top: 6px; }
  .menu-new input { flex: 1; background: #0a0a0f; border: 1px solid #2a2a3a; border-radius: 4px; color: #fff; padding: 4px 8px; font-size: 12px; }
  .menu-new button { background: #7c5cbf; border: none; color: #fff; border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 12px; }

  .player-center { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; max-width: 600px; margin: 0 auto; }
  .player-controls { display: flex; align-items: center; gap: 16px; }
  .ctrl-btn { background: none; border: none; color: #aaa; font-size: 16px; cursor: pointer; padding: 4px; transition: color 0.15s; }
  .ctrl-btn:hover, .ctrl-btn.active { color: #7c5cbf; }
  .play-btn { width: 36px; height: 36px; border-radius: 50%; background: #7c5cbf; border: none; color: #fff; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.1s; }
  .play-btn:hover { transform: scale(1.05); background: #9370d8; }
  .play-btn:disabled { opacity: 0.5; }

  .progress-row { display: flex; align-items: center; gap: 8px; width: 100%; }
  .time { color: #aaa; font-size: 11px; min-width: 30px; }
  .progress-slider {
    -webkit-appearance: none; appearance: none;
    flex: 1; height: 4px; border-radius: 2px; outline: none; cursor: pointer;
    transition: height 0.1s;
  }
  .progress-slider:hover { height: 6px; }
  .progress-slider:disabled { opacity: 0.4; cursor: default; }
  .progress-slider::-webkit-slider-thumb {
    -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%;
    background: #7c5cbf; cursor: pointer; border: 2px solid #fff;
  }
  .progress-slider::-moz-range-thumb {
    width: 12px; height: 12px; border-radius: 50%;
    background: #7c5cbf; cursor: pointer; border: 2px solid #fff;
  }

  .player-right { display: flex; align-items: center; gap: 8px; width: 160px; justify-content: flex-end; }
  .volume-slider { width: 70px; accent-color: #7c5cbf; cursor: pointer; }
  .player-err { font-size: 12px; cursor: help; }

  @media (max-width: 768px) {
    .player { height: 64px; padding: 0 10px; gap: 6px; bottom: 60px; }
    .player-info { width: auto; flex: 1; }
    .player-right { display: none; }
    .progress-row { max-width: 180px; }
    .ctrl-btn { font-size: 14px; }
    .add-menu-wrap { display: none; }
  }
</style>