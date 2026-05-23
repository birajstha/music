export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname, searchParams } = url;

    // API proxy with edge caching
    if (pathname === '/api/proxy') {
      const target = searchParams.get('url');
      if (!target || !/^https?:\/\//.test(target)) {
        return new Response(JSON.stringify({ error: 'Invalid url' }), {
          status: 400, headers: { 'Content-Type': 'application/json' }
        });
      }

      const cacheKey = new Request(request.url.replace(pathname, '/api/proxy'), request);
      const cache = caches.default;
      const cached = await cache.match(cacheKey);
      if (cached) {
        return new Response(cached.body, {
          ...cached,
          headers: { ...Object.fromEntries(cached.headers), 'X-Cache': 'HIT' }
        });
      }

      const isRSS = /podcast|rss|feed|npr|simplecast|megaphone/i.test(target);
      const ttl = isRSS ? 600 : 120;

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
          headers: {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': `public, max-age=${ttl}, s-maxage=${ttl}`,
            'X-Cache': 'MISS',
          },
        });

        ctx.waitUntil(cache.put(cacheKey, response.clone()));
        return response;
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 502,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }
    }

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS' },
      });
    }

    // Static assets via ASSETS binding
    return env.ASSETS.fetch(request);
  }
}