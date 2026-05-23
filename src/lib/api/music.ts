import type { Track } from './types';
import { GENRES } from './constants';

// ─── Audius: Trending music (genre-filtered, CC-licensed but has real artists) ───
const AUDIUS = 'https://discoveryprovider.audius.co';

// Map our genres to Audius genres
const AUDIUS_GENRES: Record<string, string> = {
  pop: 'Pop', rock: 'Rock', hiphop: 'Hip-Hop/Rap', rnb: 'R&B', edm: 'Electronic',
  lofi: 'Lo-Fi', jazz: 'Jazz', classical: 'Classical', country: 'Country',
  metal: 'Metal', indie: 'Indie', ambient: 'Ambient',
};

// Client-side cache (5 min)
const _cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000;

function getCached<T>(key: string): T | null {
  const hit = _cache.get(key);
  return (hit && Date.now() - hit.ts < CACHE_TTL) ? hit.data as T : null;
}
function setCache(key: string, data: unknown) {
  _cache.set(key, { data, ts: Date.now() });
}

async function proxyFetch<T>(url: string): Promise<T> {
  const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`, {
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`Proxy ${res.status}`);
  return res.json() as Promise<T>;
}

interface AudiusTrack {
  id: string; title: string;
  user: { name: string };
  artwork?: { '480x480'?: string };
  duration: number;
}

function normalize(t: AudiusTrack): Track {
  return {
    id: t.id, title: t.title,
    artist: t.user?.name || 'Unknown',
    thumbnail: t.artwork?.['480x480'] || '',
    duration: Math.floor(t.duration),
    source: 'audius',
  };
}

// ─── PRIMARY: Get trending music by genre (Audius) ──────────────────
export async function getTrendingByGenre(genreId: string): Promise<Track[]> {
  const cacheKey = `trending:${genreId}`;
  const cached = getCached<Track[]>(cacheKey);
  if (cached) return cached;

  const genre = AUDIUS_GENRES[genreId];
  const path = `/v1/tracks/trending?limit=30${genre ? `&genre=${encodeURIComponent(genre)}` : ''}`;
  
  try {
    const data = await proxyFetch<{ data: AudiusTrack[] }>(`${AUDIUS}${path}`);
    const tracks = (data.data || []).map(normalize);
    if (tracks.length > 0) {
      setCache(cacheKey, tracks);
      return tracks;
    }
  } catch { /* fallback */ }
  return [];
}

// ─── HOME: Trending across all genres ──────────────────────────────
export async function getHomeSections() {
  const cacheKey = 'home-sections';
  const cached = getCached<{ label: string; tracks: Track[] }[]>(cacheKey);
  if (cached) return cached;

  const [trending, pop, hiphop, edm, lofi, rock, rnb, nepali] = await Promise.all([
    proxyFetch<{ data: AudiusTrack[] }>(`${AUDIUS}/v1/tracks/trending?limit=20`).then(d => (d.data || []).map(normalize)).catch(() => []),
    proxyFetch<{ data: AudiusTrack[] }>(`${AUDIUS}/v1/tracks/trending?limit=12&genre=Pop`).then(d => (d.data || []).map(normalize)).catch(() => []),
    proxyFetch<{ data: AudiusTrack[] }>(`${AUDIUS}/v1/tracks/trending?limit=12&genre=Hip-Hop/Rap`).then(d => (d.data || []).map(normalize)).catch(() => []),
    proxyFetch<{ data: AudiusTrack[] }>(`${AUDIUS}/v1/tracks/trending?limit=12&genre=Electronic`).then(d => (d.data || []).map(normalize)).catch(() => []),
    proxyFetch<{ data: AudiusTrack[] }>(`${AUDIUS}/v1/tracks/trending?limit=12&genre=Lo-Fi`).then(d => (d.data || []).map(normalize)).catch(() => []),
    proxyFetch<{ data: AudiusTrack[] }>(`${AUDIUS}/v1/tracks/trending?limit=12&genre=Rock`).then(d => (d.data || []).map(normalize)).catch(() => []),
    proxyFetch<{ data: AudiusTrack[] }>(`${AUDIUS}/v1/tracks/trending?limit=12&genre=R&B`).then(d => (d.data || []).map(normalize)).catch(() => []),
    proxyFetch<{ data: AudiusTrack[] }>(`${AUDIUS}/v1/tracks/trending?limit=12&genre=World`).then(d => (d.data || []).map(normalize)).catch(() => []),
  ]);

  const sections = [
    trending.length && { label: '🔥 Trending Now', tracks: trending.slice(0, 20) },
    pop.length && { label: '🎤 Pop Hits', tracks: pop },
    hiphop.length && { label: '🎧 Hip-Hop', tracks: hiphop },
    edm.length && { label: '⚡ EDM / Electronic', tracks: edm },
    lofi.length && { label: '🌙 Lo-Fi Beats', tracks: lofi },
    rock.length && { label: '🎸 Rock', tracks: rock },
    rnb.length && { label: '🎶 R&B', tracks: rnb },
    nepali.length && { label: '🌍 World', tracks: nepali },
  ].filter(Boolean) as { label: string; tracks: Track[] }[];

  setCache(cacheKey, sections);
  return sections;
}

// ─── SEARCH: Audius search ─────────────────────────────────────────
export async function searchTracks(query: string): Promise<Track[]> {
  const cacheKey = `search:${query}`;
  const cached = getCached<Track[]>(cacheKey);
  if (cached) return cached;

  try {
    const data = await proxyFetch<{ data: AudiusTrack[] }>(
      `${AUDIUS}/v1/tracks/search?query=${encodeURIComponent(query)}&limit=30`
    );
    const tracks = (data.data || []).map(normalize);
    setCache(cacheKey, tracks);
    return tracks;
  } catch { return []; }
}

// ─── STREAM: Audius direct stream URL ──────────────────────────────
export async function getStreamUrl(trackId: string): Promise<{ url: string; bitrate: number }> {
  return { url: `/api/proxy?url=${encodeURIComponent(`${AUDIUS}/v1/tracks/${trackId}/stream`)}`, bitrate: 320 };
}

// ─── YOUTUBE RSS: Learning channels ─────────────────────────────────
const YT_CHANNELS: Record<string, string> = {
  fcc: 'UC8butISFwT-Wl7EV0hUK0BQ', '3b1b': 'UCYO_jab_esuFRV4b17AJtAw',
  fireship: 'UCsBjURrPoezykLs9EqgamOA', traversy: 'UC29ju8bIPH5as8OGnQzwJyA',
  ted_ed: 'UCsooa4yRKGN_zEE8iknghZA', kurzgesagt: 'UCsXVk37bltHxD1rDPwtNM8Q',
  mit: 'UCEBb1b_L6zDS3xTUrIALZOw', veritasium: 'UCkyfHZ6bY2TjqbCwmJxWj4A',
};

export async function getLearningVideos(channelId: string): Promise<Track[]> {
  const cacheKey = `learn:${channelId}`;
  const cached = getCached<Track[]>(cacheKey);
  if (cached) return cached;
  
  const ytId = YT_CHANNELS[channelId];
  if (!ytId) return [];

  try {
    let feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${ytId}`;
    // Try rss2json first
    const data = await proxyFetch<{ status?: string; items?: any[] }>(
      `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`
    );
    if (data.status === 'ok' && data.items) {
      const tracks = data.items.slice(0, 20).map((item: any, i: number) => ({
        id: (item.link || '').match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1] || `yt-${channelId}-${i}`,
        title: item.title || '',
        artist: item.author || GENRES.find(c => c.id === channelId)?.label || 'YouTube',
        thumbnail: item.thumbnail?.url || `https://i.ytimg.com/vi/${(item.link || '').match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1] || ''}/mqdefault.jpg`,
        duration: 0,
        source: 'audius' as const,
      }));
      setCache(cacheKey, tracks);
      return tracks;
    }
  } catch { /* fallback */ }
  return [];
}

export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}