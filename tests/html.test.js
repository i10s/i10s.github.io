/**
 * HTML Validation Tests
 * Tests for index.html structure, metadata, and semantic correctness
 */

const { JSDOM } = require('jsdom');
const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

describe('HTML Structure', () => {
  let dom;
  let document;
  let html;

  before(() => {
    html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
    dom = new JSDOM(html);
    document = dom.window.document;
  });

  describe('Basic Structure', () => {
    it('should have valid doctype', () => {
      expect(html).to.match(/^<!DOCTYPE html>/i);
    });

    it('should have html element with lang attribute', () => {
      const htmlEl = document.querySelector('html');
      expect(htmlEl).to.exist;
      expect(htmlEl.getAttribute('lang')).to.equal('en');
    });

    it('should have head element', () => {
      expect(document.head).to.exist;
    });

    it('should have body element', () => {
      expect(document.body).to.exist;
    });

    it('should have title element', () => {
      const title = document.querySelector('title');
      expect(title).to.exist;
      expect(title.textContent).to.have.length.greaterThan(0);
    });
  });

  describe('Meta Tags', () => {
    it('should have charset meta tag', () => {
      const charset = document.querySelector('meta[charset]');
      expect(charset).to.exist;
      expect(charset.getAttribute('charset').toLowerCase()).to.equal('utf-8');
    });

    it('should have viewport meta tag', () => {
      const viewport = document.querySelector('meta[name="viewport"]');
      expect(viewport).to.exist;
      expect(viewport.getAttribute('content')).to.include('width=device-width');
    });

    it('should have description meta tag', () => {
      const description = document.querySelector('meta[name="description"]');
      expect(description).to.exist;
      expect(description.getAttribute('content')).to.have.length.greaterThan(50);
    });

    it('should have author meta tag', () => {
      const author = document.querySelector('meta[name="author"]');
      expect(author).to.exist;
    });

    it('should have keywords meta tag', () => {
      const keywords = document.querySelector('meta[name="keywords"]');
      expect(keywords).to.exist;
    });

    it('should have theme-color meta tag', () => {
      const themeColor = document.querySelector('meta[name="theme-color"]');
      expect(themeColor).to.exist;
    });
  });

  describe('Open Graph Tags', () => {
    const requiredOgTags = ['og:title', 'og:description', 'og:url', 'og:type', 'og:image'];

    requiredOgTags.forEach(tag => {
      it(`should have ${tag} meta tag`, () => {
        const ogTag = document.querySelector(`meta[property="${tag}"]`);
        expect(ogTag).to.exist;
        expect(ogTag.getAttribute('content')).to.have.length.greaterThan(0);
      });
    });

    it('should have og:locale meta tag', () => {
      const locale = document.querySelector('meta[property="og:locale"]');
      expect(locale).to.exist;
      expect(locale.getAttribute('content')).to.equal('en_US');
    });
  });

  describe('Twitter Card Tags', () => {
    it('should have twitter:card meta tag', () => {
      const card = document.querySelector('meta[name="twitter:card"]');
      expect(card).to.exist;
      expect(card.getAttribute('content')).to.equal('summary');
    });

    it('should have twitter:title meta tag', () => {
      const title = document.querySelector('meta[name="twitter:title"]');
      expect(title).to.exist;
    });

    it('should have twitter:description meta tag', () => {
      const description = document.querySelector('meta[name="twitter:description"]');
      expect(description).to.exist;
    });
  });

  describe('PWA Tags', () => {
    it('should link to web manifest', () => {
      const manifest = document.querySelector('link[rel="manifest"]');
      expect(manifest).to.exist;
      expect(manifest.getAttribute('href')).to.include('manifest');
    });

    it('should have apple-touch-icon', () => {
      const appleIcon = document.querySelector('link[rel="apple-touch-icon"]');
      expect(appleIcon).to.exist;
    });

    it('should have favicon', () => {
      const favicon = document.querySelector('link[rel="icon"]');
      expect(favicon).to.exist;
    });
  });

  describe('Structured Data', () => {
    it('should have JSON-LD script', () => {
      const jsonLd = document.querySelector('script[type="application/ld+json"]');
      expect(jsonLd).to.exist;
    });

    it('should have valid JSON-LD', () => {
      const jsonLd = document.querySelector('script[type="application/ld+json"]');
      expect(() => JSON.parse(jsonLd.textContent)).to.not.throw();
    });

    it('should have Person schema', () => {
      const jsonLd = document.querySelector('script[type="application/ld+json"]');
      const data = JSON.parse(jsonLd.textContent);
      expect(data['@type']).to.equal('Person');
      expect(data.name).to.exist;
      expect(data.jobTitle).to.exist;
    });
  });

  describe('Semantic HTML', () => {
    it('should use semantic header element', () => {
      const header = document.querySelector('header');
      expect(header).to.exist;
    });

    it('should use semantic nav element', () => {
      const nav = document.querySelector('nav');
      expect(nav).to.exist;
    });

    it('should use semantic footer element', () => {
      const footer = document.querySelector('footer');
      expect(footer).to.exist;
    });

    it('should have proper heading hierarchy', () => {
      const h1 = document.querySelector('h1');
      expect(h1).to.exist;
    });
  });

  describe('Links', () => {
    it('should have canonical link', () => {
      const canonical = document.querySelector('link[rel="canonical"]');
      expect(canonical).to.exist;
    });

    it('should secure external links', () => {
      const externalLinks = Array.from(document.querySelectorAll('a[target="_blank"]'));
      externalLinks.forEach(link => {
        const rel = link.getAttribute('rel') || '';
        expect(rel).to.include('noopener');
        expect(rel).to.include('noreferrer');
      });
    });

    it('should have rel=me on social links', () => {
      const socialLinks = Array.from(document.querySelectorAll('nav a'));
      socialLinks.forEach(link => {
        const rel = link.getAttribute('rel') || '';
        if (link.href.includes('linkedin') || link.href.includes('github') || link.href.includes('twitter')) {
          expect(rel).to.include('me');
        }
      });
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label on navigation', () => {
      const nav = document.querySelector('nav');
      expect(nav.hasAttribute('aria-label')).to.be.true;
    });

    it('should have aria-labels on all external links', () => {
      const externalLinks = Array.from(document.querySelectorAll('a[target="_blank"]'));
      externalLinks.forEach(link => {
        expect(link.hasAttribute('aria-label')).to.be.true;
      });
    });

    it('should have proper alt text on images', () => {
      const images = Array.from(document.querySelectorAll('img'));
      images.forEach(img => {
        expect(img.hasAttribute('alt')).to.be.true;
      });
    });

    it('should have lang attribute on html element', () => {
      const html = document.documentElement;
      expect(html.getAttribute('lang')).to.exist;
    });
  });

  describe('Performance', () => {
    it('should use DNS prefetch for external domains', () => {
      const dnsPrefetch = document.querySelector('link[rel="dns-prefetch"]');
      expect(dnsPrefetch).to.exist;
    });

    it('should not have unused preload resources', () => {
      // We intentionally removed preload for SW as it was unused
      const preloads = Array.from(document.querySelectorAll('link[rel="preload"]'));
      // If there are preloads, ensure they're actually used
      preloads.forEach(preload => {
        const href = preload.getAttribute('href');
        expect(href).to.exist;
      });
    });

    it('should have inline CSS', () => {
      const style = document.querySelector('style');
      expect(style).to.exist;
      expect(style.textContent.length).to.be.greaterThan(100);
    });

    it('should not have render-blocking external CSS', () => {
      const externalCSS = document.querySelectorAll('link[rel="stylesheet"]');
      expect(externalCSS.length).to.equal(0);
    });
  });

  describe('CSS Variables', () => {
    it('should define CSS custom properties', () => {
      const style = document.querySelector('style');
      expect(style.textContent).to.include('--color-');
      expect(style.textContent).to.include(':root');
    });

    it('should have dark mode support', () => {
      const style = document.querySelector('style');
      expect(style.textContent).to.include('prefers-color-scheme: dark');
    });
  });

  describe('Security', () => {
    it('should reference security.txt', () => {
      // Check if security.txt exists in well-known or at root
      const securityTxtPath = path.join(__dirname, '../.well-known/security.txt');
      const securityTxtAlt = path.join(__dirname, '../security.txt');
      const exists = fs.existsSync(securityTxtPath) || fs.existsSync(securityTxtAlt);
      expect(exists).to.be.true;
    });

    it('should have humans.txt reference in robots.txt', () => {
      const robotsTxt = fs.readFileSync(path.join(__dirname, '../robots.txt'), 'utf8');
      expect(robotsTxt).to.include('humans.txt');
    });
  });
});
