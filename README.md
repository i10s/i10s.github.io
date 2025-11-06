# i10s.github.io - Personal Website

[![Netlify Status](https://api.netlify.com/api/v1/badges/ab740aca-b8e6-419e-85ee-5d479bd66d51/deploy-status)](https://app.netlify.com/sites/ifuentes/deploys)

Personal website for Iñaki Fuentes. A minimal, fast, and accessible landing page showcasing professional links and social profiles.

## 🚀 Features

- **Lightweight**: < 10KB total page weight (HTML + CSS)
- **Blazing Fast**: DNS prefetch, preconnect, optimized loading
- **Accessible**: WCAG 2.1 AA compliant, semantic HTML
- **Responsive**: Mobile-first design that works on all devices
- **Dark Mode**: Automatic dark mode based on system preferences
- **SEO Optimized**: Enhanced Open Graph, Twitter Cards, structured data
- **PWA Ready**: Service Worker, offline support, installable
- **Secure**: security.txt, CSP headers, HTTPS enforcement
- **Standards**: humans.txt, proper meta tags, modern web APIs

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

```
.
├── index.html           # Main landing page (optimized)
├── sw.js               # Service Worker for PWA
├── site.webmanifest     # PWA manifest with shortcuts
├── humans.txt          # Credits and tech colophon
├── .htaccess           # Server configuration (caching, security)
├── robots.txt          # Search engine instructions
├── sitemap.xml         # Site structure for SEO
├── budget.json         # Performance budget
├── .well-known/
│   └── security.txt    # Security vulnerability reporting
└── assets/
    ├── images/         # Optimized images
    └── css/            # Legacy CSS (not used in main page)
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

This site is deployed on Netlify:
- **Production URL**: https://ifuentes.net
- **Auto-deploy**: Pushes to `main` branch trigger deployment

## 📈 Monitoring

- **Netlify**: Deployment status and analytics
- **Performance**: Lighthouse CI recommended

## 🧪 Testing

To test the site locally:

```bash
# Simple HTTP server
python3 -m http.server 8000

# Or with Node.js
npx serve .

# Or with PHP
php -S localhost:8000
```

Then visit: http://localhost:8000

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

- **Email**: inaki@ifuentes.net
- **LinkedIn**: [inakifuentes](https://www.linkedin.com/in/inakifuentes/)
- **Twitter**: [@ifuentes](https://twitter.com/ifuentes)
- **GitHub**: [@i10s](https://github.com/i10s)

---

**Stay calm. Be critical. Start building.**
