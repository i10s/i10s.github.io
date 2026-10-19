# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.2.0] - 2026-10-19

Agent-ready: from level 1 to level 4–5 on Cloudflare's agent-readiness scan, without faking any endpoint.

### Added (3.2.0)

- Content Signals in `robots.txt`: `search=yes, ai-input=yes, ai-train=yes`
- Read-only MCP server at `/mcp` and A2A agent at `/a2a` on a Cloudflare Worker (`worker/`); both return the published Markdown verbatim, with no generative AI
- MCP Server Card (`/.well-known/mcp/server-card.json`, `/.well-known/mcp.json`), A2A Agent Card (`/.well-known/agent-card.json`), API catalog (`/.well-known/api-catalog`, RFC 9727) and `auth.md` (no authentication needed)
- Agent Skills index (`/.well-known/agent-skills/index.json`, v0.2.0) with the `inaki-fuentes` skill, generated from the Now page
- WebMCP tools (`get_profile`, `get_resume`, `get_now`) registered by `webmcp.js` on the content pages
- ARD manifest (`/.well-known/ard.json`, legacy `/.well-known/ai-catalog.json`) and a website-only Personal Agent Protocol declaration (`/.well-known/poppy.json`)
- Discovery `Link` headers on the home page; Markdown negotiation keeps working through the Worker
- `scripts/agent-config.js` as the single source for tools and endpoints; `tests/worker.test.js` and new checks in `tests/ai.test.js`

### Changed (3.2.0)

- `scripts/generate-llms.js` is now `scripts/generate-agent-files.js` (`npm run generate:agents`)
- `stamp-assets.js` hashes every script (`flap.js`, `webmcp.js`); Service Worker 1.3.0
- The budget check counts only executable JavaScript as script; JSON-LD stays in the document size
- Lighthouse 13.5 (accepts `Content-Signal`); Node 22 baseline, CI on Node 22 and 24 (Node 20 is end of life)

## [3.1.0] - 2026-10-19

AI engines: one current, machine-readable version of the site.

### Added (3.1.0)

- `llms.txt`, `llms-full.txt`, `resume.md` and `now.md`, generated from the HTML (`npm run generate:llms`) and linked as `text/markdown` alternates
- Plain-prose "About Iñaki Fuentes" bio on the home page
- JSON-LD: one `Person` `@id` across pages, `WebSite` + `ProfilePage` (with `dateModified`) on the home page, résumé roles as `EmployeeRole` and credentials as `EducationalOccupationalCredential`, `WebPage` on Now
- `robots.txt` names the main AI crawlers and assistants (OpenAI, Anthropic, Perplexity, Google, Apple, Meta, Amazon, Common Crawl…)
- IndexNow key and `npm run indexnow` to ask Bing, Yandex, Seznam and Naver to recrawl after a deploy
- `scripts/stamp-assets.js`: content-hashed `/flap.js?v=…` in pages and the service worker
- `npm run validate:generated` in pre-commit and CI; `tests/ai.test.js` (crawl access, llms.txt, Cloudflare-safe markup, current role and dates agree everywhere)
- `max-snippet:-1, max-image-preview:large` robots meta on content pages

### Changed (3.1.0)

- `flap.js` animates `data-*` attributes rendered with CSS `content: attr()`, so the DOM text crawlers and screen readers read is never scrambled
- Emails wrapped in `<!--email_off-->` and scripts marked `data-cfasync="false"` so Cloudflare Email Obfuscation and Rocket Loader leave them alone
- Service Worker 1.2.0 precaches the hashed script
- Merged PR #1 (WebSite JSON-LD, large social cards, `rel=me` links) with the new structured data
- Budgets support per-path entries (home document 24KB, résumé 26KB); the checker applies the matching entry

### Removed (3.1.0)

- November 2025 feed item that still presented Travelgate as the current focus
- `stats.html` from the sitemap (it is `noindex`)
- Legacy snapshots (`/archive/`, `/v2/`) and developer folders from crawling; legacy pages are now `noindex`

## [3.0.0] - 2026-10-13

"Departures": full redesign and content update from the October 2026 CV.

### Added (3.0.0)

- Split-flap hero, Departures (current roles) and Arrivals (career history) boards with live PMI/UAE clocks
- Boarding-pass contact card with portrait (3KB WebP)
- `flap.js`: shared progressive-enhancement script (tiles, board flaps in `aria-hidden` overlays, clocks, Konami easter egg); reduced-motion and prerender aware
- Themed 404 ("Gate changed") and offline ("Delayed") pages
- New brand mark: `favicon.svg` plus regenerated PNG/ICO icons (maskable-safe)
- Open Graph cards per page (`og.png`, `og-resume.png`, `og-now.png`) and a generator that renders them with local Chrome
- Speculation Rules prerendering for `/now.html` and `/resume.html`
- Manifest shortcuts (Résumé, Now)
- `tests/pages.test.js`: 81 checks across all pages (structure, a11y, links, assets, SW precache integrity)

### Changed (3.0.0)

- Content: Partner & CTO at eVoost AI, co-founder of Fliinow; Travelgate (acquired by Travelsoft) moved to history; full career, education, certifications and awards from the new CV
- Résumé rebuilt as a print-ready "flight log" (two A4 pages)
- Now page rewritten for October 2026
- Service Worker 1.1.0: network-first pages, stale-while-revalidate assets, precache bypasses the HTTP cache
- Budget check counts same-origin external JS/CSS and no longer double-counts inline code in the total; covers `offline.html`
- Web Vitals logging only on localhost or with `?vitals`
- Privacy page aligned with the new palette; `security.txt` expiry extended to 2027-10-13

### Removed (3.0.0)

- Discord link (legacy `name#1234` URL no longer resolves)
- Résumé entries not present in the new CV (Lever Consulting, Foro Europeo MTI-E, ESIN HND, Columbia course)

## [Unreleased]

### Added (Unreleased)

- Comprehensive test suite with 200+ automated tests
- GitHub Actions CI/CD workflow for automated testing
- Lighthouse CI configuration for performance monitoring
- Enhanced offline page with brand-consistent styling
- Expanded structured data with complete social profile links
- Privacy notice placeholder for future analytics
- Native cross-document View Transitions across pages (progressive enhancement, reduced-motion safe)
- Current focus section on the home page
- `engines` field pinning Node >= 18

### Changed (Unreleased)

- Upgraded Mocha to v11 (fixes test runner under Node 22+/26)
- CI Node matrix updated to 20.x and 22.x
- Performance budget now enforced in CI test job
- `validate:html` and `scripts/fix-html.js` now cover all 9 primary pages
- Documentation consolidated into `docs/` (root kept lean)
- Refreshed `sitemap.xml` (added stats page, updated lastmod)

### Fixed (Unreleased)

- HTML validation errors on offline, privacy, stats and security pages
  (void-element style, raw `&`, missing `th[scope]`, inline styles)
- Removed empty `lab/` placeholder page

## [2.0.0] - 2025-11-06

### Added (2.0.0)

- Professional repository governance (CODE_OF_CONDUCT, CONTRIBUTING, SECURITY)
- Service Worker v1.0.1 with offline fallback support
- Offline page for PWA functionality
- Enhanced documentation (ARCHITECTURE, GITHUB_PAGES, TESTS)
- Humans.txt reference in robots.txt
- Security.txt with vulnerability reporting process
- Policy and acknowledgments pages for security transparency
- Feed discovery link (Atom)
- Speculation Rules API for blog prerendering
- Content-visibility CSS optimization

### Changed (2.0.0)

- Updated meta description to reflect current professional role
- Service Worker now uses VERSION constant for cache management
- Improved robots.txt with comprehensive references
- Aligned all documentation to GitHub Pages hosting
- LICENSE now has top-level heading
- Enhanced Open Graph metadata
- Updated JSON-LD structured data with worksFor organization

### Removed (2.0.0)

- Netlify-specific deployment references from documentation
- Legacy `_headers` and `.htaccess` headers (GitHub Pages doesn't support)

### Fixed (2.0.0)

- Service Worker cache cleanup logic
- Offline navigation fallback handling
- Documentation consistency across all markdown files
- Generic link text on home page replaced with descriptive label
- README performance claims aligned with enforced budgets

## [1.0.0] - 2025-11-05

### Added (1.0.0)

- Complete performance optimization (-91% page weight)
- Inline critical CSS (no render-blocking resources)
- Modern CSS with custom properties
- Automatic dark mode support (prefers-color-scheme)
- Reduced motion support (prefers-reduced-motion)
- Complete accessibility improvements (WCAG 2.1 AA compliant)
- ARIA labels on all interactive elements
- Enhanced SEO metadata (Open Graph, Twitter Cards, JSON-LD)
- PWA implementation (manifest, service worker, icons)
- App shortcuts for LinkedIn and GitHub
- DNS prefetch and preconnect optimization
- Responsive typography with clamp()
- Print styles optimization
- Focus-visible indicators for keyboard navigation

### Changed (1.0.0)

- Removed Font Awesome dependency (-80KB)
- Migrated to system font stack
- Simplified HTML structure (single page design)
- Improved link security (noopener, noreferrer)
- Updated sitemap.xml with current dates
- Enhanced robots.txt configuration

### Removed (1.0.0)

- External CSS dependencies
- External JavaScript dependencies (except Service Worker)
- Unused Font Awesome icons
- Render-blocking resources

## [0.1.0] - 2024-01-15

### Added (0.1.0)

- Initial landing page with basic structure
- Social media links
- Resume page
- Basic styling
- Favicon and icons
- robots.txt and sitemap.xml

---

## [2.0.1] - 2025-11-08

### Added (2.0.1)

- Legacy `v2/README.md` explaining snapshot purpose
- Architecture doc enhancements (budgets, workflow, security details)

### Changed (2.0.1)

- `humans.txt` optimization section aligned with current size budgets
- README updated: performance budgets table, contribution workflow, page addition checklist

### Fixed (2.0.1)

- Markdown lint issues in new/updated documentation (lists, headings, indentation)
- Accessibility: replaced generic "More" link text with descriptive variant
- Husky deprecation notice noted for future cleanup (pre-commit still functional)

### Removed (2.0.1)

- Outdated claim of "<10KB total" from README (replaced with explicit budgets)

## Version Guidelines

### Major Version (X.0.0)

Breaking changes to site structure; major feature additions or redesigns; significant architecture changes.

### Minor Version (0.X.0)

New features and enhancements; non-breaking changes to existing functionality; documentation improvements.

### Patch Version (0.0.X)

Bug fixes; minor documentation updates; performance improvements; security patches.

---

## Links

- [Repository](https://github.com/i10s/i10s.github.io)
- [Website](https://ifuentes.net)
- [Documentation](README.md)
