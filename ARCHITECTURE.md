# Architecture Overview

## High-Level
Static site served via GitHub Pages. No build pipeline. Hand-authored HTML + inline CSS, minimal JS (Service Worker + speculation rules).

## File Roles
- `index.html`: Main landing page, includes SEO, structured data, performance hints.
- `sw.js`: Cache-first PWA logic for core assets.
- `site.webmanifest`: PWA metadata (icons, shortcuts).
- `robots.txt` / `sitemap.xml`: Search engine crawling & indexing directives.
- `.well-known/security.txt`: Vulnerability disclosure contact.
- `resume.html`: Secondary static page.
- `humans.txt`: Credits and tech stack.

## Performance Strategies
- Inline critical CSS
- Zero external render-blocking resources
- Resource hints (preconnect, preload)
- Small asset footprint (≤10KB initial)
- content-visibility for deferred rendering

## Accessibility
Semantic HTML, ARIA where necessary, focus styles preserved, color-scheme adaptive.

## Security Considerations
No dynamic backend. Risks limited to client-side caching & external links. SW scope restricted. External links hardened with `rel="noopener noreferrer"`.

## PWA Scope
Cached: shell assets (HTML, manifest, icon). Strategy: cache-first fallback to network.

## Future Extensions (Optional)
- Add offline fallback page
- Add versioning banner via manifest change
- Integrate minimal analytics (privacy-centric) if needed.
