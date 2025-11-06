# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive test suite with 200+ automated tests
- GitHub Actions CI/CD workflow for automated testing
- Lighthouse CI configuration for performance monitoring
- Enhanced offline page with brand-consistent styling
- Expanded structured data with complete social profile links
- Privacy notice placeholder for future analytics

## [2.0.0] - 2025-11-06

### Added
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

### Changed
- Updated meta description to reflect current professional role
- Service Worker now uses VERSION constant for cache management
- Improved robots.txt with comprehensive references
- Aligned all documentation to GitHub Pages hosting
- LICENSE now has top-level heading
- Enhanced Open Graph metadata
- Updated JSON-LD structured data with worksFor organization

### Removed
- Netlify-specific deployment references from documentation
- Legacy `_headers` and `.htaccess` headers (GitHub Pages doesn't support)

### Fixed
- Service Worker cache cleanup logic
- Offline navigation fallback handling
- Documentation consistency across all markdown files

## [1.0.0] - 2025-11-05

### Added
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

### Changed
- Removed Font Awesome dependency (-80KB)
- Migrated to system font stack
- Simplified HTML structure (single page design)
- Improved link security (noopener, noreferrer)
- Updated sitemap.xml with current dates
- Enhanced robots.txt configuration

### Removed
- External CSS dependencies
- External JavaScript dependencies (except Service Worker)
- Unused Font Awesome icons
- Render-blocking resources

## [0.1.0] - 2024-01-15

### Added
- Initial landing page with basic structure
- Social media links
- Resume page
- Basic styling
- Favicon and icons
- robots.txt and sitemap.xml

---

## Version Guidelines

### Major Version (X.0.0)
- Breaking changes to site structure
- Major feature additions or redesigns
- Significant architecture changes

### Minor Version (0.X.0)
- New features and enhancements
- Non-breaking changes to existing functionality
- Documentation improvements

### Patch Version (0.0.X)
- Bug fixes
- Minor documentation updates
- Performance improvements
- Security patches

---

## Links

- [Repository](https://github.com/i10s/i10s.github.io)
- [Website](https://ifuentes.net)
- [Documentation](README.md)
