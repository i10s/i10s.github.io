# Architecture Overview

## High-Level
Static site served via GitHub Pages (global CDN). No build/transpile pipeline; all assets are hand-authored. Critical CSS is inline per page. JavaScript is one shared, deferred file (`flap.js`) plus the Service Worker; Web Vitals logging loads only on localhost or with `?vitals`. Speculation Rules prerender `/now.html` and `/resume.html` on hover.

## File Roles
- `index.html`: Home. Split-flap hero, Departures (now) and Arrivals (career) boards, boarding-pass contact card, SEO and structured data.
- `flap.js`: Progressive enhancement for `[data-tiles]` (flap tiles) and `[data-board]` (board rows flap once when scrolled into view), `[data-tz]` clocks and the Konami easter egg. Animations only change `data-c` / `data-fx` attributes rendered by CSS `content: attr()`, so DOM text (what crawlers, AI agents and screen readers read) never changes. They respect `prefers-reduced-motion` and wait for prerender activation. Pages load it as `/flap.js?v=<hash>` (see `scripts/stamp-assets.js`).
- `sw.js`: PWA logic. Network-first for pages, stale-while-revalidate for same-origin assets.
- `site.webmanifest`: PWA metadata (icons, shortcuts).
- `robots.txt` / `sitemap.xml`: Crawling and indexing. All crawlers, including AI crawlers, are allowed; legacy snapshots and developer folders are excluded. Sitemap `lastmod` matches each page's JSON-LD `dateModified`.
- `llms.txt`, `llms-full.txt`, `resume.md`, `now.md`: Markdown for AI engines, generated from the HTML by `scripts/generate-agent-files.js`.
- `<key>.txt`: IndexNow key; `scripts/indexnow.js` submits the sitemap URLs after a deploy.
- `.well-known/security.txt`: Vulnerability disclosure contact.
- `resume.html`: Résumé ("flight log"), print stylesheet fits two A4 pages.
- `now.html`, `404.html`, `offline.html`: Now page, "Gate changed" and "Delayed" pages.
- `humans.txt`: Credits and tech stack.

## Performance Strategies

- Inline critical CSS (eliminate render-blocking)
- Zero render-blocking external CSS/JS
- Resource hints (preconnect, dns-prefetch)
- Enforced performance budgets (per pre-commit + CI):
  - Document ≤22KB
  - CSS ≤8KB
  - JS ≤10KB
  - Images (critical/inline) ≤5KB
  - Total ≤35KB
- `content-visibility: auto` + `contain-intrinsic-size` for large sections
- System font stack (no network font cost)
- Minimal console output (trimmed for size)

## Accessibility

Semantic HTML elements, strict heading hierarchy, ARIA only where needed, visible focus indicators, adaptive color-scheme (dark + high contrast), reduced motion support. Pre-commit + test suite enforce link text descriptiveness and landmark presence.

## Security Considerations

No dynamic backend (static only). Main vectors: external links and supply-chain (dependencies kept minimal). Measures:

- `rel="noopener noreferrer"` on external anchors
- `security.txt` + acknowledgments page
- Service Worker scope restricted to root
- Cache versioning via `VERSION` constant
- No user data collection (privacy by design)

## AI Engines and Single Source of Truth

The HTML pages are the only hand-edited source. Everything derived from them is generated and checked in pre-commit and CI (`npm run validate:generated`):

- Markdown versions and llms.txt (`npm run generate:agents`)
- The flap.js content hash in pages and the service worker (`npm run stamp`)

`tests/ai.test.js` checks crawl access, llms.txt format, Markdown alternates, Cloudflare-safe markup (`<!--email_off-->`, `data-cfasync="false"`), one `Person` `@id` across pages, that every "now" summary (meta tags, manifest, humans.txt, llms.txt, feed) agrees on the current role, and that sitemap, JSON-LD and visible dates match.

## Agent Endpoints (Cloudflare Worker)

A Cloudflare Worker (`worker/`, deployed with wrangler) runs on four paths only; GitHub Pages serves everything else:

- `/mcp`: read-only MCP server (Streamable HTTP, stateless, `createMcpHandler` from the Agents SDK). Tools and resources come from `worker/src/config.json`.
- `/a2a`: A2A JSON-RPC agent. Deterministic: returns the published Markdown verbatim.
- `/`: home page from the origin plus discovery `Link` headers; `passThroughOnException` keeps the page up if the Worker fails.
- `/.well-known/api-catalog`: origin file with the RFC 9727 content type.

The Worker fetches `llms.txt`, `resume.md` and `now.md` from the site at request time (5-minute cache), so the HTML stays the only source of facts. Static discovery files (`.well-known/agent-card.json`, `.well-known/mcp/server-card.json`, `.well-known/agent-skills/`, `.well-known/api-catalog`, `.well-known/ard.json`, `.well-known/poppy.json`, `auth.md`, `webmcp.js`) and the Worker config are generated together from `scripts/agent-config.js`.

## PWA Scope

Precached: home, résumé, now, hashed `flap.js` and `webmcp.js`, favicon, portrait, manifest and the offline page. Pages are network-first (fresh after every deploy) with a cache fallback; unknown pages offline return `offline.html`. Assets are stale-while-revalidate. Cache names include the semantic version for controlled invalidation.

### Service Worker Lifecycle

- Install: pre-cache essentials, `skipWaiting`
- Activate: cleanup old caches, `clients.claim`
- Fetch: same-origin GET only; network-first navigations with offline fallback; cached assets refreshed in the background

## Future Extensions (Optional)

- Lightweight privacy-centric analytics (self-hosted, no tracking scripts until requested)
- Automatic image format negotiation (add AVIF fallback hints)
- Incremental hydration for any future interactive widgets (avoid heavy frameworks)
- Build script for generating sitemap & cache manifest hashes (optional if complexity grows)
- CSP reporting endpoint (for real-time monitoring of blocked scripts/styles)

## Workflow Overview

1. Edit HTML/CSS/JS.
2. Run `npm test` (or rely on pre-commit hook).
3. Commit (hooks run: HTML validation, performance budgets, full test suite).
4. Push → GitHub Pages deploy.

## Test Coverage Summary

Automated tests (~200 assertions) cover: structure, accessibility (WCAG 2.1 AA + contrast), SEO metadata, PWA manifest & SW lifecycle, performance heuristics, responsive design preferences.

## Adding a Page (High-Level)

1. Create semantic HTML (`lang="en"`, unique title & meta description).
2. Link it (if needed) from `index.html` navigation/footer.
3. Update `sitemap.xml` and confirm `robots.txt` references.
4. Ensure size remains within budgets; adjust if necessary.
5. Run tests; resolve any accessibility or metadata failures.
6. Commit & push.
