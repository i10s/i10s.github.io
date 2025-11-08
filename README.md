# i10s.github.io - Personal Website

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-deployed-success?logo=github)](https://ifuentes.net)

Personal website for Iñaki Fuentes. A minimal, fast, and accessible landing page showcasing professional links and social profiles. Built for clarity, low maintenance and strong defaults (performance, accessibility, PWA, SEO).

## 🚀 Features

- **Lightweight**: Strict performance budget (Document ≤22KB, Total ≤35KB per page)
- **Blazing Fast**: DNS prefetch, preconnect, optimized loading
- **Accessible**: WCAG 2.1 AA compliant, semantic HTML
- **Responsive**: Mobile-first design with fluid typography and grid layouts
- **Dark Mode**: Automatic dark mode based on system preferences
- **High Contrast Mode**: WCAG AAA support for prefers-contrast: more
- **SEO Optimized**: Enhanced Open Graph, Twitter Cards, structured data
- **PWA Ready**: Service Worker, offline support, installable
- **Secure**: security.txt, CSP headers, HTTPS enforcement
- **Standards**: humans.txt, proper meta tags, modern web APIs
- **Web Vitals**: Real-time performance monitoring (CLS, LCP, FID, INP)
- **RSS Feed**: Subscribe to updates via feed.xml
- **Now Page**: Current focus following nownownow.com standard

## 🛠️ Tech Stack

- Pure HTML5
- CSS3 with CSS Variables for theming
- Vanilla JavaScript (Service Worker only)
- Semantic markup
- JSON-LD structured data
- Progressive Web App (PWA)

## 📊 Performance Targets & Budgets

Actual numbers vary by change; a lightweight baseline is enforced via automated checks.

### Budgets (validated in pre-commit via `scripts/check-budget.js`)

| Category      | Limit per page |
| ------------- | -------------- |
| Document HTML | 22KB           |
| CSS           | 8KB            |
| JavaScript    | 10KB           |
| Images        | 5KB inline/critical |
| Total         | 35KB           |

### Targets

- Lighthouse: Aim for 95–100 in Performance, Accessibility, Best Practices, SEO
- First Contentful Paint: < 0.8s on median broadband
- Time To Interactive: < 1.2s
- Layout Shift (CLS): ~0 (no unexpected shifts)
- Zero 3rd-party blocking scripts (except optional analytics when added)

## 🎨 Design Principles

1. **Minimalism**: Content-first approach, no unnecessary elements
2. **Typography**: System fonts for zero load time
3. **Color**: Automatic theming with CSS custom properties
4. **Accessibility**: Keyboard navigation, screen reader support, sufficient contrast ratios

## 📁 Project Structure

```text
.
├── index.html           # Main landing page (optimized)
├── resume.html          # Professional experience & education
├── now.html             # Current focus (/now page)
├── sw.js                # Service Worker for PWA
├── web-vitals.js        # Performance monitoring script
├── site.webmanifest     # PWA manifest
├── feed.xml             # RSS/Atom feed
├── humans.txt           # Credits and tech colophon
├── robots.txt           # Search engine instructions
├── sitemap.xml          # Site structure for SEO
├── scripts/
│   ├── dev-server.js    # Local development server with live reload
│   └── fix-html.js      # HTML validation fixer
├── tests/               # Comprehensive test suite (199 tests)
└── .github/workflows/   # CI/CD automation
```

## 🔧 Optimization Techniques

### Performance

- Inline critical CSS (eliminates render-blocking)
- DNS prefetch and preconnect for external domains
- No JavaScript dependencies (except Service Worker)
- Optimized images with proper formats
- Browser caching configured via .htaccess
- Compression enabled for all text assets
- `will-change` hints for smooth animations

### PWA Features

- Service Worker with cache-first strategy
- Offline functionality
- Installable on mobile devices
- App shortcuts in manifest
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

## 🚀 Deployment

This site is deployed on **GitHub Pages**:

- **Production URL**: <https://ifuentes.net>
- **Auto-deploy**: Pushes to `main` branch trigger deployment
- **Build time**: ~1-2 minutes

## 📈 Monitoring & Tooling

- **GitHub Actions**: CI runs test + validation suite on every push
- **Pre-commit Hooks**: Husky runs HTML validation, performance budgets and tests locally (commit blocked on failure)
- **Web Vitals**: Optional collection via `web-vitals.js` (dev mode)
- **Manual Audits**: Lighthouse CI or local Chrome DevTools when making larger UI changes

## 🧪 Testing

Comprehensive test suite (≈200 assertions) covers structure, accessibility, SEO, PWA and performance heuristics.

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

Copyright © 2025 Iñaki Fuentes. All rights reserved.

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
| 2 | Add to `sitemap.xml` (keep ordering logical) |
| 3 | Reference in `robots.txt` if needed (ensure not disallowed) |
| 4 | Add link (if appropriate) to `index.html` nav or footer |
| 5 | Ensure meta description & unique title |
| 6 | Run `npm test` and ensure budgets are within limits |
| 7 | Commit and push |

Keep page HTML lean: inline critical CSS only if necessary; reuse existing patterns.

### Style & Tone

English B2 level, concise sentences, active voice, no marketing fluff.

## 📞 Contact

- **Email**: <inaki@ifuentes.net>
- **LinkedIn**: [inakifuentes](https://www.linkedin.com/in/inakifuentes/)
- **Twitter**: [@ifuentes](https://twitter.com/ifuentes)
- **GitHub**: [@i10s](https://github.com/i10s)

---

**Stay calm. Be critical. Start building.**

_Trying to be less wrong every day._
