import type { Track } from './types';

const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://piped-api.garudalinux.org',
  'https://api.piped.yt',
];

// Edge-cached proxy — routes through our CF Worker to cache at edge
// All users share the same cached response → no Piped rate limits
function proxyUrl(url: string): string {
  return `/api/proxy?url=${encodeURIComponent(url)}`;
}

// In-memory client-side cache (5 min TTL) — avoids duplicate requests per session
const _cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000;

function getCached<T>(key: string): T | null {
  const hit = _cache.get(key);
  if (hit && Date.now() - hit.ts < CACHE_TTL) return hit.data as T;
  return null;
}
function setCache(key: string, data: unknown) {
  _cache.set(key, { data, ts: Date.now() });
}

async function pipedFetch<T>(path: string): Promise<T> {
  const cacheKey = path;
  const cached = getCached<T>(cacheKey);
  if (cached) return cached;

  // Try via our proxy first (CF edge cache), then direct fallback
  const proxied = proxyUrl(`${PIPED_INSTANCES[0]}${path}`);
  try {
    const res = await fetch(proxied, { signal: AbortSignal.timeout(12000) });
    if (res.ok) {
      const data = await res.json() as T;
      setCache(cacheKey, data);
      return data;
    }
  } catch { /* fallback */ }

  // Direct instance fallback
  for (const base of PIPED_INSTANCES) {
    try {
      const res = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) continue;
      const data = await res.json() as T;
      setCache(cacheKey, data);
      return data;
    } catch { /* try next */ }
  }
  throw new Error('All Piped instances failed');
}

export async function searchTracks(query: string): Promise<Track[]> {
  const cacheKey = `search:${query}`;
  const cached = getCached<Track[]>(cacheKey);
  if (cached) return cached;

  const data = await pipedFetch<{ items: PipedItem[] }>(
    `/search?q=${encodeURIComponent(query)}&filter=music_songs`
  );

  const tracks = data.items
    .filter((i) => i.type === 'stream' && i.duration > 30 && i.duration < 900)
    .slice(0, 30)
    .map((i): Track => ({
      id: i.url.replace('/watch?v=', ''),
      title: i.title,
      artist: i.uploaderName,
      thumbnail: i.thumbnail,
      duration: i.duration,
      source: 'piped',
    }));

  setCache(cacheKey, tracks);
  return tracks;
}

interface PipedItem {
  type: string;
  url: string;
  title: string;
  uploaderName: string;
  duration: number;
  thumbnail: string;
}

interface PipedStream {
  title: string;
  uploader: string;
  thumbnailUrl: string;
  duration: number;
  audioStreams: { url: string; bitrate: number; mimeType: string }[];
}

export async function getStreamUrl(videoId: string, dataSaver = false): Promise<{ url: string; bitrate: number }> {
  const cacheKey = `stream:${videoId}:${dataSaver}`;
  const cached = getCached<{ url: string; bitrate: number }>(cacheKey);
  if (cached) return cached;

  const data = await pipedFetch<PipedStream>(`/streams/${videoId}`);
  const streams = [...data.audioStreams].sort((a, b) => a.bitrate - b.bitrate);
  const chosen = dataSaver ? streams[0] : streams[streams.length - 1];

  const result = { url: chosen.url, bitrate: chosen.bitrate };
  // Stream URLs expire — cache only 3 min
  _cache.set(cacheKey, { data: result, ts: Date.now() - (CACHE_TTL - 3 * 60 * 1000) });
  return result;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
