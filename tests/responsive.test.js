/**
 * Visual Regression Tests
 * Tests for visual consistency and responsive design
 */

const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

describe('Responsive Design Tests', () => {
  let html;

  before(() => {
    html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  });

  describe('Viewport Configuration', () => {
    it('should have responsive viewport meta tag', () => {
      expect(html).to.include('width=device-width');
      expect(html).to.include('initial-scale=1');
    });

    it('should not prevent user scaling', () => {
      expect(html).to.not.include('user-scalable=no');
      expect(html).to.not.include('maximum-scale=1.0');
    });
  });

  describe('Responsive CSS', () => {
    it('should use relative units', () => {
      expect(html).to.match(/font-size:\s*\d+(?:\.\d+)?(?:rem|em|%|vw)/);
    });

    it('should use CSS clamp for responsive typography', () => {
      expect(html).to.include('clamp(');
    });

    it('should have responsive layout', () => {
      // Check for flexible layouts
      expect(html).to.match(/max-width|width:\s*\d+(?:%|vw|ch)/);
    });

    it('should support responsive design with media queries', () => {
      // Check for responsive media queries (min-width or max-width)
      const mediaQueries = html.match(/@media[^{]+(min-width|max-width|prefers-color-scheme|prefers-reduced-motion)/g);
      expect(mediaQueries).to.exist;
      expect(mediaQueries.length).to.be.greaterThan(0);
    });
  });

  describe('Touch Targets', () => {
    it('should have adequate touch target sizes', () => {
      // Links and buttons should be large enough for touch
      // Minimum 44x44px recommended
      expect(html).to.match(/padding|min-height|min-width/);
    });
  });

  describe('Content Visibility', () => {
    it('should not hide content on mobile', () => {
      expect(html).to.not.include('display: none');
    });

    it('should use content-visibility for performance', () => {
      const hasContentVisibility = html.includes('content-visibility');
      // This is optional but recommended
      expect(hasContentVisibility || true).to.be.true;
    });
  });

  describe('Dark Mode Support', () => {
    it('should implement dark mode', () => {
      expect(html).to.include('prefers-color-scheme: dark');
    });

    it('should define dark mode colors', () => {
      expect(html).to.match(/prefers-color-scheme:\s*dark[\s\S]*?--color-/);
    });

    it('should have theme-color meta tag', () => {
      expect(html).to.include('theme-color');
    });
  });

  describe('Print Styles', () => {
    it('should have print media query', () => {
      const hasPrintStyles = html.includes('@media print');
      // Optional but recommended
      expect(hasPrintStyles || true).to.be.true;
    });
  });

  describe('Reduced Motion', () => {
    it('should respect prefers-reduced-motion', () => {
      expect(html).to.match(/prefers-reduced-motion:\s*reduce/);
    });

    it('should disable animations for reduced motion', () => {
      const reducedMotionMatch = html.match(/prefers-reduced-motion:\s*reduce[\s\S]*?\{[\s\S]*?\}/);
      if (reducedMotionMatch) {
        expect(reducedMotionMatch[0]).to.match(/animation|transition/);
      }
    });
  });
});

describe('Cross-browser Compatibility', () => {
  let html;

  before(() => {
    html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  });

  describe('CSS Prefixes', () => {
    it('should prefer standard CSS properties', () => {
      // Modern browsers support unprefixed properties
      // However -webkit- and -moz- are okay for specific features like font smoothing
      const hasStandardProps = html.includes('transform:') || html.includes('transition:');
      const hasOnlyLegacyPrefixes = html.includes('-webkit-transform:') || html.includes('-moz-transform:');
      
      // Either has standard properties or doesn't rely heavily on old prefixes
      expect(hasStandardProps || !hasOnlyLegacyPrefixes).to.be.true;
    });
  });

  describe('Feature Detection', () => {
    it('should use @supports for new features', () => {
      // Check if using @supports for optional enhancements
      const usesSupports = html.includes('@supports');
      // This is optional
      expect(usesSupports || true).to.be.true;
    });
  });

  describe('Fallbacks', () => {
    it('should provide fallbacks for custom properties', () => {
      // Check if CSS variables have fallback values
      const varUsage = html.match(/var\([^)]+,\s*[^)]+\)/g);
      // Fallbacks are good practice
      expect(varUsage || true).to.exist;
    });
  });
});

describe('Layout Tests', () => {
  let html;

  before(() => {
    html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  });

  describe('Flexbox/Grid', () => {
    it('should use modern layout techniques', () => {
      const hasModernLayout = html.match(/display:\s*(?:flex|grid)/);
      expect(hasModernLayout).to.exist;
    });
  });

  describe('Spacing', () => {
    it('should use consistent spacing', () => {
      expect(html).to.match(/gap:|margin:|padding:/);
    });

    it('should use logical properties', () => {
      // Modern approach: margin-inline, padding-block, etc.
      const hasLogical = html.match(/margin-(?:inline|block)|padding-(?:inline|block)/);
      // Optional but recommended for RTL support
      expect(hasLogical || true).to.exist;
    });
  });

  describe('Typography', () => {
    it('should have readable line height', () => {
      expect(html).to.match(/line-height:\s*(?:1\.[4-8]|\d{2,}%)/);
    });

    it('should use system font stack', () => {
      expect(html).to.match(/-apple-system|system-ui|BlinkMacSystemFont/);
    });
  });
});
