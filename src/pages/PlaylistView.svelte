<script lang="ts">
  import { onMount } from 'svelte';
  import { playlists, removeFromPlaylist, playPlaylist } from '../lib/stores/playlists';
  import { player } from '../lib/stores/player';
  import { getVideoInfo, getVideoUrl } from '../lib/api/music';

  export let playlistId: string;
  export let onNavigate: (p: string) => void;

  let playlist = $playlists.find(p => p.id === playlistId);

  $: if (playlistId) {
    playlist = $playlists.find(p => p.id === playlistId);
  }

  function playAll() {
    if (playlist) playPlaylist(playlist);
  }

  function playTrack(index: number) {
    if (playlist) playPlaylist(playlist, index);
  }

  function remove(index: number) {
    if (playlist && playlist.tracks[index]) {
      removeFromPlaylist(playlistId, playlist.tracks[index].id);
    }
  }
</script>

<div class="page">
  {#if playlist}
    <div class="header">
      <div class="header-art">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.4">
          <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
        </svg>
      </div>
      <div class="header-info">
        <span class="label">Playlist</span>
        <h1>{playlist.name}</h1>
        <p class="meta">{playlist.tracks.length} {playlist.tracks.length === 1 ? 'track' : 'tracks'}</p>
      </div>
    </div>

    <div class="actions">
      <button class="play-all-btn" on:click={playAll} disabled={playlist.tracks.length === 0}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        Play all
      </button>
    </div>

    {#if playlist.tracks.length === 0}
      <div class="empty">
        <p>This playlist is empty</p>
        <p class="hint">Add YouTube links from the sidebar</p>
      </div>
    {:else}
      <div class="track-list">
        {#each playlist.tracks as track, i}
          <button class="track-row" on:click={() => playTrack(i)}>
            <span class="tr-index">{i + 1}</span>
            <img class="tr-thumb" src={track.thumbnail || ''} alt="" loading="lazy" />
            <div class="tr-info">
              <span class="tr-title">{track.title}</span>
              <span class="tr-artist">{track.artist}</span>
            </div>
            <span class="tr-source">YouTube</span>
            <button class="tr-remove" on:click|stopPropagation={() => remove(i)} title="Remove from playlist">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </button>
        {/each}
      </div>
    {/if}
  {:else}
    <div class="empty">
      <p>Playlist not found</p>
      <button class="back-link" on:click={() => onNavigate('home')}>Go home</button>
    </div>
  {/if}
</div>

<style>
  .page { padding: 32px; max-width: 800px; margin: 0 auto; }
  .header { display: flex; align-items: flex-end; gap: 20px; margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.04); }
  .header-art { width: 80px; height: 80px; background: rgba(255,255,255,0.04); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .header-info { flex: 1; }
  .label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #8B89A6; font-weight: 600; }
  .header-info h1 { color: #F0EEF5; font-size: 28px; font-weight: 700; margin: 4px 0; }
  .meta { color: #8B89A6; font-size: 13px; }
  .actions { margin-bottom: 16px; }
  .play-all-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 24px; background: rgba(232,184,75,0.12); border: none;
    border-radius: 24px; color: #E8B84B; font-size: 14px; font-weight: 500; cursor: pointer;
    transition: background 0.15s;
  }
  .play-all-btn:hover { background: rgba(232,184,75,0.2); }
  .play-all-btn:disabled { opacity: 0.4; cursor: default; }
  .empty { text-align: center; padding: 64px 0; }
  .empty p { color: #8B89A6; font-size: 14px; }
  .empty .hint { color: #5a5878; font-size: 12px; margin-top: 4px; }
  .back-link { background: none; border: none; color: #E8B84B; cursor: pointer; font-size: 13px; margin-top: 8px; }
  .track-list { display: flex; flex-direction: column; }
  .track-row {
    display: flex; align-items: center; gap: 12px;
    width: 100%; padding: 8px 12px;
    background: none; border: none; color: #F0EEF5; cursor: pointer;
    text-align: left; border-radius: 8px;
    transition: background 0.1s;
  }
  .track-row:hover { background: rgba(255,255,255,0.03); }
  .tr-index { width: 24px; color: #5a5878; font-size: 12px; text-align: center; flex-shrink: 0; }
  .tr-thumb { width: 40px; height: 40px; border-radius: 4px; object-fit: cover; flex-shrink: 0; }
  .tr-info { flex: 1; min-width: 0; }
  .tr-title { display: block; font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tr-artist { display: block; font-size: 11px; color: #8B89A6; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tr-source { font-size: 10px; color: #5a5878; flex-shrink: 0; }
  .tr-remove {
    background: none; border: none; color: #5a5878; cursor: pointer;
    padding: 4px; border-radius: 4px; opacity: 0; transition: all 0.1s;
  }
  .track-row:hover .tr-remove { opacity: 1; }
  .tr-remove:hover { color: #e74c3c; }
  @media (max-width: 768px) {
    .page { padding: 16px; }
    .header { gap: 12px; }
    .header-art { width: 56px; height: 56px; }
    .header-art svg { width: 32px; height: 32px; }
    .header-info h1 { font-size: 22px; }
  }
</style>