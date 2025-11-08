# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added (Unreleased)

- Comprehensive test suite with 200+ automated tests
- GitHub Actions CI/CD workflow for automated testing
- Lighthouse CI configuration for performance monitoring
- Enhanced offline page with brand-consistent styling
- Expanded structured data with complete social profile links
- Privacy notice placeholder for future analytics

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
