const MUSIC_CACHE_TTL = 120;
const PODCAST_CACHE_TTL = 600;

async function handleYouTube(path, url, apiKey) {
  if (path === '/api/youtube/search') {
    const q = url.searchParams.get('q');
    const channelId = url.searchParams.get('channelId');
    const maxResults = url.searchParams.get('maxResults') || 20;
    if (!q && !channelId) return new Response(JSON.stringify({ items: [] }), { headers: { 'Content-Type': 'application/json' } });

    const params = new URLSearchParams({
      part: 'snippet',
      maxResults: String(maxResults),
      key: apiKey || 'missing',
      type: 'video',
      videoCategoryId: '10',
    });
    if (q) params.set('q', q);
    if (channelId) params.set('channelId', channelId);

    const ytUrl = `https://www.googleapis.com/youtube/v3/search?${params}`;
    return proxyFetch(ytUrl, MUSIC_CACHE_TTL, url);
  }

  if (path === '/api/youtube/video') {
    const id = url.searchParams.get('id');
    if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

    const ytUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${id}&key=${apiKey}`;
    return proxyFetch(ytUrl, MUSIC_CACHE_TTL, url);
  }

  return null;
}

async function proxyFetch(targetUrl, ttl, requestUrl) {
  const cacheKey = new Request(`https://cache.evanietech.com/${encodeURIComponent(targetUrl)}`);
  const cache = caches.default;

  const cached = await cache.match(cacheKey);
  if (cached) {
    const resp = new Response(cached.body, cached);
    resp.headers.set('X-Cache', 'HIT');
    return resp;
  }

  try {
    const upstream = await fetch(targetUrl, {
      headers: { 'User-Agent': 'ChillPill/1.0', 'Accept': 'application/json' },
      signal: AbortSignal.timeout(12000),
    });

    if (!upstream.ok) {
      return new Response(JSON.stringify({ error: `Upstream ${upstream.status}` }), {
        status: upstream.status,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const body = await upstream.arrayBuffer();
    const response = new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': `public, max-age=${ttl}, s-maxage=${ttl}`,
        'X-Cache': 'MISS',
      },
    });
    const toCache = response.clone();
    await cache.put(cacheKey, toCache);
    return response;
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const path = url.pathname;
  const apiKey = env.YOUTUBE_API_KEY || '';

  // YouTube API endpoints
  if (path.startsWith('/api/youtube/')) {
    const result = await handleYouTube(path, url, apiKey);
    if (result) return result;
  }

  // RSS/Podcast proxy
  if (path === '/api/proxy') {
    const target = url.searchParams.get('url');
    if (!target || !/^https?:\/\//.test(target)) {
      return new Response(JSON.stringify({ error: 'Missing url param' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }
    const isRSS = /(podcast|rss|feed|npr|simplecast|megaphone|feedburner|omnycontent)/i.test(target);
    const ttl = isRSS ? PODCAST_CACHE_TTL : MUSIC_CACHE_TTL;
    return proxyFetch(target, ttl, url);
  }

  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404, headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}