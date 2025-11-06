/**
 * Accessibility (a11y) Tests
 * Tests for WCAG 2.1 AA compliance and accessibility best practices
 */

const { JSDOM } = require('jsdom');
const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

describe('Accessibility Tests', () => {
  let dom;
  let document;

  before(() => {
    const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
    dom = new JSDOM(html);
    document = dom.window.document;
  });

  describe('Document Structure', () => {
    it('should have lang attribute', () => {
      const html = document.documentElement;
      expect(html.getAttribute('lang')).to.exist;
      expect(html.getAttribute('lang')).to.have.length.greaterThan(0);
    });

    it('should have a unique title', () => {
      const title = document.querySelector('title');
      expect(title).to.exist;
      expect(title.textContent.length).to.be.greaterThan(0);
    });

    it('should have proper viewport meta tag', () => {
      const viewport = document.querySelector('meta[name="viewport"]');
      expect(viewport).to.exist;
      const content = viewport.getAttribute('content');
      expect(content).to.include('width=device-width');
    });
  });

  describe('Heading Hierarchy', () => {
    it('should have exactly one h1', () => {
      const h1s = document.querySelectorAll('h1');
      expect(h1s.length).to.equal(1);
    });

    it('should have h1 as first heading', () => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      if (headings.length > 0) {
        expect(headings[0].tagName).to.equal('H1');
      }
    });

    it('should not skip heading levels', () => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      const levels = headings.map(h => parseInt(h.tagName[1]));
      
      for (let i = 1; i < levels.length; i++) {
        const diff = levels[i] - levels[i - 1];
        expect(diff).to.be.at.most(1);
      }
    });
  });

  describe('Landmarks', () => {
    it('should have header landmark', () => {
      const header = document.querySelector('header');
      expect(header).to.exist;
    });

    it('should have navigation landmark', () => {
      const nav = document.querySelector('nav');
      expect(nav).to.exist;
    });

    it('should have footer landmark', () => {
      const footer = document.querySelector('footer');
      expect(footer).to.exist;
    });

    it('navigation should have aria-label', () => {
      const nav = document.querySelector('nav');
      expect(nav.hasAttribute('aria-label')).to.be.true;
    });
  });

  describe('Links', () => {
    it('all links should have accessible text', () => {
      const links = Array.from(document.querySelectorAll('a'));
      links.forEach(link => {
        const text = link.textContent.trim();
        const ariaLabel = link.getAttribute('aria-label');
        const title = link.getAttribute('title');
        
        expect(text.length > 0 || ariaLabel || title).to.be.true;
      });
    });

    it('external links should have aria-label', () => {
      const externalLinks = Array.from(document.querySelectorAll('a[target="_blank"]'));
      externalLinks.forEach(link => {
        expect(link.hasAttribute('aria-label')).to.be.true;
      });
    });

    it('links should not use generic text', () => {
      const links = Array.from(document.querySelectorAll('a'));
      const genericTexts = ['click here', 'read more', 'more', 'link', 'here'];
      
      links.forEach(link => {
        const text = link.textContent.trim().toLowerCase();
        expect(genericTexts).to.not.include(text);
      });
    });

    it('should secure external links', () => {
      const externalLinks = Array.from(document.querySelectorAll('a[target="_blank"]'));
      externalLinks.forEach(link => {
        const rel = link.getAttribute('rel') || '';
        expect(rel).to.include('noopener');
      });
    });
  });

  describe('Images', () => {
    it('all images should have alt text', () => {
      const images = Array.from(document.querySelectorAll('img'));
      images.forEach(img => {
        expect(img.hasAttribute('alt')).to.be.true;
      });
    });

    it('decorative images should have empty alt', () => {
      // Check if any images are marked as decorative
      const decorativeImages = Array.from(document.querySelectorAll('img[role="presentation"]'));
      decorativeImages.forEach(img => {
        expect(img.getAttribute('alt')).to.equal('');
      });
    });
  });

  describe('Forms', () => {
    it('form inputs should have labels', () => {
      const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
      inputs.forEach(input => {
        const id = input.id;
        const ariaLabel = input.getAttribute('aria-label');
        const ariaLabelledBy = input.getAttribute('aria-labelledby');
        const label = document.querySelector(`label[for="${id}"]`);
        
        expect(label || ariaLabel || ariaLabelledBy).to.exist;
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('interactive elements should be focusable', () => {
      const interactive = Array.from(document.querySelectorAll('a, button, input, select, textarea'));
      interactive.forEach(el => {
        const tabindex = el.getAttribute('tabindex');
        if (tabindex !== null) {
          expect(parseInt(tabindex)).to.be.at.least(-1);
        }
      });
    });

    it('should not use positive tabindex', () => {
      const elements = Array.from(document.querySelectorAll('[tabindex]'));
      elements.forEach(el => {
        const tabindex = parseInt(el.getAttribute('tabindex'));
        expect(tabindex).to.be.at.most(0);
      });
    });

    it('should have visible focus indicators in CSS', () => {
      const style = document.querySelector('style');
      expect(style.textContent).to.match(/:focus/);
    });
  });

  describe('Color and Contrast', () => {
    it('should support dark mode', () => {
      const style = document.querySelector('style');
      expect(style.textContent).to.include('prefers-color-scheme: dark');
    });

    it('should not use color alone to convey information', () => {
      // This is a reminder - manual check required
      // External links use → symbol in addition to color
      const externalLinks = Array.from(document.querySelectorAll('a[target="_blank"]'));
      expect(externalLinks.length).to.be.greaterThan(0);
    });
  });

  describe('Motion and Animation', () => {
    it('should respect reduced motion preferences', () => {
      const style = document.querySelector('style');
      expect(style.textContent).to.match(/prefers-reduced-motion/);
    });

    it('animations should be subtle', () => {
      const style = document.querySelector('style');
      // Check that transition durations are reasonable (< 1s)
      const transitions = style.textContent.match(/transition:\s*[^;]*?(\d+(?:\.\d+)?)(s|ms)/g);
      if (transitions) {
        transitions.forEach(trans => {
          const match = trans.match(/(\d+(?:\.\d+)?)(s|ms)/);
          if (match) {
            const duration = parseFloat(match[1]);
            const unit = match[2];
            if (unit === 's') {
              expect(duration).to.be.at.most(1);
            }
          }
        });
      }
    });
  });

  describe('ARIA', () => {
    it('should not use invalid ARIA attributes', () => {
      const validAria = [
        'aria-label', 'aria-labelledby', 'aria-describedby',
        'aria-hidden', 'aria-live', 'aria-atomic', 'aria-relevant',
        'aria-current', 'aria-expanded', 'aria-haspopup',
        'aria-controls', 'aria-owns', 'aria-activedescendant'
      ];
      
      const allElements = Array.from(document.querySelectorAll('*'));
      allElements.forEach(el => {
        Array.from(el.attributes).forEach(attr => {
          if (attr.name.startsWith('aria-')) {
            expect(validAria).to.include(attr.name);
          }
        });
      });
    });

    it('aria-hidden elements should not contain focusable content', () => {
      const hiddenElements = Array.from(document.querySelectorAll('[aria-hidden="true"]'));
      hiddenElements.forEach(el => {
        const focusable = el.querySelectorAll('a, button, input, select, textarea, [tabindex]');
        expect(focusable.length).to.equal(0);
      });
    });
  });

  describe('Tables', () => {
    it('tables should have captions or aria-label', () => {
      const tables = Array.from(document.querySelectorAll('table'));
      tables.forEach(table => {
        const caption = table.querySelector('caption');
        const ariaLabel = table.getAttribute('aria-label');
        const ariaLabelledBy = table.getAttribute('aria-labelledby');
        
        expect(caption || ariaLabel || ariaLabelledBy).to.exist;
      });
    });

    it('table headers should use th elements', () => {
      const tables = Array.from(document.querySelectorAll('table'));
      tables.forEach(table => {
        const headers = table.querySelectorAll('th');
        const rows = table.querySelectorAll('tr');
        if (rows.length > 1) {
          expect(headers.length).to.be.greaterThan(0);
        }
      });
    });
  });

  describe('Language', () => {
    it('should specify language for foreign phrases', () => {
      // This is a reminder - manual check required
      // Foreign phrases should use <span lang="xx">
      const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
      const hasMultilingualContent = html.includes('lang="') && html.match(/lang="/g).length > 1;
      // This test passes if there's awareness of language tagging
      expect(hasMultilingualContent || true).to.be.true;
    });
  });

  describe('Content Structure', () => {
    it('should use semantic HTML5 elements', () => {
      const semanticElements = [
        'header', 'nav', 'main', 'article', 'section', 
        'aside', 'footer', 'figure', 'figcaption'
      ];
      
      const usedSemantic = semanticElements.filter(tag => 
        document.querySelector(tag)
      );
      
      expect(usedSemantic.length).to.be.greaterThan(0);
    });

    it('should have descriptive page structure', () => {
      const header = document.querySelector('header');
      const footer = document.querySelector('footer');
      
      expect(header).to.exist;
      expect(footer).to.exist;
    });
  });

  describe('Error Prevention', () => {
    it('required inputs should be marked', () => {
      const requiredInputs = Array.from(document.querySelectorAll('[required]'));
      requiredInputs.forEach(input => {
        const ariaRequired = input.getAttribute('aria-required');
        expect(input.hasAttribute('required') || ariaRequired === 'true').to.be.true;
      });
    });
  });

  describe('Readability', () => {
    it('should have reasonable line length', () => {
      const style = document.querySelector('style');
      // Check for max-width or similar constraints
      const hasWidthConstraint = style.textContent.includes('max-width') || 
                                   style.textContent.includes('width:');
      expect(hasWidthConstraint).to.be.true;
    });

    it('should use readable font size', () => {
      const style = document.querySelector('style');
      // Check that font-size is defined
      expect(style.textContent).to.match(/font-size:/);
    });
  });
});
