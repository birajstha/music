import type { Track } from './types';

const YT_API_KEY = 'AIzaSyD2RWuVoJyd5Jwsgq01UHrkEbxF18U1J2Y';

// Client-side in-memory cache (3 min)
const _cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 3 * 60 * 1000;

function getCached<T>(key: string): T | null {
  const hit = _cache.get(key);
  return (hit && Date.now() - hit.ts < CACHE_TTL) ? hit.data as T : null;
}
function setCache(key: string, data: unknown) {
  _cache.set(key, { data, ts: Date.now() });
}

// Fetch through CF proxy (keeps API key server-side, edge caches)
async function proxyFetch<T>(path: string): Promise<T> {
  const res = await fetch(`/api/youtube${path}`, { signal: AbortSignal.timeout(12000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

// ─── YOUTUBE SEARCH ─────────────────────────────────────────────────
export async function searchTracks(query: string): Promise<Track[]> {
  const key = `yt:search:${query}`;
  const cached = getCached<Track[]>(key);
  if (cached) return cached;

  try {
    const data = await proxyFetch<{ items: YTVideo[] }>(
      `/search?q=${encodeURIComponent(query)}&maxResults=30`
    );
    const tracks = (data.items || []).map(normalizeYT);
    setCache(key, tracks);
    return tracks;
  } catch { return []; }
}

// ─── TRENDING MUSIC ─────────────────────────────────────────────────
export async function getTrendingByGenre(genre?: string): Promise<Track[]> {
  const g = genre || 'trending';
  const key = `yt:trending:${g}`;
  const cached = getCached<Track[]>(key);
  if (cached) return cached;

  // Music category ID = 10
  const queries: Record<string, string> = {
    trending: 'top music 2024',
    pop: 'pop music 2024',
    hiphop: 'hip hop rap 2024',
    rnb: 'rnb soul 2024',
    edm: 'edm electronic 2024',
    rock: 'rock music 2024',
    country: 'country hits 2024',
    jazz: 'jazz music',
    classical: 'classical music',
    metal: 'metal music 2024',
    indie: 'indie music 2024',
  };
  const q = queries[g] || queries.trending;

  try {
    const data = await proxyFetch<{ items: YTVideo[] }>(
      `/search?q=${encodeURIComponent(q)}&maxResults=30`
    );
    const tracks = (data.items || []).map(normalizeYT);
    setCache(key, tracks);
    return tracks;
  } catch { return []; }
}

// ─── HOME SECTIONS ──────────────────────────────────────────────────
export async function getHomeSections() {
  const key = 'yt:home';
  const cached = getCached<{ label: string; tracks: Track[] }[]>(key);
  if (cached) return cached;

  const [trending, pop, hiphop, edm, rock, rnb] = await Promise.all([
    getTrendingByGenre().catch(() => []),
    getTrendingByGenre('pop').catch(() => []),
    getTrendingByGenre('hiphop').catch(() => []),
    getTrendingByGenre('edm').catch(() => []),
    getTrendingByGenre('rock').catch(() => []),
    getTrendingByGenre('rnb').catch(() => []),
  ]);

  const sections = [
    trending.length && { label: '🔥 Top Hits', tracks: trending.slice(0, 20) },
    pop.length && { label: '🎤 Pop', tracks: pop.slice(0, 15) },
    hiphop.length && { label: '🎧 Hip-Hop', tracks: hiphop.slice(0, 15) },
    rnb.length && { label: '🎶 R&B', tracks: rnb.slice(0, 15) },
    edm.length && { label: '⚡ Electronic', tracks: edm.slice(0, 15) },
    rock.length && { label: '🎸 Rock', tracks: rock.slice(0, 15) },
  ].filter(Boolean) as { label: string; tracks: Track[] }[];

  setCache(key, sections);
  return sections;
}

// ─── YOUTUBE VIDEO FETCH (for individual video metadata) ────────────
export async function getVideoInfo(videoId: string): Promise<Track | null> {
  try {
    const data = await fetch(`/api/youtube/video?id=${videoId}`, { signal: AbortSignal.timeout(8000) });
    const json = await data.json();
    if (json.items?.length) return normalizeYT(json.items[0]);
    return null;
  } catch { return null; }
}

// ─── STREAM / PLAYBACK ──────────────────────────────────────────────
// We don't need a stream URL — the YouTube iframe player handles playback
export function getVideoUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&controls=0&modestbranding=1&rel=0`;
}

// ─── NORMALIZE YouTube video to Track ───────────────────────────────
interface YTVideo {
  id: { videoId?: string } | string;
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: { high?: { url: string }; medium?: { url: string }; default?: { url: string } };
    publishedAt: string;
  };
}

function normalizeYT(v: YTVideo): Track {
  const videoId = typeof v.id === 'string' ? v.id : v.id?.videoId || '';
  const snippet = v.snippet || {};
  return {
    id: videoId,
    title: snippet.title || 'Unknown',
    artist: snippet.channelTitle || 'YouTube',
    thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || '',
    duration: 0,
    source: 'youtube',
  };
}

// ─── LEARNING VIDEOS ────────────────────────────────────────────────
const YT_CHANNEL_IDS: Record<string, string> = {
  fcc: 'UC8butISFwT-Wl7EV0hUK0BQ', '3b1b': 'UCYO_jab_esuFRV4b17AJtAw',
  fireship: 'UCsBjURrPoezykLs9EqgamOA', traversy: 'UC29ju8bIPH5as8OGnQzwJyA',
  ted_ed: 'UCsooa4yRKGN_zEE8iknghZA', kurzgesagt: 'UCsXVk37bltHxD1rDPwtNM8Q',
  mit: 'UCEBb1b_L6zDS3xTUrIALZOw', veritasium: 'UCkyfHZ6bY2TjqbCwmJxWj4A',
};

export async function getLearningVideos(channelId: string): Promise<Track[]> {
  const key = `yt:learn:${channelId}`;
  const cached = getCached<Track[]>(key);
  if (cached) return cached;

  const ytId = YT_CHANNEL_IDS[channelId];
  if (!ytId) return [];

  try {
    const data = await proxyFetch<{ items: YTVideo[] }>(
      `/search?channelId=${ytId}&maxResults=20`
    );
    const tracks = (data.items || []).map(normalizeYT);
    setCache(key, tracks);
    return tracks;
  } catch { return []; }
}

export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}