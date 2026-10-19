/**
 * AI readiness and single-source-of-truth tests.
 * Generative AI engines (ChatGPT, Claude, Perplexity, Gemini, Copilot...) mostly read raw HTML,
 * robots.txt, llms.txt and structured data without running JavaScript. These tests make sure
 * they all get the same, current story, and that derived files never drift from the HTML.
 */

const { JSDOM } = require('jsdom');
const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const dom = file => new JSDOM(read(file)).window.document;
const jsonLd = doc => Array.from(doc.querySelectorAll('script[type="application/ld+json"]')).map(s => JSON.parse(s.textContent));
const nodes = data => data.flatMap(d => d['@graph'] || [d]);
const sitemapDate = url => {
  const xml = read('sitemap.xml');
  const block = xml.slice(xml.indexOf(`<loc>${url}</loc>`));
  return block.match(/<lastmod>(\d{4}-\d{2}-\d{2})/)[1];
};

const CURRENT_ROLE = 'Partner & CTO';
const CURRENT_ORG = 'eVoost AI';
const PAST_ONLY = /travelgate/i;

describe('AI readiness: crawl access', () => {
  const robots = read('robots.txt');

  it('allows every crawler, including AI crawlers, to read the site', () => {
    const groups = robots.split(/\n\s*\n/).filter(g => /user-agent:/i.test(g));
    expect(groups.length).to.be.greaterThan(0);
    groups.forEach(group => {
      expect(group).to.match(/^Allow: \/$/m);
      expect(group).to.not.match(/^Disallow:\s*\/\s*$/m);
    });
  });

  it('names the main AI crawlers explicitly', () => {
    ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'PerplexityBot',
      'Google-Extended', 'Applebot-Extended', 'Bingbot', 'CCBot', 'meta-externalagent', 'Amazonbot']
      .forEach(agent => expect(robots).to.match(new RegExp(`^User-agent: ${agent}$`, 'm')));
  });

  it('keeps legacy snapshots and developer files out of crawlers\' view', () => {
    ['/archive/', '/v2/', '/docs/'].forEach(dir => expect(robots).to.include(`Disallow: ${dir}`));
  });

  it('only uses directives Lighthouse and search engines understand', () => {
    const known = ['user-agent', 'allow', 'disallow', 'sitemap', 'crawl-delay'];
    robots.split('\n').map(l => l.replace(/#.*/, '').trim()).filter(Boolean).forEach(line => {
      expect(known, line).to.include(line.split(':')[0].toLowerCase());
    });
  });

  it('marks legacy pages as noindex', () => {
    ['archive/2024/index2.html', 'archive/2024/index_old.html', 'v2/index.html', 'v2/404.html'].forEach(file => {
      expect(read(file), file).to.match(/<meta name="robots" content="noindex/);
    });
  });

  it('lists only indexable pages in the sitemap', () => {
    const urls = [...read('sitemap.xml').matchAll(/<loc>https:\/\/ifuentes\.net\/([^<]*)<\/loc>/g)].map(m => m[1] || 'index.html');
    urls.filter(u => u.endsWith('.html')).forEach(file => {
      const robotsMeta = dom(file).querySelector('meta[name="robots"]');
      expect(robotsMeta ? robotsMeta.getAttribute('content') : '', file).to.not.include('noindex');
    });
  });

  it('publishes an IndexNow key file that contains its own name', () => {
    const file = fs.readdirSync(root).find(name => /^[0-9a-f]{32}\.txt$/.test(name));
    expect(file).to.exist;
    expect(read(file).trim()).to.equal(file.replace('.txt', ''));
  });
});

describe('AI readiness: machine-readable content', () => {
  it('publishes llms.txt in the llmstxt.org format', () => {
    const llms = read('llms.txt');
    expect(llms).to.match(/^# Iñaki Fuentes\n\n> /);
    expect(llms).to.match(/^## Main pages$/m);
    expect(llms).to.include('https://ifuentes.net/resume.md');
    expect(llms).to.include('https://ifuentes.net/now.md');
  });

  it('keeps llms.txt, llms-full.txt and the Markdown pages in sync with the HTML', () => {
    const { build } = require('../scripts/generate-llms');
    Object.entries(build()).forEach(([file, content]) => {
      expect(read(file), `${file} is stale: run npm run generate:llms`).to.equal(content);
    });
  });

  it('keeps the hashed flap.js URL in sync with the file', () => {
    const { stamp } = require('../scripts/stamp-assets');
    expect(stamp(true).stale, 'run npm run stamp').to.deep.equal([]);
  });

  it('links each content page to its Markdown version', () => {
    [['index.html', '/llms.txt'], ['resume.html', '/resume.md'], ['now.html', '/now.md']].forEach(([page, href]) => {
      expect(dom(page).querySelector(`link[rel="alternate"][type="text/markdown"][href="${href}"]`), page).to.exist;
    });
  });

  it('describes the person in plain prose on the home page', () => {
    const bio = Array.from(dom('index.html').querySelectorAll('#bio ~ p')).map(p => p.textContent).join(' ');
    expect(bio).to.include('Iñaki Fuentes is');
    expect(bio).to.include(`${CURRENT_ROLE} at ${CURRENT_ORG}`);
  });

  it('keeps the name readable without CSS or JavaScript', () => {
    ['index.html', 'now.html', '404.html', 'offline.html'].forEach(page => {
      const h1 = dom(page).querySelector('h1');
      expect(h1.textContent.trim(), page).to.equal(h1.querySelector('.sr').textContent.trim());
    });
  });

  it('opts emails and scripts out of Cloudflare HTML rewriting', () => {
    ['index.html', 'resume.html', 'privacy.html', 'security-policy.html'].forEach(page => {
      const html = read(page);
      const mailtos = (html.match(/href="mailto:/g) || []).length;
      const guarded = (html.match(/<!--email_off--><a href="mailto:/g) || []).length;
      expect(guarded, page).to.equal(mailtos);
    });
    ['index.html', 'resume.html', 'now.html', '404.html', 'offline.html'].forEach(page => {
      dom(page).querySelectorAll('script:not([type]), script[src]').forEach(script => {
        expect(script.getAttribute('data-cfasync'), page).to.equal('false');
      });
    });
  });

  it('uses one Person identity across pages', () => {
    ['index.html', 'resume.html', 'now.html'].forEach(page => {
      const ids = JSON.stringify(jsonLd(dom(page)));
      expect(ids, page).to.include('"https://ifuentes.net/#person"');
    });
  });
});

describe('Single source of truth: current role and dates', () => {
  const home = dom('index.html');
  const person = jsonLd(home)[0];

  it('home structured data shows the current role', () => {
    expect(person['@type']).to.equal('Person');
    expect(person.jobTitle).to.equal(CURRENT_ROLE);
    expect(person.worksFor.map(o => o.name)).to.include(CURRENT_ORG);
  });

  it('the résumé lists the same current role first', () => {
    const roles = jsonLd(dom('resume.html'))[0].mainEntity.worksFor;
    expect(roles[0].roleName).to.equal(CURRENT_ROLE);
    expect(roles[0].worksFor.name).to.equal(CURRENT_ORG);
    expect(roles[0]).to.not.have.property('endDate');
  });

  it('every summary of "now" agrees, and none presents a past job as current', () => {
    const summaries = {
      'index description': home.querySelector('meta[name="description"]').getAttribute('content'),
      'index og:description': home.querySelector('meta[property="og:description"]').getAttribute('content'),
      'index twitter:description': home.querySelector('meta[name="twitter:description"]').getAttribute('content'),
      'index JSON-LD description': person.description,
      'manifest description': JSON.parse(read('site.webmanifest')).description,
      'humans.txt role': read('humans.txt').match(/Role: (.*)/)[1],
      'llms.txt summary': read('llms.txt').match(/^> (.*)$/m)[1],
      'now.html description': dom('now.html').querySelector('meta[name="description"]').getAttribute('content'),
      'latest feed item': read('feed.xml').split('<item>')[1]
    };
    const pastTenseOnly = ['latest feed item'];
    Object.entries(summaries).filter(([where]) => !pastTenseOnly.includes(where)).forEach(([where, text]) => {
      expect(text, where).to.not.match(PAST_ONLY);
    });
    pastTenseOnly.forEach(where => {
      (summaries[where].match(/[^.<>]*travelgate[^.<>]*/gi) || []).forEach(sentence => {
        expect(sentence, `${where} must mention Travelgate only in the past`).to.match(/\b(just landed|was|were|had|previously|former|now part of)\b/i);
      });
    });
    ['manifest description', 'humans.txt role', 'llms.txt summary', 'now.html description', 'latest feed item'].forEach(where => {
      expect(summaries[where], where).to.include(CURRENT_ORG);
    });
  });

  it('the Now page lists the current role as in flight', () => {
    const cards = Array.from(dom('now.html').querySelectorAll('.card h3')).map(h => h.textContent.trim());
    expect(cards[0]).to.equal(CURRENT_ORG);
  });

  it('structured data, sitemap and visible dates agree', () => {
    const home = nodes(jsonLd(dom('index.html'))).find(n => n['@type'] === 'ProfilePage');
    expect(home.dateModified).to.equal(sitemapDate('https://ifuentes.net/'));
    expect(jsonLd(dom('resume.html'))[0].dateModified).to.equal(sitemapDate('https://ifuentes.net/resume.html'));
    const now = jsonLd(dom('now.html'))[0];
    expect(now.dateModified).to.equal(sitemapDate('https://ifuentes.net/now.html'));
    const [y, m, d] = now.dateModified.split('-').map(Number);
    const visible = new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
    expect(dom('now.html').querySelector('.eyebrow').textContent).to.include(`Updated ${visible}`);
  });
});
