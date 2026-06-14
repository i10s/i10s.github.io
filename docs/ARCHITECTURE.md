# Architecture Overview

## High-Level
Static site served via GitHub Pages (global CDN). No build/transpile pipeline; all assets are hand-authored. Critical CSS is inline, minimal JS (Service Worker + optional Web Vitals). Speculation Rules removed from current root (legacy reference lives in docs).

## File Roles
- `index.html`: Main landing page, includes SEO, structured data, performance hints.
- `sw.js`: Cache-first PWA logic for core assets.
- `site.webmanifest`: PWA metadata (icons, shortcuts).
- `robots.txt` / `sitemap.xml`: Search engine crawling & indexing directives.
- `.well-known/security.txt`: Vulnerability disclosure contact.
- `resume.html`: Secondary static page.
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

## PWA Scope

Cached: shell assets (root HTML, manifest, key icons, offline page). Strategy: cache-first with network fallback; offline navigation returns `offline.html`. Cache names include semantic version for controlled invalidation.

### Service Worker Lifecycle

- Install: pre-cache essentials, `skipWaiting`
- Activate: cleanup old caches, `clients.claim`
- Fetch: cache-first, fallback to network; offline fallback for navigations

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
