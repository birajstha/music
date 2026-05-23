const YT_API_KEY = 'AIzaSyD2RWuVoJyd5Jwsgq01UHrkEbxF18U1J2Y';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname, searchParams } = url;

    // YouTube API proxy (keeps API key server-side)
    if (pathname === '/api/youtube/search') {
      const q = searchParams.get('q');
      const maxResults = searchParams.get('maxResults') || '30';
      const channelId = searchParams.get('channelId');
      
      let apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=${maxResults}&key=${YT_API_KEY}`;
      if (q) apiUrl += `&q=${encodeURIComponent(q)}`;
      if (channelId) apiUrl += `&channelId=${channelId}`;

      return handleYouTubeRequest(apiUrl, request, ctx, 180);
    }

    if (pathname === '/api/youtube/video') {
      const id = searchParams.get('id');
      if (!id) return json({ error: 'Missing id' }, 400);
      const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${id}&key=${YT_API_KEY}`;
      return handleYouTubeRequest(apiUrl, request, ctx, 600);
    }

    // Generic proxy (cached)
    if (pathname === '/api/proxy') {
      const target = searchParams.get('url');
      if (!target || !/^https?:\/\//.test(target)) {
        return json({ error: 'Invalid url' }, 400);
      }
      return handleProxyRequest(target, request, ctx);
    }

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS' },
      });
    }

    // Static assets
    return env.ASSETS.fetch(request);
  }
};

async function handleYouTubeRequest(apiUrl, request, ctx, ttl) {
  const cacheKey = new Request(apiUrl, request);
  const cache = caches.default;
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  try {
    const upstream = await fetch(apiUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ChillPill/1.0)' },
      signal: AbortSignal.timeout(10000),
    });
    if (!upstream.ok) {
      const text = await upstream.text();
      return json({ error: `YouTube ${upstream.status}`, detail: text }, upstream.status);
    }
    const body = await upstream.json();
    const response = json(body, 200, { 'Cache-Control': `public, max-age=${ttl}, s-maxage=${ttl}` });
    ctx.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  } catch (err) {
    return json({ error: err.message }, 502);
  }
}

async function handleProxyRequest(target, request, ctx) {
  const cacheKey = new Request(request.url, request);
  const cache = caches.default;
  const cached = await cache.match(cacheKey);
  if (cached) return new Response(cached.body, { ...cached, headers: { ...Object.fromEntries(cached.headers), 'X-Cache': 'HIT' } });

  const isPodcast = /podcast|rss|feed|npr|simplecast|megaphone/i.test(target);
  const ttl = isPodcast ? 600 : 120;

  try {
    const upstream = await fetch(target, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ChillPill/1.0)' },
      signal: AbortSignal.timeout(15000),
    });
    if (!upstream.ok) return json({ error: `Upstream ${upstream.status}` }, upstream.status);
    const body = await upstream.arrayBuffer();
    const contentType = upstream.headers.get('Content-Type') || 'application/json';
    const response = new Response(body, {
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': `public, max-age=${ttl}, s-maxage=${ttl}`,
      },
    });
    ctx.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  } catch (err) {
    return json({ error: err.message }, 502);
  }
}

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', ...extra },
  });
}