# i10s.github.io - Personal Website

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-deployed-success?logo=github)](https://ifuentes.net)

Personal website for Iñaki Fuentes. Twenty years in travel tech, told as an airport split-flap board: **Departures** is what he does now, **Arrivals** is where he has been, and the contact card is a boarding pass. Built for clarity, low maintenance and strong defaults (performance, accessibility, PWA, SEO).

## ✈️ Design: "Departures"

- **Split-flap hero**: the name is a row of flap tiles that flip once on load
- **Departures / Arrivals boards**: current roles and career history, with live Palma and UAE clocks
- **Boarding pass**: contact card with passenger fields, links and a barcode stub
- **Wayfinding palette**: airport signage yellow (`#ffcc00`), board black and warm paper; system UI and monospace fonts only
- **Themed edge pages**: 404 is "Gate changed", offline is "Delayed"
- **Print-ready résumé**: two A4 pages, black on white
- **Easter egg**: Konami code on the home page (↑ ↑ ↓ ↓ ← → ← → B A)

Motion is a single flap on load, never looping, and is disabled entirely with `prefers-reduced-motion`. The flapping happens in `aria-hidden` overlays, so screen readers and search engines always read the real text.

## 🚀 Features

- **Lightweight**: Strict performance budget (Document ≤22KB, Total ≤35KB per page)
- **Blazing Fast**: DNS prefetch, preconnect, optimized loading
- **Accessible**: WCAG 2.1 AA compliant, semantic HTML
- **Responsive**: Mobile-first design with fluid typography and grid layouts
- **Dark Mode**: Automatic dark mode based on system preferences
- **High Contrast Mode**: WCAG AAA support for prefers-contrast: more
- **SEO Optimized**: Enhanced Open Graph, Twitter Cards, structured data
- **PWA Ready**: Service Worker, offline support, installable
- **Smooth Navigation**: Native cross-document View Transitions (progressive enhancement)
- **Secure**: security.txt, CSP headers, HTTPS enforcement
- **Standards**: humans.txt, proper meta tags, modern web APIs
- **Web Vitals**: Real-time performance monitoring (CLS, LCP, FID, INP)
- **RSS Feed**: Subscribe to updates via feed.xml
- **Now Page**: Current focus following nownownow.com standard

## 🛠️ Tech Stack

- Pure HTML5
- CSS3 with CSS Variables for theming
- Vanilla JavaScript: `flap.js` (~5KB, shared by all pages) and the Service Worker
- Semantic markup
- JSON-LD structured data
- Progressive Web App (PWA)

## 📊 Performance Targets & Budgets

Actual numbers vary by change; a lightweight baseline is enforced via automated checks.

### Budgets (validated in pre-commit via `scripts/check-budget.js`)

| Category      | Limit per page |
| ------------- | -------------- |
| Document HTML | 22KB (home 24KB, résumé 26KB: bio, structured data) |
| CSS           | 8KB (inline + same-origin external) |
| JavaScript    | 10KB (inline + same-origin external) |
| Images        | 5KB            |
| Total         | 35KB (HTML + external JS/CSS + images, each byte counted once) |

### Targets

- Lighthouse: Aim for 95–100 in Performance, Accessibility, Best Practices, SEO
- First Contentful Paint: < 0.8s on median broadband
- Time To Interactive: < 1.2s
- Layout Shift (CLS): ~0 (no unexpected shifts)
- Zero 3rd-party blocking scripts (except optional analytics when added)

## 🎨 Design Principles

1. **One idea, executed well**: the airport board metaphor, no other decoration
2. **Typography**: System UI sans for reading, system monospace for the board; zero font downloads
3. **Color**: Light (paper) and dark (night terminal) themes via CSS custom properties; the board stays dark in both
4. **Accessibility**: Keyboard navigation, screen reader support, sufficient contrast ratios, reduced motion
5. **Progressive enhancement**: every page is complete without JavaScript

## 📁 Project Structure

```text
.
├── index.html           # Home: split-flap hero, departures/arrivals boards, boarding pass
├── resume.html          # Résumé ("flight log"), print-ready
├── now.html             # Current focus (/now page)
├── about.html, contact.html, developers/ # Trust pages and developer portal (generated, do not edit by hand)
├── blog/                # Blog (/blog/): posts/*.md are the source; everything else is generated
├── 404.html             # "Gate changed" error page
├── offline.html         # "Delayed" offline fallback
├── flap.js              # Split-flap tiles, board flaps, clocks, Konami easter egg
├── llms.txt, llms-full.txt, index.md, resume.md, now.md # Generated for AI engines (do not edit by hand)
├── webmcp.js, auth.md, openapi.json, schema.jsonl, schemamap.xml, .well-known/ # Generated agent discovery files (do not edit by hand)
├── worker/              # Cloudflare Worker: REST API, MCP server, A2A agent, NLWeb /ask, Link headers
├── sw.js                # Service Worker (network-first pages, cached assets)
├── favicon.svg          # Brand mark (PNG/ICO icons rendered from it)
├── og.png, og-*.png     # Social cards (generated from cards/)
├── web-vitals.js        # Performance monitoring (loaded on localhost or with ?vitals)
├── site.webmanifest     # PWA manifest
├── feed.xml             # RSS/Atom feed
├── humans.txt           # Credits and tech colophon
├── robots.txt           # Search engine instructions
├── sitemap.xml          # Site structure for SEO
├── scripts/
│   ├── dev-server.js    # Local development server with live reload
│   ├── check-budget.js  # Performance budget check (pre-commit + CI)
│   ├── generate-og-cards.js # Social card templates + PNG rendering
│   ├── agent-config.js  # Single source for agent tools, skills and endpoints
│   ├── generate-agent-files.js # llms.txt, Markdown, cards, catalog, OpenAPI, skill, webmcp.js from HTML + config
│   ├── agent-pages.js   # About, Contact and Developers pages (used by generate-agent-files.js)
│   ├── generate-blog.js # Blog pages, topic pages, feed and sitemap block from blog/posts/*.md
│   ├── stamp-assets.js  # Content hash for /flap.js?v=… and /webmcp.js?v=… in pages and the service worker
│   ├── indexnow.js      # Ping IndexNow (Bing, Yandex…) with the sitemap URLs
│   └── fix-html.js      # HTML validation fixer (all primary pages)
├── docs/                # Extended documentation & notes
├── tests/               # Comprehensive test suite (320+ tests)
└── .github/workflows/   # CI/CD automation
```

## 🔧 Optimization Techniques

### Performance

- Inline critical CSS (eliminates render-blocking)
- DNS prefetch and preconnect for external domains
- No JavaScript dependencies: one small shared script (`flap.js`, deferred) plus the Service Worker
- Optimized images with proper formats
- Browser caching configured via .htaccess
- Compression enabled for all text assets
- `will-change` hints for smooth animations

### PWA Features

- Service Worker: network-first for pages (always fresh), stale-while-revalidate for assets
- Offline functionality
- Installable on mobile devices
- App shortcuts in manifest (Résumé, Now)
- Background updates

### Accessibility

- Semantic HTML5 elements
- ARIA labels for screen readers
- Proper heading hierarchy
- Keyboard navigation support
- Focus visible indicators
- Reduced motion support

### SEO

- Structured data (JSON-LD)
- Open Graph meta tags
- Twitter Card meta tags
- Canonical URL
- Descriptive meta descriptions
- Proper title tags

## 🤖 AI Engines (ChatGPT, Claude, Perplexity, Gemini, Copilot…)

Most AI crawlers and assistants read raw HTML without running JavaScript, so every page is complete as plain HTML and the site speaks their formats:

- **Crawl access**: `robots.txt` welcomes all crawlers and names the main AI agents (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-User, PerplexityBot, Google-Extended, Applebot-Extended, CCBot…). Search, AI answers and training are allowed and declared with [Content Signals](https://contentsignals.org) (`search=yes, ai-input=yes, ai-train=yes`). Legacy snapshots (`/archive/`, `/v2/`) and developer files are excluded and marked `noindex`, so there is one current version.
- **[llms.txt](https://ifuentes.net/llms.txt)** ([llmstxt.org](https://llmstxt.org)), **llms-full.txt**, **index.md**, **resume.md** and **now.md**: Markdown versions generated from the HTML (`npm run generate:agents`), linked with `<link rel="alternate" type="text/markdown">`. The `.md` pages (and the blog's) open with front matter: `title`, `description`, `canonical`, `last_updated`. The blog and the developer portal have their own `llms.txt` (`/blog/llms.txt`, `/developers/llms.txt`), linked from the root one.
- **Plain-prose bio** on the home page and **JSON-LD**: `Person` (one `@id` across pages, with a `contactPoint`), the organisations he works for with `address` and `contactPoint` (from their own sites), `WebSite` + `ProfilePage` with `dateModified`, `AboutPage`, `ContactPage`, `WebAPI`, `Blog`/`BlogPosting` and `BreadcrumbList`; résumé roles as `EmployeeRole` and credentials as `EducationalOccupationalCredential`.
- **Trust pages**: [About](https://ifuentes.net/about.html) and [Contact](https://ifuentes.net/contact.html), generated from the home and Now pages, linked from the footer.
- **NLWeb Schema Feeds**: `Schemamap:` in `robots.txt` points to [`/schemamap.xml`](https://ifuentes.net/schemamap.xml), which lists `/schema.jsonl` (every JSON-LD node of the pages), `/blog/schema.jsonl` and the RSS feeds. Lighthouse does not know the directive, so its `robots-txt` audit reports it; that is the price of the NLWeb check.
- **Clean text**: split-flap animations only change `data-*` attributes rendered by CSS, so the DOM text is never scrambled.
- **Cloudflare-safe markup**: `<!--email_off-->` around emails and `data-cfasync="false"` on scripts, so Email Obfuscation and Rocket Loader do not rewrite what bots read.
- **Freshness**: sitemap `lastmod`, JSON-LD `dateModified` and visible dates agree (tested). After a deploy, `npm run indexnow` pings Bing (which feeds ChatGPT search, Copilot and DuckDuckGo), Yandex, Seznam and Naver through [IndexNow](https://www.indexnow.org).
- **Single source of truth**: `tests/ai.test.js` fails if any summary (meta tags, manifest, humans.txt, llms.txt, feed) presents a past job as current or if derived files drift from the HTML.

### Agent endpoints (Cloudflare agent-readiness, level 4–5)

Everything below is generated from `scripts/agent-config.js` and the HTML (`npm run generate:agents`), so names, descriptions and URLs always match:

| Check | What the site publishes |
| --- | --- |
| Developer portal | [`/developers/`](https://ifuentes.net/developers/): every interface with `curl` examples, linked from the home page footer |
| REST API + OpenAPI | Read-only JSON at `/api` (`/api/profile`, `/api/resume`, `/api/now`, `/api/posts`, `/api/posts/{slug}`), RFC 9457 errors, described by [`/openapi.json`](https://ifuentes.net/openapi.json) (OpenAPI 3.1) |
| MCP Server Card | [`/.well-known/mcp/server-card.json`](https://ifuentes.net/.well-known/mcp/server-card.json) (also `/.well-known/mcp.json`) for the read-only MCP server at `/mcp`, with registry `name`, `version`, `description` and `icons` |
| A2A Agent Card | [`/.well-known/agent-card.json`](https://ifuentes.net/.well-known/agent-card.json) for the A2A agent at `/a2a` |
| NLWeb | `/ask?query=…` (or a v0.55 `POST`), list mode, optional server-sent events; deterministic ranking of pages and posts |
| Agent Skills | [`/.well-known/agent-skills/index.json`](https://ifuentes.net/.well-known/agent-skills/index.json) (v0.2.0) with the `inaki-fuentes` skill: how to answer questions about him from first-party sources |
| WebMCP | `webmcp.js` registers `get_profile`, `get_resume`, `get_now`, `get_blog_posts` and `get_blog_post` with `document.modelContext` on the content pages |
| API Catalog | [`/.well-known/api-catalog`](https://ifuentes.net/.well-known/api-catalog) (RFC 9727 linkset): `item` links to the REST API, MCP, A2A and NLWeb, each with `service-desc` and `service-doc` |
| Auth.md | [`/auth.md`](https://ifuentes.net/auth.md): no authentication is needed (the scan expects a registration flow, which a site without accounts does not have) |
| ARD | [`/.well-known/ard.json`](https://ifuentes.net/.well-known/ard.json) (and legacy `ai-catalog.json`): Agentic Resource Discovery manifest of the MCP server, A2A agent, skills and llms.txt |
| Personal Agent Protocol | [`/.well-known/poppy.json`](https://ifuentes.net/.well-known/poppy.json): website-only declaration (agents browse as ordinary visitors) |
| Link headers | The Worker adds `Link` headers (`api-catalog`, `service-desc` for OpenAPI and the cards, `service-doc`, `describedby`, `ard`) to the home page |
| Markdown negotiation | `GET /` with `Accept: text/markdown`, or from an assistant fetching for a user (`ChatGPT-User`, `Claude-User`, `Perplexity-User`…), returns `/index.md` (`Vary: Accept, User-Agent`) |

The REST API, MCP server, A2A agent and NLWeb endpoint run on a small Cloudflare Worker ([`worker/`](worker/README.md)) on a few paths only; they read the published Markdown and `blog/posts.json` at request time and never hold their own copy of the facts. OAuth, Web Bot Auth and the commerce checks do not apply to a site without logins, bots or payments. DNS-AID needs one DNS record (see [worker/README.md](worker/README.md#optional-dns-for-ai-discovery-dns-aid)).

## ✍️ Blog

`/blog/` holds long-form posts in Spanish (and occasionally English) on five topics: liderazgo, tecnología, eVoost, Fliinow and personal.

- **Source**: `blog/posts/YYYY-MM-DD-slug.md` with front matter (`title`, `date`, `description` ≤200 chars, `topic`, optional `lang`, `updated`). Body: paragraphs, `##`/`###`, lists, quotes, code, bold, italic, links.
- **Generated** by `npm run generate:blog` (also part of `npm run build`): `blog/index.html`, `blog/tema/<topic>/`, `blog/<slug>/index.html`, `blog/<slug>.md` (Markdown for agents, with front matter), `blog/feed.xml` (RSS with full text), `blog/posts.json` (for `/api/posts` and `/ask`), `blog/llms.txt`, `blog/schema.jsonl` and the `<!-- blog:start -->` block of `sitemap.xml`. Publishing a post only touches `blog/` and `sitemap.xml`. Deleting a post removes its pages. `validate:generated` fails if anything is stale.
- **No JavaScript** on blog pages; same palette, nav and board look as the rest of the site; `BlogPosting` JSON-LD tied to the one `Person` `@id`.
- **Publishing** is automated from the private `i10s/me` repo: an approved post is committed to `blog/posts/`, generated, validated and pushed, and GitHub Pages deploys it.

## 🚀 Deployment

This site is deployed on **GitHub Pages**:

- **Production URL**: <https://ifuentes.net>
- **Auto-deploy**: Pushes to `main` branch trigger deployment
- **Build time**: ~1-2 minutes
- **Agent endpoints**: after the Pages deploy, `cd worker && npm run deploy` (Cloudflare Worker, see [worker/README.md](worker/README.md))
- **After deploy**: `npm run indexnow` to ask search and AI engines to recrawl the sitemap URLs

## 📈 Monitoring & Tooling

- **GitHub Actions**: CI runs test + validation suite on every push
- **Pre-commit Hooks**: Husky runs HTML validation, performance budgets, generated-file checks and tests locally (commit blocked on failure)
- **Web Vitals**: Optional collection via `web-vitals.js` (dev mode)
- **Manual Audits**: Lighthouse CI or local Chrome DevTools when making larger UI changes

## 🧪 Testing

Comprehensive test suite (320+ assertions) covers structure, accessibility, SEO, AI readiness, PWA and performance heuristics.

### Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific test suites
npm run test:html          # HTML structure
npm run test:sw            # Service Worker
npm run test:manifest      # PWA manifest
npm run test:a11y          # Accessibility
npm run test:seo           # SEO & performance

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Categories (Summary)

- HTML structure & semantics
- Accessibility (WCAG 2.1 AA + dark/high contrast support)
- SEO & Metadata (Open Graph, Twitter, JSON-LD)
- Performance heuristics (inline critical CSS, budgets, service worker caching)
- PWA (manifest fields, service worker lifecycle)
- Responsive & preference media queries (viewport, reduced motion, color scheme)

See [tests/README.md](tests/README.md) for detailed documentation.

### Local Development & Testing

To work locally:

```bash
# Development server with live reload (recommended)
npm run dev

# Or simple HTTP server
python3 -m http.server 8000

# Or with Node.js
npx serve .

# Or with PHP
php -S localhost:8000
```

Then visit: <http://localhost:8000>

### Continuous Integration

GitHub Actions automatically runs tests on every push and pull request. See `.github/workflows/test.yml`.

## ✅ Browser Support

Optimized for evergreen browsers (latest 2 versions): Chromium (Chrome/Edge), Firefox, Safari (desktop & iOS), Android Chrome. Graceful fallback: older browsers still render core content without enhancements.

Progressive enhancement approach avoids hard dependency on JS for primary content.

## 📝 License

Copyright © 2026 Iñaki Fuentes. All rights reserved.

## 🤝 Contributing

While this is a personal site, suggestions are welcome. If proposing changes:

1. Fork & clone repository
2. Create a branch (`feat/short-description`)
3. Run `npm install`
4. Make changes (avoid adding heavy dependencies)
5. Run `npm test` (ensure all suites pass)
6. Commit (pre-commit hook will validate budgets + tests)
7. Open a Pull Request

### Adding a New Page Checklist

| Step | Action |
|------|--------|
| 1 | Create `yourpage.html` with semantic structure & `lang="en"` |
| 2 | Add to `sitemap.xml` (keep ordering logical; `lastmod` must match the page's JSON-LD `dateModified`) |
| 3 | Reference in `robots.txt` if needed (ensure not disallowed) |
| 4 | Add link (if appropriate) to `index.html` nav or footer |
| 5 | Ensure meta description & unique title |
| 6 | If you edit `index.html`, `resume.html`, `now.html`, `flap.js` or `scripts/agent-config.js`, run `npm run build` (regenerates llms.txt, Markdown, agent cards and script hashes) |
| 7 | Run `npm test` and ensure budgets are within limits |
| 8 | Commit, push, then `npm run indexnow` once the deploy is live |

Keep page HTML lean: inline critical CSS only if necessary; reuse existing patterns.

### Style & Tone

English B2 level, concise sentences, active voice, no marketing fluff.

## 📞 Contact

- **Email**: <inaki@ifuentes.net>
- **LinkedIn**: [inakifuentes](https://www.linkedin.com/in/inakifuentes/)
- **X**: [@ifuentes](https://x.com/ifuentes)
- **GitHub**: [@i10s](https://github.com/i10s)

---

**Stay calm. Be critical. Start building.**

_Trying to be less wrong every day._
