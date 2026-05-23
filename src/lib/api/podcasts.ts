import type { PodcastEpisode, PodcastShow } from './types';

export const PODCAST_SHOWS: PodcastShow[] = [
  { id: 'daily', name: 'The Daily', host: 'NYT', icon: '🗞️', rss: 'https://feeds.simplecast.com/54nAGcIl' },
  { id: 'npr', name: 'NPR Up First', host: 'NPR', icon: '📻', rss: 'https://feeds.npr.org/510318/podcast.xml' },
  { id: 'sysk', name: 'Stuff You Should Know', host: 'iHeart', icon: '🧠', rss: 'https://omnycontent.com/d/playlist/e73c998e-6e60-432f-8610-ae210140c5b1/A91018A4-EA4F-4130-BF55-AE270180C671/44710ECC-10BB-48D1-93C7-AE270180C68B/podcast.rss' },
  { id: 'ted', name: 'TED Talks Daily', host: 'TED', icon: '💡', rss: 'https://feeds.feedburner.com/TEDTalks_audio' },
  { id: 'lex', name: 'Lex Fridman', host: 'Lex Fridman', icon: '🤖', rss: 'https://lexfridman.com/feed/podcast/' },
  { id: 'huberman', name: 'Huberman Lab', host: 'Andrew Huberman', icon: '🔬', rss: 'https://feeds.megaphone.fm/hubermanlab' },
  { id: 'hibt', name: 'How I Built This', host: 'Guy Raz', icon: '🏗️', rss: 'https://feeds.npr.org/510313/podcast.xml' },
  { id: 'smartless', name: 'SmartLess', host: 'SmartLess', icon: '😂', rss: 'https://feeds.simplecast.com/qm_9xx0g' },
];

const _cache = new Map<string, { episodes: PodcastEpisode[]; ts: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 min for podcasts

function proxyUrl(url: string): string {
  return `/api/proxy?url=${encodeURIComponent(url)}`;
}

function parseDuration(s: string): number {
  if (!s) return 0;
  const parts = s.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parseInt(s) || 0;
}

export async function fetchPodcastEpisodes(show: PodcastShow): Promise<PodcastEpisode[]> {
  const cached = _cache.get(show.id);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.episodes;

  const proxied = proxyUrl(show.rss);
  let xml = '';
  try {
    const res = await fetch(proxied, { signal: AbortSignal.timeout(15000) });
    xml = await res.text();
  } catch {
    try {
      const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(show.rss)}`, { signal: AbortSignal.timeout(15000) });
      const data = await res.json() as { contents: string };
      xml = data.contents;
    } catch { return []; }
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const items = Array.from(doc.querySelectorAll('item')).slice(0, 20);

  const episodes: PodcastEpisode[] = items.map((item, i) => {
    const enclosure = item.querySelector('enclosure');
    const audioUrl = enclosure?.getAttribute('url') || '';
    const durationEl = item.querySelector('duration');
    const imgEl = item.querySelector('image') || item.querySelector('itunes\\:image');

    return {
      id: `${show.id}-${i}`,
      title: item.querySelector('title')?.textContent?.trim() || 'Untitled',
      description: item.querySelector('description')?.textContent?.replace(/<[^>]*>/g, '').trim().slice(0, 200) || '',
      pubDate: item.querySelector('pubDate')?.textContent?.trim() || '',
      audioUrl,
      duration: parseDuration(durationEl?.textContent?.trim() || ''),
      showName: show.name,
      showIcon: show.icon,
      thumbnail: imgEl?.getAttribute('href') || imgEl?.getAttribute('url') || '',
    };
  }).filter(e => e.audioUrl);

  _cache.set(show.id, { episodes, ts: Date.now() });
  return episodes;
}
