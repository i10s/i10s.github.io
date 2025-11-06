# Test Suite Documentation

## Overview

Comprehensive test suite for the static website ensuring quality, accessibility, SEO, and performance standards.

## Test Files

### 1. `html.test.js`
Tests HTML structure, metadata, and semantic correctness.

**Coverage:**
- Document structure (doctype, lang, head, body)
- Meta tags (charset, viewport, description, author)
- Open Graph and Twitter Card tags
- PWA tags (manifest, icons)
- JSON-LD structured data
- Semantic HTML5 elements
- Link security (rel="noopener noreferrer")
- Accessibility attributes
- Performance optimizations

### 2. `sw.test.js`
Tests Service Worker functionality and caching strategy.

**Coverage:**
- Configuration (VERSION, CACHE_NAME, OFFLINE_URL)
- Install event (pre-caching, skipWaiting)
- Activate event (clients.claim, cache cleanup)
- Fetch event (cache-first strategy, offline fallback)
- Error handling
- Version management (semantic versioning)
- Integration with index.html

### 3. `manifest.test.js`
Tests PWA manifest completeness and validity.

**Coverage:**
- Required fields (name, short_name, icons, start_url, display, theme_color)
- Icon requirements (192x192, 512x512, maskable)
- Optional enhancements (description, shortcuts, categories)
- File references validation
- Best practices (standalone mode, concise short_name)
- JSON validity

### 4. `accessibility.test.js`
Tests WCAG 2.1 AA compliance and accessibility best practices.

**Coverage:**
- Document structure (lang, title, viewport)
- Heading hierarchy (single h1, proper levels)
- Landmarks (header, nav, footer)
- Links (accessible text, aria-labels, no generic text)
- Images (alt text)
- Forms (labels)
- Keyboard navigation (focus indicators, no positive tabindex)
- Color and contrast (dark mode support)
- Motion preferences (prefers-reduced-motion)
- ARIA attributes (valid usage)
- Semantic HTML5
- Readability (line length, font size)

### 5. `seo-performance.test.js`
Tests search engine optimization and performance best practices.

**SEO Coverage:**
- Essential meta tags (title, description, canonical)
- Open Graph (complete tags, image dimensions)
- Twitter Cards
- JSON-LD structured data
- Sitemap.xml (existence, validity, robots.txt reference)
- Robots.txt (crawling rules, sitemap, humans.txt)
- Content quality (sufficient text, heading structure)
- Mobile optimization (viewport, user scaling)

**Performance Coverage:**
- Resource optimization (inline CSS, no render-blocking)
- File size (under 50KB)
- Caching (service worker)
- Images (dimensions, modern formats)
- Fonts (system fonts, font-display)
- JavaScript (async/defer, modern patterns)
- CSS efficiency (custom properties, dark mode)
- Third-party resources (minimal dependencies)

## Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Specific Test Suite
```bash
npm run test:html          # HTML structure tests
npm run test:sw            # Service Worker tests
npm run test:manifest      # PWA manifest tests
npm run test:a11y          # Accessibility tests
npm run test:seo           # SEO & performance tests
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### HTML Validation
```bash
npm run validate:html
```

### JSON Validation
```bash
npm run validate:json
```

### Lighthouse Audit
```bash
npm run audit
```

## Test Results

### Expected Outcomes

All tests should pass with the following characteristics:

- **HTML Tests**: ~40 assertions
  - Valid structure
  - Complete metadata
  - Proper semantic markup
  - Accessibility attributes

- **Service Worker Tests**: ~20 assertions
  - Proper configuration
  - Event handlers present
  - Cache strategy implemented
  - Offline support

- **Manifest Tests**: ~25 assertions
  - All required fields present
  - Valid icon specifications
  - PWA-ready configuration

- **Accessibility Tests**: ~50 assertions
  - WCAG 2.1 AA compliant
  - Proper ARIA usage
  - Keyboard navigable
  - Screen reader friendly

- **SEO/Performance Tests**: ~45 assertions
  - Complete meta tags
  - Optimized resources
  - Fast load times
  - Mobile-friendly

## Continuous Integration

### GitHub Actions Workflow

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Validate HTML
      run: npm run validate:html
      
    - name: Validate JSON
      run: npm run validate:json
```

## Manual Testing Checklist

### Browser Testing
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Android

### Accessibility Testing
- [ ] Keyboard navigation (Tab, Shift+Tab, Enter)
- [ ] Screen reader (NVDA/JAWS/VoiceOver)
- [ ] High contrast mode
- [ ] Zoom to 200%
- [ ] Dark mode toggle

### Performance Testing
- [ ] Lighthouse (100/100 scores)
- [ ] PageSpeed Insights
- [ ] WebPageTest
- [ ] Mobile network throttling

### PWA Testing
- [ ] Install prompt appears
- [ ] Works offline
- [ ] App shortcuts functional
- [ ] Icons display correctly

### SEO Testing
- [ ] Google Search Console
- [ ] Bing Webmaster Tools
- [ ] Rich results preview
- [ ] Mobile-friendly test

## Troubleshooting

### Tests Failing

1. **HTML Tests Failing**
   - Check for missing meta tags
   - Verify proper semantic structure
   - Ensure all links have proper rel attributes

2. **Service Worker Tests Failing**
   - Check sw.js syntax
   - Verify cache configuration
   - Ensure VERSION is defined

3. **Accessibility Tests Failing**
   - Add missing ARIA labels
   - Fix heading hierarchy
   - Ensure all images have alt text

4. **SEO Tests Failing**
   - Complete meta descriptions
   - Add missing Open Graph tags
   - Verify robots.txt and sitemap.xml

### Common Issues

**JSDOM warnings**: Safe to ignore warnings about navigation/external resources.

**File not found errors**: Ensure all referenced files exist (icons, manifest, etc.).

**Timeout errors**: Increase timeout in test scripts if needed.

## Extending Tests

### Adding New Tests

1. Create new test file in `tests/` directory
2. Follow existing naming convention: `feature.test.js`
3. Use descriptive test names
4. Group related tests with `describe` blocks
5. Add test script to `package.json`

### Example Test

```javascript
const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

describe('New Feature', () => {
  it('should meet requirement', () => {
    const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
    expect(html).to.include('expected-content');
  });
});
```

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Clear Assertions**: Use descriptive expect messages
3. **Coverage**: Aim for high coverage of critical paths
4. **Performance**: Keep tests fast (< 5 seconds total)
5. **Maintenance**: Update tests when features change

## Resources

- [Mocha Documentation](https://mochajs.org/)
- [Chai Assertion Library](https://www.chaijs.com/)
- [JSDOM](https://github.com/jsdom/jsdom)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Lighthouse Scoring](https://web.dev/performance-scoring/)

## Maintenance

### Regular Updates

- Review test suite monthly
- Update dependencies quarterly
- Add tests for new features
- Remove obsolete tests
- Update documentation

### Version History

- **1.0.0** (2025-11-06): Initial test suite
  - 5 test files
  - ~180 total assertions
  - Full coverage of HTML, SW, PWA, A11y, SEO, Performance
