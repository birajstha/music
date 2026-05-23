<script lang="ts">
  import { player } from '../stores/player';
  import { createPlaylist, addToPlaylist, playlists } from '../stores/playlists';
  import type { Track } from '../api/types';

  const { playing, loading, progress, duration, volume, muted,
          shuffle, repeat, currentTrack, error } = player;

  let showPlist = false;
  let newPlName = '';

  function onSeek(e: Event) { player.seek(+(e.target as HTMLInputElement).value); }
  function onVolume(e: Event) { player.setVolume(+(e.target as HTMLInputElement).value); }

  function addToNew() {
    if (!newPlName.trim() || !$currentTrack) return;
    const id = createPlaylist(newPlName.trim());
    addToPlaylist(id, $currentTrack as Track);
    newPlName = ''; showPlist = false;
  }

  function addTo(id: string) {
    if ($currentTrack) { addToPlaylist(id, $currentTrack as Track); showPlist = false; }
  }

  // WinAmp LCD-style time display
  $: dur = $duration && isFinite($duration) ? $duration : 0;
  $: cur = dur > 0 && $progress >= 0 ? Math.floor($progress * dur) : 0;
  $: timeStr = `${String(Math.floor(cur / 60)).padStart(2, '0')}:${String(cur % 60).padStart(2, '0')}`;
  $: totalStr = dur > 0 ? `${String(Math.floor(dur / 60)).padStart(2, '0')}:${String(Math.floor(dur % 60)).padStart(2, '0')}` : '--:--';
  $: trackTitle = $currentTrack?.title?.slice(0, 35) || '';
  $: trackArtist = $currentTrack ? (($currentTrack as any).artist || '').slice(0, 25) : '';
let isYT = $currentTrack?.source === 'youtube';
</script>

<!-- Hidden YouTube player -->
<div id="yt-hidden-player"></div>

<!-- WinAmp Main Window -->
<div class="winamp">
  <div class="wa-titlebar">
    <span class="wa-title">💊 ChillPill</span>
    <div class="wa-title-btns">
      <span class="wa-btn-min">_</span>
      <span class="wa-btn-close">✕</span>
    </div>
  </div>

  <div class="wa-display">
    <div class="wa-time">
      <span class="wa-lcd time-l">{timeStr}</span>
      <span class="wa-sep">-</span>
      <span class="wa-lcd time-r">{totalStr}</span>
    </div>
  </div>

  <!-- Progress slider (WinAmp style) -->
  <div class="wa-slider-row">
    <input type="range" class="wa-slider" min="0" max="1" step="0.001"
      value={$progress} on:input={onSeek}
      style="--pct: {$progress * 100}%" />
  </div>

  <!-- Track info -->
  <div class="wa-info">
    <div class="wa-scroll">
      <span class="wa-song">{trackTitle}</span>
      <span class="wa-dash">—</span>
      <span class="wa-artist">{trackArtist}</span>
    </div>
  </div>

  <!-- WinAmp Classic Buttons -->
  <div class="wa-buttons">
    <button class="wa-btn {!$shuffle ? '' : 'wa-on'}" on:click={() => shuffle.update(s => !s)} title="Shuffle">🔀</button>
    <button class="wa-btn" on:click={() => player.prev()} title="Previous">◄◄</button>
    <button class="wa-btn wa-play" on:click={() => player.togglePlay()} disabled={$loading}>
      {$loading ? '⏳' : $playing ? '■' : '►'}
    </button>
    <button class="wa-btn" on:click={() => player.next()} title="Next">►►</button>
    <button class="wa-btn {!$repeat || $repeat === 'none' ? '' : 'wa-on'}"
      on:click={() => repeat.update(r => r === 'none' ? 'all' : r === 'all' ? 'one' : 'none')} title="Repeat">
      {$repeat === 'one' ? '🔂' : '🔁'}
    </button>
    <button class="wa-btn" on:click={() => showPlist = !showPlist} title="Playlist">PL</button>
  </div>

  <!-- Volume -->
  <div class="wa-vol-row">
    <span class="wa-vol-icon">{$muted ? '🔇' : $volume < 0.3 ? '🔈' : $volume < 0.7 ? '🔉' : '🔊'}</span>
    <input type="range" class="wa-slider wa-vol" min="0" max="1" step="0.01"
      value={$volume} on:input={onVolume} on:click={() => muted.set(false)}
      style="--pct: {$volume * 100}%" />
  </div>

  <!-- Status bar -->
  <div class="wa-status">
    <span class="wa-status-text">
      {#if $error}⚠️ {$error}
      {:else if $loading}⏳ Buffering...
      {:else if $currentTrack}▶ Playing
      {:else}💊 Ready
      {/if}
    </span>
    <span class="wa-status-right">{isYT ? '🎬 YT' : $currentTrack?._type === 'radio' ? '📻 FM' : $currentTrack?._type === 'podcast' ? '🎙️' : ''}</span>
  </div>
</div>

<!-- Playlist popup -->
{#if showPlist}
  <div class="wa-plist">
    <div class="wa-plist-header">📋 Playlist</div>
    <div class="wa-plist-items">
      {#each $playlists as pl}
        <button class="wa-plist-item" on:click={() => addTo(pl.id)}>
          🎶 {pl.name} <span class="wa-plist-count">{pl.tracks.length}</span>
        </button>
      {/each}
    </div>
    <div class="wa-plist-new">
      <input type="text" bind:value={newPlName} placeholder="New playlist..."
        on:keydown={(e) => e.key === 'Enter' && addToNew()} />
      <button on:click={addToNew}>+</button>
    </div>
  </div>
{/if}

<style>
  :global(#yt-hidden-player) { position: absolute; width: 0; height: 0; opacity: 0; pointer-events: none; }

  .winamp {
    position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
    width: 380px; background: #1a1a2e; border: 2px solid #3a3a5a;
    border-bottom: none; border-radius: 6px 6px 0 0;
    font-family: 'Courier New', monospace; z-index: 100;
    box-shadow: 0 -4px 20px rgba(0,0,0,0.5);
  }

  /* Title bar */
  .wa-titlebar {
    background: linear-gradient(to right, #0d0d2b, #1a1a3e); padding: 4px 8px;
    display: flex; justify-content: space-between; align-items: center;
    border-bottom: 1px solid #2a2a4a;
  }
  .wa-title { color: #00FF00; font-size: 11px; font-weight: bold; letter-spacing: 1px; }
  .wa-title-btns { display: flex; gap: 6px; }
  .wa-btn-min, .wa-btn-close { color: #666; font-size: 10px; cursor: pointer; font-weight: bold; }
  .wa-btn-close { color: #e74c3c; }

  /* LCD Display */
  .wa-display {
    background: #0a0a14; padding: 8px 12px 4px; text-align: center;
    border-bottom: 1px solid #2a2a4a;
  }
  .wa-time { display: flex; justify-content: center; gap: 6px; }
  .wa-lcd {
    background: #050510; color: #00FF00; font-size: 22px; font-weight: bold;
    font-family: 'Courier New', monospace; padding: 2px 6px;
    text-shadow: 0 0 6px rgba(0,255,0,0.3); min-width: 52px;
  }
  .wa-sep { color: #00FF00; font-size: 22px; line-height: 28px; }

  /* Slider */
  .wa-slider-row { padding: 4px 12px 2px; }
  .wa-slider {
    -webkit-appearance: none; appearance: none; width: 100%; height: 6px;
    outline: none; cursor: pointer; border-radius: 2px;
    background: linear-gradient(to right, #00FF00 0%, #00FF00 var(--pct), #2a2a4a var(--pct), #2a2a4a 100%);
  }
  .wa-slider::-webkit-slider-thumb {
    -webkit-appearance: none; width: 10px; height: 14px; background: #aaa;
    border: 1px solid #666; border-radius: 2px; cursor: pointer;
  }
  .wa-slider::-moz-range-thumb {
    width: 10px; height: 14px; background: #aaa; border: 1px solid #666;
    border-radius: 2px; cursor: pointer;
  }
  .wa-vol { height: 4px; }
  .wa-vol::-webkit-slider-thumb { width: 8px; height: 12px; }
  .wa-vol::-moz-range-thumb { width: 8px; height: 12px; }

  /* Track info */
  .wa-info {
    background: #14142a; padding: 2px 12px; overflow: hidden;
    border-bottom: 1px solid #2a2a4a;
  }
  .wa-scroll { display: flex; gap: 4px; white-space: nowrap; overflow: hidden; }
  .wa-song { color: #00FF00; font-size: 11px; font-weight: bold; }
  .wa-dash { color: #888; font-size: 11px; }
  .wa-artist { color: #ccc; font-size: 11px; }

  /* Buttons */
  .wa-buttons {
    display: flex; gap: 6px; padding: 6px 12px; justify-content: center;
    border-bottom: 1px solid #2a2a4a;
  }
  .wa-btn {
    background: #2a2a4a; border: 1px solid #4a4a6a; color: #aaa;
    padding: 4px 8px; font-size: 11px; cursor: pointer; border-radius: 3px;
    font-family: 'Courier New', monospace; min-width: 32px; text-align: center;
    transition: background 0.1s;
  }
  .wa-btn:hover { background: #3a3a5a; color: #fff; }
  .wa-on { color: #00FF00; border-color: #00FF00; }
  .wa-play { background: #0a3a0a; color: #00FF00; font-size: 13px; min-width: 40px; }
  .wa-play:disabled { opacity: 0.5; }

  /* Volume */
  .wa-vol-row { display: flex; align-items: center; gap: 6px; padding: 4px 12px 6px; }
  .wa-vol-icon { font-size: 10px; width: 16px; }

  /* Status */
  .wa-status {
    background: #0d0d2b; padding: 3px 8px; display: flex; justify-content: space-between;
    border-top: 1px solid #2a2a4a;
  }
  .wa-status-text { color: #888; font-size: 9px; }
  .wa-status-right { color: #555; font-size: 9px; }

  /* Playlist popup */
  .wa-plist {
    position: fixed; bottom: 220px; left: 50%; transform: translateX(-50%);
    width: 340px; background: #1a1a2e; border: 2px solid #3a3a5a;
    border-radius: 6px; z-index: 200; padding: 8px;
  }
  .wa-plist-header { color: #00FF00; font-size: 11px; font-weight: bold; padding: 4px 8px; border-bottom: 1px solid #2a2a4a; margin-bottom: 6px; }
  .wa-plist-items { max-height: 200px; overflow-y: auto; }
  .wa-plist-item { display: flex; justify-content: space-between; width: 100%; background: none; border: none; color: #aaa; padding: 4px 8px; font-size: 11px; cursor: pointer; text-align: left; font-family: monospace; }
  .wa-plist-item:hover { background: #2a2a4a; color: #fff; }
  .wa-plist-count { color: #555; font-size: 10px; }
  .wa-plist-new { display: flex; gap: 4px; margin-top: 6px; }
  .wa-plist-new input { flex: 1; background: #0a0a14; border: 1px solid #2a2a4a; color: #00FF00; padding: 4px 8px; font-size: 11px; font-family: monospace; }
  .wa-plist-new button { background: #00FF00; color: #000; border: none; padding: 4px 8px; cursor: pointer; font-weight: bold; font-family: monospace; }

  @media (max-width: 768px) {
    .winamp { width: 100%; left: 0; transform: none; border-radius: 0; bottom: 60px; }
    .wa-plist { left: 5%; width: 90%; transform: none; bottom: 200px; }
  }
</style>