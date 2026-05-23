import type { Track } from './types';
import { LEARNING_CHANNELS } from './constants';

// ─── Audius: Decentralized music (no API key, reliable, CC-licensed) ───
const AUDIUS_HOSTS = [
  'https://discoveryprovider.audius.co',
  'https://audius-discovery-1.virtualbs.io',
];

interface AudiusTrack {
  id: string;
  title: string;
  user: { name: string };
  artwork?: { '480x480'?: string };
  duration: number;
  genre?: string;
}

// Edge-cached fetch via CF proxy — first user fetches, rest hit cache
async function fetchFromProxy<T>(url: string): Promise<T> {
  const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`, {
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`Proxy ${res.status}`);
  return res.json() as Promise<T>;
}

// Client-side in-memory cache (5 min) — avoids duplicate requests per session
const _cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000;

function getCached<T>(key: string): T | null {
  const hit = _cache.get(key);
  return (hit && Date.now() - hit.ts < CACHE_TTL) ? hit.data as T : null;
}
function setCache(key: string, data: unknown) {
  _cache.set(key, { data, ts: Date.now() });
}

async function audiusFetch<T>(path: string): Promise<T> {
  const cacheKey = `audius:${path}`;
  const cached = getCached<T>(cacheKey);
  if (cached) return cached;

  const errors: string[] = [];
  for (const host of AUDIUS_HOSTS) {
    try {
      const data = await fetchFromProxy<T>(`${host}${path}`);
      setCache(cacheKey, data);
      return data;
    } catch (e) { errors.push(String(e)); }
  }
  throw new Error(`Audius failed: ${errors.join(', ')}`);
}

function normalizeAudius(t: AudiusTrack): Track {
  return {
    id: t.id,
    title: t.title,
    artist: t.user?.name || 'Unknown',
    thumbnail: t.artwork?.['480x480'] || '',
    duration: Math.floor(t.duration),
    source: 'audius',
  };
}

export async function searchTracks(query: string): Promise<Track[]> {
  const data = await audiusFetch<{ data: AudiusTrack[] }>(
    `/v1/tracks/search?query=${encodeURIComponent(query)}&limit=30`
  );
  return (data.data || []).map(normalizeAudius);
}

export async function getTrending(genre?: string): Promise<Track[]> {
  const g = genre ? `&genre=${encodeURIComponent(genre)}` : '';
  const data = await audiusFetch<{ data: AudiusTrack[] }>(
    `/v1/tracks/trending?limit=50${g}`
  );
  return (data.data || []).map(normalizeAudius);
}

export async function getStreamUrl(trackId: string): Promise<{ url: string; bitrate: number }> {
  // Audius streams directly — no fetch needed, just return the URL
  return { url: `/api/proxy?url=${encodeURIComponent(`${AUDIUS_HOSTS[0]}/v1/tracks/${trackId}/stream`)}`, bitrate: 320 };
}

// ─── YouTube RSS: Learning channel videos (no API key needed) ─────────
// YouTube channel IDs from channel URLs
const YT_CHANNELS: Record<string, string> = {
  fcc: 'UC8butISFwT-Wl7EV0hUK0BQ',
  '3b1b': 'UCYO_jab_esuFRV4b17AJtAw',
  fireship: 'UCsBjURrPoezykLs9EqgamOA',
  traversy: 'UC29ju8bIPH5as8OGnQzwJyA',
  ted_ed: 'UCsooa4yRKGN_zEE8iknghZA',
  kurzgesagt: 'UCsXVk37bltHxD1rDPwtNM8Q',
  mit: 'UCEBb1b_L6zDS3xTUrIALZOw',
  veritasium: 'UCkyfHZ6bY2TjqbCwmJxWj4A',
};

// RSS → JSON via rss2json (free, no key, works via CF proxy)
const RSS2JSON = 'https://api.rss2json.com/v1/api.json?rss_url=';

interface RSSItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  thumbnail?: { url?: string };
}

async function fetchRSS(feedUrl: string): Promise<RSSItem[]> {
  const url = `${RSS2JSON}${encodeURIComponent(feedUrl)}`;
  try {
    const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(15000) });
    const data = await res.json();
    if (data.status === 'ok') return data.items || [];
  } catch { /* fallback */ }
  // Direct fetch fallback
  try {
    const directUrl = `/api/proxy?url=${encodeURIComponent(feedUrl)}`;
    const res = await fetch(directUrl, { signal: AbortSignal.timeout(15000) });
    const xml = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    return Array.from(doc.querySelectorAll('entry, item')).map(el => ({
      title: el.querySelector('title')?.textContent || '',
      link: el.querySelector('link')?.getAttribute('href') || el.querySelector('link')?.textContent || '',
      pubDate: el.querySelector('published')?.textContent || el.querySelector('pubDate')?.textContent || '',
      description: '',
    }));
  } catch { return []; }
}

// YouTube oEmbed (free, no key, 200 req/sec limit — cached at edge)
async function getVideoTitle(videoId: string): Promise<string> {
  try {
    const res = await fetch(`/api/proxy?url=${encodeURIComponent(`https://www.youtube.com/oembed?url=https://youtube.com/watch?v=${videoId}&format=json`)}`, {
      signal: AbortSignal.timeout(8000),
    });
    const data = await res.json();
    return data.title || '';
  } catch { return ''; }
}

// Extract video ID from various YouTube URL formats
function extractVideoId(url: string): string {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : '';
}

export async function getLearningVideos(channelId: string): Promise<Track[]> {
  const cacheKey = `yt:${channelId}`;
  const cached = getCached<Track[]>(cacheKey);
  if (cached) return cached;

  const ytId = YT_CHANNELS[channelId];
  if (!ytId) return [];

  const items = await fetchRSS(`https://www.youtube.com/feeds/videos.xml?channel_id=${ytId}`);

  const tracks = items.slice(0, 20).map((item, i): Track | null => {
    const videoId = extractVideoId(item.link);
    return {
      id: videoId || `yt-${channelId}-${i}`,
      title: item.title || '',
      artist: LEARNING_CHANNELS.find(c => c.id === channelId)?.name || 'YouTube',
      thumbnail: item.thumbnail?.url || `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
      duration: 0,
      source: 'audius',
    };
  }).filter(Boolean) as Track[];

  setCache(cacheKey, tracks);
  return tracks;
}

// ─── Podcast RSS (free, no key) ─────────────────────────────────────
export async function fetchPodcastRSS(rssUrl: string): Promise<RSSItem[]> {
  return fetchRSS(rssUrl);
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}