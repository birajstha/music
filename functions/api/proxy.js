/**
 * Cloudflare Pages Function — Edge proxy for Piped API + RSS feeds
 *
 * Caching strategy (unlimited users, no rate limits):
 *  - CF Cache API: responses cached at the edge globally for 2 min (music search)
 *    or 10 min (podcast RSS). All users in the same CF region share the same cache.
 *  - Cache key = canonical request URL (normalized, no auth headers)
 *  - On cache HIT: response served from edge, zero upstream requests
 *  - On cache MISS: fetch upstream, store in Cache API, return to user
 *
 * This means 1000 users searching "lofi beats" within 2 min = 1 upstream request.
 */

const MUSIC_CACHE_TTL = 120;   // 2 min for Piped API responses
const PODCAST_CACHE_TTL = 600; // 10 min for RSS feeds

export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const target = url.searchParams.get('url');

  if (!target || !/^https?:\/\//.test(target)) {
    return new Response(JSON.stringify({ error: 'Missing or invalid url param' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Determine TTL based on target type
  const isRSS = target.includes('podcast') || target.includes('rss') ||
                target.includes('feed') || target.includes('npr.org') ||
                target.includes('simplecast') || target.includes('megaphone') ||
                target.includes('feedburner') || target.includes('omnycontent') ||
                target.includes('lexfridman');
  const ttl = isRSS ? PODCAST_CACHE_TTL : MUSIC_CACHE_TTL;

  // Build a stable cache key (strip any per-user params)
  const cacheKey = new Request(`https://proxy-cache.evanietech.com/${encodeURIComponent(target)}`);
  const cache = caches.default;

  // Try CF edge cache first
  const cached = await cache.match(cacheKey);
  if (cached) {
    const resp = new Response(cached.body, cached);
    resp.headers.set('X-Cache', 'HIT');
    return resp;
  }

  // Cache miss — fetch from upstream
  try {
    const upstream = await fetch(target, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; EvanieMusic/1.0)',
        'Accept': 'application/json, application/rss+xml, application/xml, text/xml, */*',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!upstream.ok) {
      return new Response(JSON.stringify({ error: `Upstream ${upstream.status}` }), {
        status: upstream.status,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const body = await upstream.arrayBuffer();
    const contentType = upstream.headers.get('Content-Type') || 'application/json';

    const response = new Response(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': `public, max-age=${ttl}, s-maxage=${ttl}`,
        'X-Cache': 'MISS',
        'Vary': 'Accept-Encoding',
      },
    });

    // Store in CF edge cache (async, non-blocking)
    const toCache = response.clone();
    // CF Cache API requires s-maxage or Cache-Control to cache
    await cache.put(cacheKey, toCache);

    return response;
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}

// Handle CORS preflight
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
