import { writable, derived, get } from 'svelte/store';
import type { Track } from '../api/types';

export interface Playlist {
  id: string;
  name: string;
  tracks: (Track & { addedAt: number })[];
  createdAt: number;
}

// Load from localStorage
function loadPlaylists(): Playlist[] {
  try {
    const raw = localStorage.getItem('evanie_playlists');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function savePlaylists(playlists: Playlist[]) {
  try {
    localStorage.setItem('evanie_playlists', JSON.stringify(playlists));
  } catch { /* quota exceeded */ }
}

export const playlists = writable<Playlist[]>(loadPlaylists());

export function createPlaylist(name: string): string {
  const id = `pl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  playlists.update(pl => {
    const updated = [...pl, { id, name, tracks: [], createdAt: Date.now() }];
    savePlaylists(updated);
    return updated;
  });
  return id;
}

export function deletePlaylist(id: string) {
  playlists.update(pl => {
    const updated = pl.filter(p => p.id !== id);
    savePlaylists(updated);
    return updated;
  });
}

export function addToPlaylist(playlistId: string, track: Track) {
  playlists.update(pl => {
    const updated = pl.map(p => {
      if (p.id !== playlistId) return p;
      // Don't duplicate
      if (p.tracks.some(t => t.id === track.id)) return p;
      return { ...p, tracks: [...p.tracks, { ...track, addedAt: Date.now() }] };
    });
    savePlaylists(updated);
    return updated;
  });
}

export function removeFromPlaylist(playlistId: string, trackId: string) {
  playlists.update(pl => {
    const updated = pl.map(p => {
      if (p.id !== playlistId) return p;
      return { ...p, tracks: p.tracks.filter(t => t.id !== trackId) };
    });
    savePlaylists(updated);
    return updated;
  });
}

export function renamePlaylist(id: string, name: string) {
  playlists.update(pl => {
    const updated = pl.map(p => p.id === id ? { ...p, name } : p);
    savePlaylists(updated);
    return updated;
  });
}

export const playlistCount = derived(playlists, $p => $p.reduce((sum, pl) => sum + pl.tracks.length, 0));