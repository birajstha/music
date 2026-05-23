import { writable, derived, get } from 'svelte/store';
import { player } from './player';
import type { Track } from '../api/types';
import type { Playlist, TrackItem } from '../api/types';

const STORAGE_KEY = 'chillpill_playlists';

function load(): Playlist[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

function save(pl: Playlist[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pl));
}

export const playlists = writable<Playlist[]>(load());

export const playlistCount = derived(playlists, $p =>
  $p.reduce((s, pl) => s + pl.tracks.length, 0)
);

export function createPlaylist(name: string): string {
  const id = `pl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  playlists.update(p => {
    const updated = [...p, { id, name, tracks: [], createdAt: Date.now() }];
    save(updated);
    return updated;
  });
  return id;
}

export function deletePlaylist(id: string) {
  playlists.update(p => {
    const updated = p.filter(x => x.id !== id);
    save(updated);
    return updated;
  });
}

export function renamePlaylist(id: string, name: string) {
  playlists.update(p => {
    const updated = p.map(x => x.id === id ? { ...x, name } : x);
    save(updated);
    return updated;
  });
}

export function addToPlaylist(playlistId: string, track: Track) {
  playlists.update(p => {
    const updated = p.map(pl => {
      if (pl.id !== playlistId) return pl;
      if (pl.tracks.some(t => t.id === track.id)) return pl;
      return {
        ...pl,
        tracks: [...pl.tracks, { ...track, addedAt: Date.now() } as TrackItem],
      };
    });
    save(updated);
    return updated;
  });
}

export function removeFromPlaylist(playlistId: string, trackId: string) {
  playlists.update(p => {
    const updated = p.map(pl => {
      if (pl.id !== playlistId) return pl;
      return { ...pl, tracks: pl.tracks.filter(t => t.id !== trackId) };
    });
    save(updated);
    return updated;
  });
}

// Parse a YouTube URL to extract video ID
export function parseYouTubeUrl(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m?.[1]) return m[1];
  }
  return null;
}

// Add a YouTube link to a playlist (fetches metadata from our proxy)
export async function addYouTubeLinkToPlaylist(playlistId: string, url: string): Promise<string | null> {
  const videoId = parseYouTubeUrl(url);
  if (!videoId) return 'Invalid YouTube URL';

  try {
    const res = await fetch(`/api/youtube/video?id=${videoId}`, {
      signal: AbortSignal.timeout(8000),
    });
    const data = await res.json();
    let track: Track;

    if (data.items?.length) {
      const v = data.items[0];
      track = {
        id: videoId,
        title: v.snippet?.title || 'Unknown',
        artist: v.snippet?.channelTitle || 'YouTube',
        thumbnail: v.snippet?.thumbnails?.high?.url
          || v.snippet?.thumbnails?.medium?.url
          || v.snippet?.thumbnails?.default?.url
          || '',
        duration: 0,
        source: 'youtube',
      };
    } else {
      // Fallback: just store the ID
      track = {
        id: videoId, title: 'YouTube Video', artist: 'YouTube',
        thumbnail: '', duration: 0, source: 'youtube',
      };
    }

    addToPlaylist(playlistId, track);
    return null; // success
  } catch {
    // Add with minimal info
    addToPlaylist(playlistId, {
      id: videoId, title: url, artist: 'YouTube',
      thumbnail: '', duration: 0, source: 'youtube',
    });
    return null;
  }
}

// Play all tracks in a playlist
export function playPlaylist(pl: Playlist, startIndex = 0) {
  const items = pl.tracks.map(t => ({ ...t, _type: 'track' as const }));
  if (items.length === 0) return;
  player.play(items[startIndex], items);
}