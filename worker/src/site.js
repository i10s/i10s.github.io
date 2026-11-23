/**
 * Static site serving and hardening for ifuentes.net, which runs entirely on this Worker (static assets).
 *
 * - serveStatic resolves paths the way GitHub Pages did, so existing URLs keep working unchanged:
 *   exact file, then `/dir/` → `/dir/index.html`, `/page` → `/page.html`, `/dir` → 301 `/dir/`, else /404.html.
 * - withSecurityHeaders adds the security headers to every response (HTML, assets, API, MCP).
 *   HSTS is set at the zone level so it also covers the other subdomains.
 * - www.ifuentes.net redirects to the apex; mta-sts.ifuentes.net serves the MTA-STS policy (RFC 8461).
 */

export const APEX = 'ifuentes.net';

export const MTA_STS_POLICY = [
  'version: STSv1',
  'mode: enforce',
  'mx: mail.protonmail.ch',
  'mx: mailsec.protonmail.ch',
  'max_age: 604800',
  ''
].join('\r\n');

export const CSP = [
  "default-src 'self'",
  // Cloudflare Web Analytics (cookieless) injects its beacon from static.cloudflareinsights.com.
  "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https:",
  "connect-src 'self' https://cloudflareinsights.com",
  "manifest-src 'self'",
  "worker-src 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  'upgrade-insecure-requests'
].join('; ');

export const SECURITY_HEADERS = {
  'Content-Security-Policy': CSP,
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'accelerometer=(), browsing-topics=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()',
  'Cross-Origin-Opener-Policy': 'same-origin'
};

export function withSecurityHeaders(response) {
  if (response.status === 101) return response;
  const secured = new Response(response.body, response);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    if (!secured.headers.has(name)) secured.headers.set(name, value);
  }
  return secured;
}

// Hostname-level responses that do not depend on the path handlers: www → apex, MTA-STS policy.
export function hostResponse(request) {
  const url = new URL(request.url);
  if (url.hostname === `www.${APEX}`) {
    url.hostname = APEX;
    return Response.redirect(url.toString(), 301);
  }
  if (url.hostname === `mta-sts.${APEX}`) {
    if (url.pathname !== '/.well-known/mta-sts.txt') return new Response('Not Found', { status: 404 });
    return new Response(MTA_STS_POLICY, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=86400' }
    });
  }
  return null;
}

// GitHub Pages also served the site with CORS `*`; agents and tools read the public files cross-origin.
function publicCors(response) {
  if (response.headers.has('Access-Control-Allow-Origin')) return response;
  const copy = new Response(response.body, response);
  copy.headers.set('Access-Control-Allow-Origin', '*');
  return copy;
}

const fetchPath = (assets, request, pathname) => {
  const url = new URL(request.url);
  url.pathname = pathname;
  return assets.fetch(new Request(url, request));
};

export async function serveStatic(request, assets) {
  const url = new URL(request.url);
  const { pathname } = url;

  const candidates = pathname.endsWith('/') ? [`${pathname}index.html`] : [pathname];
  if (!pathname.endsWith('/') && !/\.[^/]+$/.test(pathname)) candidates.push(`${pathname}.html`);

  for (const candidate of candidates) {
    const response = await fetchPath(assets, request, candidate);
    if (response.status !== 404) return publicCors(response);
  }

  if (!pathname.endsWith('/')) {
    const index = await fetchPath(assets, request, `${pathname}/index.html`);
    if (index.ok) {
      url.pathname = `${pathname}/`;
      return Response.redirect(url.toString(), 301);
    }
  }

  const notFound = await fetchPath(assets, new Request(url, { method: 'GET' }), '/404.html');
  return new Response(request.method === 'HEAD' ? null : notFound.body, {
    status: 404,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300' }
  });
}
