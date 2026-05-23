import type { Track } from './types';

// ─── iTunes RSS: Free, no key, real chart data ─────────────────────
const ITUNES_TOP = 'https://itunes.apple.com/us/rss/topsongs/limit=50/json';

// iTunes genre IDs for our genres
const ITUNES_GENRES: Record<string, number> = {
  trending: 0, pop: 14, rock: 21, hiphop: 18, rnb: 15,
  edm: 7, lofi: 0, jazz: 11, classical: 5, country: 6,
  metal: 115, indie: 21, ambient: 0,
  nepali_hot: 0, lok_dohori: 0, nepali_pop: 0, nepali_rap: 0,
};

interface ITunesEntry {
  'im:name': { label: string };
  'im:artist': { label: string };
  'im:image': { label: string }[];
  'im:price'?: { attributes: { amount: string } };
  link?: { attributes?: { href?: string }; 'im:duration'?: { label: string } }[];
  id?: { label: string; attributes?: { 'im:id': string } };
  category?: { attributes: { 'im:id': string; label: string } };
}

// Client-side cache
const _cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000;

function getCached<T>(key: string): T | null {
  const hit = _cache.get(key);
  return (hit && Date.now() - hit.ts < CACHE_TTL) ? hit.data as T : null;
}
function setCache(key: string, data: unknown) {
  _cache.set(key, { data, ts: Date.now() });
}

async function proxyFetch<T>(url: string, timeout = 12000): Promise<T> {
  const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`, {
    signal: AbortSignal.timeout(timeout),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

// Apple Music genre chart URLs
function itunesChartUrl(genre: string, limit = 30): string {
  const gid = ITUNES_GENRES[genre];
  if (!gid || gid === 0) return ITUNES_TOP.replace('50', String(limit));
  return `https://itunes.apple.com/us/rss/topsongs/limit=${limit}/genre=${gid}/json`;
}

function normalizeITunes(e: ITunesEntry, idx: number): Track {
  const name = e['im:name']?.label || 'Unknown';
  const artist = e['im:artist']?.label || 'Unknown';
  const images = e['im:image'] || [];
  const thumb = images[images.length - 1]?.label?.replace('300x300', '400x400') || '';
  const trackId = e['id']?.attributes?.['im:id'] || e['id']?.label || `itunes-${idx}`;

  return {
    id: trackId,
    title: name,
    artist,
    thumbnail: thumb,
    duration: 0,
    source: 'audius',
    previewUrl: `https://audio-ssl.itunes.apple.com/itunesassets/AudioPreview128/v4/${trackId.slice(0,2)}/${trackId.slice(2,4)}/${trackId.slice(4,6)}/mzaf_${trackId}.aac`,
  };
}

// ─── PRIMARY: Get charts by genre (iTunes) ─────────────────────────
export async function getTrendingByGenre(genre: string): Promise<Track[]> {
  const key = `itunes:genre:${genre}`;
  const cached = getCached<Track[]>(key);
  if (cached) return cached;

  try {
    const url = itunesChartUrl(genre);
    const data = await proxyFetch<{ feed: { entry: ITunesEntry[] } }>(url);
    const tracks = (data.feed?.entry || []).map(normalizeITunes);
    setCache(key, tracks);

    // Try to find audio on Audius for these tracks in background
    findAudiusStreams(tracks);
    return tracks;
  } catch (e) {
    console.error('iTunes chart failed:', e);
    return [];
  }
}

// ─── HOME: Multiple chart sections ─────────────────────────────────
export async function getHomeSections() {
  const key = 'itunes:home';
  const cached = getCached<{ label: string; tracks: Track[] }[]>(key);
  if (cached) return cached;

  const [topsongs, pop, hiphop, edm, country, rock, rnb] = await Promise.all([
    proxyFetch<{ feed: { entry: ITunesEntry[] } }>(ITUNES_TOP.replace('50', '20')).then(d => (d.feed?.entry || []).map(normalizeITunes)).catch(() => [] as Track[]),
    proxyFetch<{ feed: { entry: ITunesEntry[] } }>(itunesChartUrl('pop', 15)).then(d => (d.feed?.entry || []).map(normalizeITunes)).catch(() => [] as Track[]),
    proxyFetch<{ feed: { entry: ITunesEntry[] } }>(itunesChartUrl('hiphop', 15)).then(d => (d.feed?.entry || []).map(normalizeITunes)).catch(() => [] as Track[]),
    proxyFetch<{ feed: { entry: ITunesEntry[] } }>(itunesChartUrl('edm', 15)).then(d => (d.feed?.entry || []).map(normalizeITunes)).catch(() => [] as Track[]),
    proxyFetch<{ feed: { entry: ITunesEntry[] } }>(itunesChartUrl('country', 15)).then(d => (d.feed?.entry || []).map(normalizeITunes)).catch(() => [] as Track[]),
    proxyFetch<{ feed: { entry: ITunesEntry[] } }>(itunesChartUrl('rock', 15)).then(d => (d.feed?.entry || []).map(normalizeITunes)).catch(() => [] as Track[]),
    proxyFetch<{ feed: { entry: ITunesEntry[] } }>(itunesChartUrl('rnb', 15)).then(d => (d.feed?.entry || []).map(normalizeITunes)).catch(() => [] as Track[]),
  ]);

  const sections = [
    topsongs.length && { label: '🔥 Top Songs', tracks: topsongs },
    pop.length && { label: '🎤 Pop', tracks: pop },
    hiphop.length && { label: '🎧 Hip-Hop', tracks: hiphop },
    rnb.length && { label: '🎶 R&B', tracks: rnb },
    edm.length && { label: '⚡ Electronic', tracks: edm },
    rock.length && { label: '🎸 Rock', tracks: rock },
    country.length && { label: '🤠 Country', tracks: country },
  ].filter(Boolean) as { label: string; tracks: Track[] }[];

  setCache(key, sections);
  return sections;
}

// ─── SEARCH: iTunes search for top results ─────────────────────────
export async function searchTracks(query: string): Promise<Track[]> {
  const key = `itunes:search:${query}`;
  const cached = getCached<Track[]>(key);
  if (cached) return cached;

  try {
    const data = await proxyFetch<{ results: any[] }>(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&limit=30&entity=song`
    );
    const tracks: Track[] = (data.results || []).map((r: any) => ({
      id: String(r.trackId || Math.random()),
      title: r.trackName || 'Unknown',
      artist: r.artistName || 'Unknown',
      thumbnail: r.artworkUrl100?.replace('100x100', '400x400') || '',
      duration: Math.floor((r.trackTimeMillis || 0) / 1000),
      source: 'audius' as const,
      previewUrl: r.previewUrl || '',
    }));
    setCache(key, tracks);
    return tracks;
  } catch { return []; }
}

// ─── STREAM: Audius fallback + iTunes preview ──────────────────────
const AUDIUS = 'https://discoveryprovider.audius.co';

export async function getStreamUrl(trackId: string, track?: Track): Promise<{ url: string; bitrate: number }> {
  // Try Audius first
  if (track && track.artist && track.title) {
    try {
      const search = await proxyFetch<{ data: { id: string }[] }>(
        `${AUDIUS}/v1/tracks/search?query=${encodeURIComponent(`${track.title} ${track.artist}`)}&limit=3`
      );
      if (search.data?.length) {
        const audiusId = search.data[0].id;
        // Return the proxy URL for the Audius stream
        return { url: `/api/proxy?url=${encodeURIComponent(`${AUDIUS}/v1/tracks/${audiusId}/stream`)}`, bitrate: 320 };
      }
    } catch { /* fallback to preview */ }
  }

  // Fallback: iTunes 30-second preview
  if (track && (track as any).previewUrl) {
    return { url: `/api/proxy?url=${encodeURIComponent((track as any).previewUrl)}`, bitrate: 128 };
  }

  // Last resort: direct iTunes preview
  const previewUrl = `https://audio-ssl.itunes.apple.com/itunesassets/AudioPreview128/v4/${trackId.slice(0,2)}/${trackId.slice(2,4)}/${trackId.slice(4,6)}/mzaf_${trackId}.aac`;
  return { url: `/api/proxy?url=${encodeURIComponent(previewUrl)}`, bitrate: 128 };
}

// Background: Try to find Audius streams for tracks
async function findAudiusStreams(tracks: Track[]) {
  for (const track of tracks) {
    try {
      await getStreamUrl(track.id, track);
    } catch { /* skip */ }
  }
}

// ─── YOUTUBE RSS: Learning channels ─────────────────────────────────
const YT_CHANNELS: Record<string, string> = {
  fcc: 'UC8butISFwT-Wl7EV0hUK0BQ', '3b1b': 'UCYO_jab_esuFRV4b17AJtAw',
  fireship: 'UCsBjURrPoezykLs9EqgamOA', traversy: 'UC29ju8bIPH5as8OGnQzwJyA',
  ted_ed: 'UCsooa4yRKGN_zEE8iknghZA', kurzgesagt: 'UCsXVk37bltHxD1rDPwtNM8Q',
  mit: 'UCEBb1b_L6zDS3xTUrIALZOw', veritasium: 'UCkyfHZ6bY2TjqbCwmJxWj4A',
};

export async function getLearningVideos(channelId: string): Promise<Track[]> {
  const key = `learn:${channelId}`;
  const cached = getCached<Track[]>(key);
  if (cached) return cached;

  const ytId = YT_CHANNELS[channelId];
  if (!ytId) return [];

  try {
    const data = await proxyFetch<{ status?: string; items?: any[] }>(
      `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(`https://www.youtube.com/feeds/videos.xml?channel_id=${ytId}`)}`
    );
    if (data.status === 'ok' && data.items) {
      const tracks = data.items.slice(0, 20).map((item: any, i: number) => ({
        id: (item.link || '').match(/(?:v=|youtu\.be\/)([a-z0-9_-]{11})/i)?.[1] || `yt-${channelId}-${i}`,
        title: item.title || '',
        artist: item.author || 'YouTube',
        thumbnail: item.thumbnail?.url || `https://i.ytimg.com/vi/${(item.link || '').match(/(?:v=|youtu\.be\/)([a-z0-9_-]{11})/i)?.[1] || ''}/mqdefault.jpg`,
        duration: 0,
        source: 'audius' as const,
      }));
      setCache(key, tracks);
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