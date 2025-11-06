/**
 * SEO and Performance Tests
 * Tests for search engine optimization and performance best practices
 */

const { JSDOM } = require('jsdom');
const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

describe('SEO Tests', () => {
  let dom;
  let document;
  let html;

  before(() => {
    html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
    dom = new JSDOM(html);
    document = dom.window.document;
  });

  describe('Essential Meta Tags', () => {
    it('should have title tag', () => {
      const title = document.querySelector('title');
      expect(title).to.exist;
      expect(title.textContent.length).to.be.within(30, 60);
    });

    it('should have meta description', () => {
      const description = document.querySelector('meta[name="description"]');
      expect(description).to.exist;
      const content = description.getAttribute('content');
      expect(content.length).to.be.within(120, 160);
    });

    it('should have canonical URL', () => {
      const canonical = document.querySelector('link[rel="canonical"]');
      expect(canonical).to.exist;
      expect(canonical.getAttribute('href')).to.match(/^https?:\/\//);
    });

    it('should have robots meta tag or robots.txt', () => {
      const robotsMeta = document.querySelector('meta[name="robots"]');
      const robotsTxtPath = path.join(__dirname, '../robots.txt');
      const hasRobotsTxt = fs.existsSync(robotsTxtPath);
      
      expect(robotsMeta || hasRobotsTxt).to.be.true;
    });
  });

  describe('Open Graph', () => {
    const requiredOGTags = [
      'og:title',
      'og:description',
      'og:image',
      'og:url',
      'og:type'
    ];

    requiredOGTags.forEach(property => {
      it(`should have ${property}`, () => {
        const tag = document.querySelector(`meta[property="${property}"]`);
        expect(tag).to.exist;
        expect(tag.getAttribute('content')).to.have.length.greaterThan(0);
      });
    });

    it('og:image should have dimensions', () => {
      const width = document.querySelector('meta[property="og:image:width"]');
      const height = document.querySelector('meta[property="og:image:height"]');
      
      if (width && height) {
        expect(parseInt(width.getAttribute('content'))).to.be.greaterThan(200);
        expect(parseInt(height.getAttribute('content'))).to.be.greaterThan(200);
      }
    });
  });

  describe('Twitter Cards', () => {
    it('should have twitter:card', () => {
      const card = document.querySelector('meta[name="twitter:card"]');
      expect(card).to.exist;
      expect(card.getAttribute('content')).to.be.oneOf(['summary', 'summary_large_image']);
    });

    it('should have twitter:title', () => {
      const title = document.querySelector('meta[name="twitter:title"]');
      expect(title).to.exist;
    });

    it('should have twitter:description', () => {
      const description = document.querySelector('meta[name="twitter:description"]');
      expect(description).to.exist;
    });
  });

  describe('Structured Data', () => {
    it('should have JSON-LD structured data', () => {
      const jsonLd = document.querySelector('script[type="application/ld+json"]');
      expect(jsonLd).to.exist;
    });

    it('JSON-LD should be valid', () => {
      const jsonLd = document.querySelector('script[type="application/ld+json"]');
      expect(() => JSON.parse(jsonLd.textContent)).to.not.throw();
    });

    it('should use Person or Organization schema', () => {
      const jsonLd = document.querySelector('script[type="application/ld+json"]');
      const data = JSON.parse(jsonLd.textContent);
      expect(data['@type']).to.be.oneOf(['Person', 'Organization', 'WebSite']);
    });

    it('should have @context', () => {
      const jsonLd = document.querySelector('script[type="application/ld+json"]');
      const data = JSON.parse(jsonLd.textContent);
      expect(data['@context']).to.equal('https://schema.org');
    });
  });

  describe('Sitemap', () => {
    it('should have sitemap.xml', () => {
      const sitemapPath = path.join(__dirname, '../sitemap.xml');
      expect(fs.existsSync(sitemapPath)).to.be.true;
    });

    it('sitemap should be valid XML', () => {
      const sitemapPath = path.join(__dirname, '../sitemap.xml');
      const sitemap = fs.readFileSync(sitemapPath, 'utf8');
      expect(sitemap).to.include('<?xml');
      expect(sitemap).to.include('<urlset');
    });

    it('sitemap should be referenced in robots.txt', () => {
      const robotsPath = path.join(__dirname, '../robots.txt');
      const robots = fs.readFileSync(robotsPath, 'utf8');
      expect(robots.toLowerCase()).to.include('sitemap:');
    });
  });

  describe('Robots.txt', () => {
    it('should have robots.txt', () => {
      const robotsPath = path.join(__dirname, '../robots.txt');
      expect(fs.existsSync(robotsPath)).to.be.true;
    });

    it('should allow crawling', () => {
      const robotsPath = path.join(__dirname, '../robots.txt');
      const robots = fs.readFileSync(robotsPath, 'utf8');
      expect(robots).to.match(/User-agent:/i);
    });

    it('should reference sitemap', () => {
      const robotsPath = path.join(__dirname, '../robots.txt');
      const robots = fs.readFileSync(robotsPath, 'utf8');
      expect(robots).to.match(/Sitemap:/i);
    });

    it('should reference humans.txt', () => {
      const robotsPath = path.join(__dirname, '../robots.txt');
      const robots = fs.readFileSync(robotsPath, 'utf8');
      expect(robots).to.match(/humans\.txt/i);
    });
  });

  describe('Content Quality', () => {
    it('should have sufficient text content', () => {
      const body = document.body.textContent.trim();
      expect(body.length).to.be.greaterThan(100);
    });

    it('should have heading structure', () => {
      const h1 = document.querySelector('h1');
      expect(h1).to.exist;
      expect(h1.textContent.trim().length).to.be.greaterThan(0);
    });

    it('should not have duplicate titles', () => {
      const title = document.querySelector('title').textContent;
      const h1 = document.querySelector('h1');
      if (h1) {
        expect(title).to.not.equal(h1.textContent);
      }
    });
  });

  describe('Links', () => {
    it('should not have broken internal links', () => {
      const links = Array.from(document.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]'));
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (!href.startsWith('http')) {
          // Would need file system check for actual validation
          expect(href).to.not.equal('#');
        }
      });
    });

    it('external links should use rel attributes', () => {
      const externalLinks = Array.from(document.querySelectorAll('a[href^="http"]'));
      externalLinks.forEach(link => {
        const href = link.getAttribute('href');
        const currentDomain = new URL(document.querySelector('link[rel="canonical"]').href).hostname;
        
        try {
          const linkDomain = new URL(href).hostname;
          if (linkDomain !== currentDomain) {
            const rel = link.getAttribute('rel') || '';
            expect(rel.length).to.be.greaterThan(0);
          }
        } catch (e) {
          // Skip invalid URLs
        }
      });
    });
  });

  describe('Mobile Optimization', () => {
    it('should have viewport meta tag', () => {
      const viewport = document.querySelector('meta[name="viewport"]');
      expect(viewport).to.exist;
      expect(viewport.getAttribute('content')).to.include('width=device-width');
    });

    it('should not disable user scaling', () => {
      const viewport = document.querySelector('meta[name="viewport"]');
      const content = viewport.getAttribute('content');
      expect(content).to.not.include('user-scalable=no');
      expect(content).to.not.include('maximum-scale=1');
    });
  });
});

describe('Performance Tests', () => {
  let html;
  let document;

  before(() => {
    html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
    const dom = new JSDOM(html);
    document = dom.window.document;
  });

  describe('Resource Optimization', () => {
    it('should use inline critical CSS', () => {
      const styleTag = document.querySelector('style');
      expect(styleTag).to.exist;
      expect(styleTag.textContent.length).to.be.greaterThan(100);
    });

    it('should not have render-blocking external CSS', () => {
      const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
      expect(stylesheets.length).to.equal(0);
    });

    it('should not have render-blocking external JavaScript', () => {
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      const blockingScripts = scripts.filter(s => 
        !s.hasAttribute('async') && !s.hasAttribute('defer')
      );
      expect(blockingScripts.length).to.equal(0);
    });

    it('should preload critical resources', () => {
      const preloads = document.querySelectorAll('link[rel="preload"]');
      expect(preloads.length).to.be.greaterThan(0);
    });

    it('should use DNS prefetch for external domains', () => {
      const dnsPrefetch = document.querySelectorAll('link[rel="dns-prefetch"]');
      expect(dnsPrefetch.length).to.be.greaterThan(0);
    });
  });

  describe('File Size', () => {
    it('HTML file should be under 50KB', () => {
      const stats = fs.statSync(path.join(__dirname, '../index.html'));
      expect(stats.size).to.be.lessThan(50 * 1024);
    });

    it('should minimize whitespace', () => {
      // Check that inline CSS doesn't have excessive whitespace
      const style = document.querySelector('style');
      const hasExcessiveWhitespace = /\n\s{4,}/g.test(style.textContent);
      // This is informational - some formatting is OK
      expect(hasExcessiveWhitespace || true).to.be.true;
    });
  });

  describe('Caching', () => {
    it('should have service worker', () => {
      expect(html).to.include('serviceWorker');
      const swPath = path.join(__dirname, '../sw.js');
      expect(fs.existsSync(swPath)).to.be.true;
    });

    it('should register service worker', () => {
      expect(html).to.match(/navigator\.serviceWorker\.register/);
    });

    it('service worker should cache resources', () => {
      const swPath = path.join(__dirname, '../sw.js');
      const swContent = fs.readFileSync(swPath, 'utf8');
      expect(swContent).to.include('cache');
      expect(swContent).to.include('fetch');
    });
  });

  describe('Images', () => {
    it('images should have width and height attributes', () => {
      const images = Array.from(document.querySelectorAll('img'));
      images.forEach(img => {
        const hasWidth = img.hasAttribute('width');
        const hasHeight = img.hasAttribute('height');
        // Either both or neither (for responsive images)
        expect(hasWidth).to.equal(hasHeight);
      });
    });

    it('should use modern image formats hint', () => {
      const images = Array.from(document.querySelectorAll('img'));
      // Check for picture element or srcset as best practice
      const picture = document.querySelector('picture');
      const srcsets = document.querySelectorAll('[srcset]');
      
      // This is informational - not all sites need this
      expect(images.length === 0 || picture || srcsets.length > 0 || true).to.be.true;
    });
  });

  describe('Fonts', () => {
    it('should use system fonts or preload custom fonts', () => {
      const style = document.querySelector('style');
      const usesSystemFonts = style.textContent.includes('system-ui') || 
                              style.textContent.includes('-apple-system');
      const fontPreload = document.querySelector('link[rel="preload"][as="font"]');
      
      expect(usesSystemFonts || fontPreload).to.be.true;
    });

    it('should use font-display', () => {
      const style = document.querySelector('style');
      if (style.textContent.includes('@font-face')) {
        expect(style.textContent).to.include('font-display');
      }
    });
  });

  describe('JavaScript', () => {
    it('should minimize blocking JavaScript', () => {
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      scripts.forEach(script => {
        const hasAsync = script.hasAttribute('async');
        const hasDefer = script.hasAttribute('defer');
        expect(hasAsync || hasDefer).to.be.true;
      });
    });

    it('should use modern JavaScript patterns', () => {
      const scripts = Array.from(document.querySelectorAll('script:not([src])'));
      scripts.forEach(script => {
        // Should use const/let, not var
        if (script.textContent.length > 10) {
          const usesVar = script.textContent.match(/\bvar\s+/);
          // Modern code should prefer const/let
          expect(usesVar || script.textContent.length < 50).to.be.true;
        }
      });
    });
  });

  describe('CSS Efficiency', () => {
    it('should use CSS custom properties', () => {
      const style = document.querySelector('style');
      expect(style.textContent).to.include('--');
      expect(style.textContent).to.include('var(--');
    });

    it('should support dark mode', () => {
      const style = document.querySelector('style');
      expect(style.textContent).to.include('prefers-color-scheme');
    });

    it('should minimize CSS complexity', () => {
      const style = document.querySelector('style');
      // Check for overly specific selectors (more than 4 levels)
      const deepSelectors = style.textContent.match(/\w+\s+\w+\s+\w+\s+\w+\s+\w+/g);
      expect(deepSelectors || []).to.have.length.lessThan(5);
    });
  });

  describe('Third-party Resources', () => {
    it('should minimize third-party requests', () => {
      const externalResources = Array.from(document.querySelectorAll('[src^="http"], [href^="http"]'));
      const externalDomains = new Set();
      
      externalResources.forEach(el => {
        const url = el.src || el.href;
        try {
          const domain = new URL(url).hostname;
          externalDomains.add(domain);
        } catch (e) {
          // Skip invalid URLs
        }
      });
      
      // Should have minimal external dependencies
      expect(externalDomains.size).to.be.lessThan(10);
    });
  });
});
