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
const CACHE_TTL = 10 * 60 * 1000;

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

  try {
    const res = await fetch(`/api/proxy?url=${encodeURIComponent(show.rss)}`, {
      signal: AbortSignal.timeout(15000),
    });
    const xml = await res.text();

    // Parse RSS XML
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');

    // Check for parser errors
    const parseError = doc.querySelector('parsererror');
    if (parseError) throw new Error('XML parse error');

    const items = Array.from(doc.querySelectorAll('item')).slice(0, 20);

    const episodes: PodcastEpisode[] = items.map((item, i) => {
      const enclosure = item.querySelector('enclosure');
      const itunesDuration = item.querySelector('itunes\\:duration, duration');

      // Try various thumbnail sources
      const itunesImage = item.querySelector('itunes\\:image');
      const mediaThumbnail = item.querySelector('media\\:thumbnail');
      const thumbnail = itunesImage?.getAttribute('href')
        || mediaThumbnail?.getAttribute('url')
        || '';

      return {
        id: `${show.id}-${i}`,
        title: item.querySelector('title')?.textContent?.trim() || 'Untitled',
        description: item.querySelector('description')?.textContent?.replace(/<[^>]*>/g, '').trim().slice(0, 200) || '',
        pubDate: item.querySelector('pubDate')?.textContent?.trim() || '',
        audioUrl: enclosure?.getAttribute('url') || '',
        duration: parseDuration(itunesDuration?.textContent?.trim() || ''),
        showName: show.name,
        showIcon: show.icon,
        thumbnail,
      };
    }).filter(e => e.audioUrl);

    if (episodes.length > 0) {
      _cache.set(show.id, { episodes, ts: Date.now() });
    }
    return episodes;
  } catch {
    // Fallback: try JSON proxy (rss2json)
    try {
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(show.rss)}`)}`;
      const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(15000) });
      const data = await res.json();
      if (data.status === 'ok' && data.items) {
        const episodes: PodcastEpisode[] = data.items.slice(0, 20).map((item: any, i: number) => ({
          id: `${show.id}-${i}`,
          title: item.title || 'Untitled',
          description: (item.description || '').replace(/<[^>]*>/g, '').trim().slice(0, 200),
          pubDate: item.pubDate || '',
          audioUrl: item.enclosure?.link || '',
          duration: parseDuration(String(item.duration || '')),
          showName: show.name,
          showIcon: show.icon,
          thumbnail: item.thumbnail || '',
        })).filter((e: PodcastEpisode) => e.audioUrl);

        if (episodes.length > 0) {
          _cache.set(show.id, { episodes, ts: Date.now() });
        }
        return episodes;
      }
    } catch { /* both methods failed */ }

    return [];
  }
}