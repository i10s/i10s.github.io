/**
 * Site-wide page tests
 * Structure, accessibility and integrity checks for every primary page,
 * plus the shared split-flap script, service worker precache and assets.
 */

const { JSDOM } = require('jsdom');
const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const pages = ['index.html', 'resume.html', 'now.html', 'about.html', 'contact.html', 'developers/index.html', '404.html', 'offline.html'];

// Map a same-origin URL ("/now.html", "/", "/images/x.webp?v=1") to a file on disk
const toFile = url => {
  const clean = url.replace(/^https:\/\/ifuentes\.net/, '').split(/[?#]/)[0];
  if (clean === '/' || clean === '') return path.join(root, 'index.html');
  return path.join(root, clean.replace(/^\//, ''));
};

pages.forEach(page => {
  describe(`Page: ${page}`, () => {
    let html;
    let document;

    before(() => {
      html = read(page);
      document = new JSDOM(html).window.document;
    });

    it('has doctype, lang, charset and a responsive viewport', () => {
      expect(html).to.match(/^<!DOCTYPE html>/i);
      expect(document.documentElement.getAttribute('lang')).to.equal('en');
      expect(document.querySelector('meta[charset]')).to.exist;
      const viewport = document.querySelector('meta[name="viewport"]').getAttribute('content');
      expect(viewport).to.include('width=device-width');
      expect(viewport).to.not.include('user-scalable=no');
    });

    it('has a title and a meaningful meta description', () => {
      expect(document.title.trim()).to.have.length.greaterThan(5);
      const description = document.querySelector('meta[name="description"]');
      expect(description).to.exist;
      expect(description.getAttribute('content')).to.have.length.greaterThan(50);
    });

    it('has exactly one h1 and no skipped heading levels', () => {
      expect(document.querySelectorAll('h1').length).to.equal(1);
      const levels = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => Number(h.tagName[1]));
      expect(levels[0]).to.equal(1);
      for (let i = 1; i < levels.length; i++) {
        expect(levels[i] - levels[i - 1]).to.be.at.most(1);
      }
    });

    it('inlines its CSS with dark mode and reduced motion support', () => {
      const style = document.querySelector('style');
      expect(style).to.exist;
      expect(style.textContent).to.include('prefers-color-scheme: dark');
      expect(style.textContent).to.match(/prefers-reduced-motion:\s*reduce/);
      expect(document.querySelectorAll('link[rel="stylesheet"]').length).to.equal(0);
    });

    it('loads external scripts without blocking and only from files that exist', () => {
      document.querySelectorAll('script[src]').forEach(script => {
        expect(script.hasAttribute('defer') || script.hasAttribute('async')).to.be.true;
        const src = script.getAttribute('src');
        if (src.startsWith('/')) expect(fs.existsSync(toFile(src)), src).to.be.true;
      });
    });

    it('loads flap.js when it shows split-flap tiles or boards', () => {
      if (document.querySelector('[data-tiles], [data-board]')) {
        expect(document.querySelector('script[src^="/flap.js?v="][defer]')).to.exist;
      }
    });

    it('gives split-flap tiles a text alternative', () => {
      document.querySelectorAll('.tiles').forEach(tiles => {
        expect(tiles.getAttribute('aria-hidden')).to.equal('true');
        const heading = tiles.closest('h1');
        expect(heading).to.exist;
        expect(heading.querySelector('.sr').textContent.trim()).to.have.length.greaterThan(0);
      });
    });

    it('secures and labels links that open a new tab', () => {
      document.querySelectorAll('a[target="_blank"]').forEach(link => {
        const rel = link.getAttribute('rel') || '';
        expect(rel).to.include('noopener');
        expect(rel).to.include('noreferrer');
        expect(link.getAttribute('aria-label')).to.match(/new tab/i);
      });
    });

    it('uses descriptive link text', () => {
      const generic = ['click here', 'read more', 'more', 'link', 'here'];
      document.querySelectorAll('a').forEach(link => {
        const name = (link.getAttribute('aria-label') || link.textContent).trim().toLowerCase();
        expect(name).to.have.length.greaterThan(0);
        expect(generic).to.not.include(name);
      });
    });

    it('has no broken internal links', () => {
      document.querySelectorAll('a[href^="/"]').forEach(link => {
        const href = link.getAttribute('href');
        expect(fs.existsSync(toFile(href)), href).to.be.true;
      });
    });

    it('has images with alt text, dimensions and existing files', () => {
      document.querySelectorAll('img').forEach(img => {
        expect(img.hasAttribute('alt')).to.be.true;
        expect(img.hasAttribute('width')).to.equal(img.hasAttribute('height'));
        expect(fs.existsSync(toFile(img.getAttribute('src')))).to.be.true;
      });
    });

    it('keeps focusable content out of aria-hidden regions', () => {
      document.querySelectorAll('[aria-hidden="true"]').forEach(el => {
        expect(el.querySelectorAll('a, button, input, select, textarea, [tabindex]').length).to.equal(0);
      });
    });

    it('uses unique ids', () => {
      const ids = Array.from(document.querySelectorAll('[id]')).map(el => el.id);
      expect(new Set(ids).size).to.equal(ids.length);
    });

    it('points social images at files that exist', () => {
      const og = document.querySelector('meta[property="og:image"]');
      if (og) expect(fs.existsSync(toFile(og.getAttribute('content')))).to.be.true;
    });
  });
});

describe('Departure and arrival boards', () => {
  let document;

  before(() => {
    document = new JSDOM(read('index.html')).window.document;
  });

  it('renders both boards with five cells per row', () => {
    const boards = document.querySelectorAll('[data-board]');
    expect(boards.length).to.equal(2);
    boards.forEach(board => {
      const rows = board.querySelectorAll('.rows > li');
      expect(rows.length).to.be.greaterThan(0);
      rows.forEach(row => expect(row.children.length).to.equal(5));
    });
  });

  it('keeps every board cell flap-able (plain text first)', () => {
    document.querySelectorAll('.rows > li > span').forEach(cell => {
      expect(cell.firstChild && cell.firstChild.nodeType).to.equal(3);
    });
  });
});

describe('Résumé', () => {
  let document;

  before(() => {
    document = new JSDOM(read('resume.html')).window.document;
  });

  it('lists the career history with dates and titles', () => {
    const jobs = document.querySelectorAll('article.job');
    expect(jobs.length).to.be.at.least(10);
    jobs.forEach(job => {
      expect(job.querySelector('.when').textContent.trim()).to.have.length.greaterThan(3);
      expect(job.querySelector('h3').textContent.trim()).to.have.length.greaterThan(2);
    });
  });

  it('has print styles', () => {
    expect(document.querySelector('style').textContent).to.include('@media print');
  });
});

describe('flap.js', () => {
  let code;

  before(() => {
    code = read('flap.js');
  });

  it('stays small', () => {
    expect(Buffer.byteLength(code)).to.be.below(8 * 1024);
  });

  it('respects reduced motion and prerendering', () => {
    expect(code).to.include('prefers-reduced-motion: reduce');
    expect(code).to.include('prerendering');
  });

  it('animates through data attributes so page text never changes', () => {
    expect(code).to.include('dataset.c');
    expect(code).to.include('dataset.fx');
    expect(code).to.not.match(/(tile|cell)\.textContent\s*=/);
    const css = read('index.html').match(/<style>([\s\S]*?)<\/style>/)[1];
    expect(css).to.include('content:attr(data-c)');
    expect(css).to.match(/content:attr\(data-fx\)\/""/);
  });

  it('has no external dependencies', () => {
    expect(code).to.not.match(/\bimport\b|\brequire\(|https?:\/\//);
  });
});

describe('Assets and offline support', () => {
  it('precaches only files that exist (a missing one breaks install)', () => {
    const sw = read('sw.js');
    const list = sw.match(/const urlsToCache = \[([\s\S]*?)\];/)[1];
    const urls = (list.match(/'([^']+)'/g) || []).map(s => s.slice(1, -1));
    expect(urls.some(url => url.startsWith('/flap.js?v='))).to.be.true;
    urls.forEach(url => expect(fs.existsSync(toFile(url)), url).to.be.true);
  });

  it('serves every manifest icon and shortcut', () => {
    const manifest = JSON.parse(read('site.webmanifest'));
    manifest.icons.forEach(icon => expect(fs.existsSync(toFile(icon.src)), icon.src).to.be.true);
    (manifest.shortcuts || []).forEach(s => expect(fs.existsSync(toFile(s.url)), s.url).to.be.true);
  });

  it('has an SVG favicon', () => {
    expect(read('favicon.svg')).to.include('<svg');
  });
});
