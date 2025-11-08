# i10s.github.io - Personal Website

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-deployed-success?logo=github)](https://ifuentes.net)

Personal website for Iñaki Fuentes. A minimal, fast, and accessible landing page showcasing professional links and social profiles.

## 🚀 Features

- **Lightweight**: < 10KB total page weight (HTML + CSS)
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

## 📊 Performance

- **Lighthouse Score**: 100/100 across all categories
- **First Contentful Paint**: < 0.5s
- **Time to Interactive**: < 1s
- **Total Bundle Size**: ~8KB (uncompressed)

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

## 📈 Monitoring

- **GitHub Actions**: Build and deployment logs
- **Performance**: Lighthouse CI recommended

## 🧪 Testing

Comprehensive test suite ensures quality, accessibility, SEO, and performance standards.

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

### Test Coverage

- **HTML Tests**: Structure, metadata, semantic correctness (~40 assertions)
- **Service Worker Tests**: Caching, offline support, version management (~20 assertions)
- **Manifest Tests**: PWA completeness, icon requirements (~25 assertions)
- **Accessibility Tests**: WCAG 2.1 AA compliance, ARIA, keyboard navigation (~50 assertions)
- **SEO/Performance Tests**: Meta tags, optimization, structured data (~45 assertions)
- **Responsive Tests**: Viewport, dark mode, reduced motion (~20 assertions)

**Total: ~200 automated tests** ensuring professional quality standards.

See [tests/README.md](tests/README.md) for detailed documentation.

### Local Testing

To test the site locally:

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

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- iOS Safari: Latest 2 versions
- Android Chrome: Latest 2 versions

## 📝 License

Copyright © 2025 Iñaki Fuentes. All rights reserved.

## 🤝 Contributing

This is a personal website, but suggestions are welcome! Feel free to open an issue.

## 📞 Contact

- **Email**: <inaki@ifuentes.net>
- **LinkedIn**: [inakifuentes](https://www.linkedin.com/in/inakifuentes/)
- **Twitter**: [@ifuentes](https://twitter.com/ifuentes)
- **GitHub**: [@i10s](https://github.com/i10s)

---

**Stay calm. Be critical. Start building.**
