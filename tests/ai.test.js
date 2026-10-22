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

  it('only uses directives Lighthouse and search engines understand, plus the NLWeb Schema Map', () => {
    // schemamap (NLWeb Schema Feeds) is not on Lighthouse's list: it costs the robots-txt audit, on purpose
    const known = ['user-agent', 'allow', 'disallow', 'sitemap', 'crawl-delay', 'content-signal', 'schemamap'];
    robots.split('\n').map(l => l.replace(/#.*/, '').trim()).filter(Boolean).forEach(line => {
      expect(known, line).to.include(line.split(':')[0].toLowerCase());
    });
  });

  it('declares Content Signals allowing search, AI input and AI training in every group', () => {
    const groups = robots.split(/\n\s*\n/).filter(g => /user-agent:/i.test(g));
    groups.forEach(group => {
      const signal = group.match(/^Content-Signal: (.*)$/m);
      expect(signal, group.slice(0, 60)).to.exist;
      const values = Object.fromEntries(signal[1].split(',').map(p => p.trim().split('=')));
      expect(values).to.deep.equal({ search: 'yes', 'ai-input': 'yes', 'ai-train': 'yes' });
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

  it('points the Schema Map directive at a Schema Map whose feeds exist', () => {
    const map = robots.match(/^Schemamap: (.*)$/mi)[1];
    expect(map).to.equal('https://ifuentes.net/schemamap.xml');
    const xml = read('schemamap.xml');
    const doc = new JSDOM(xml, { contentType: 'text/xml' }).window.document;
    expect(doc.querySelector('parsererror')).to.equal(null);
    expect(doc.documentElement.namespaceURI).to.equal('http://www.sitemaps.org/schemas/sitemap/0.9');
    const urls = Array.from(doc.getElementsByTagName('url'));
    expect(urls.length).to.be.greaterThan(0);
    urls.forEach(url => {
      const loc = url.getElementsByTagName('loc')[0].textContent;
      expect(fs.existsSync(path.join(root, loc.replace('https://ifuentes.net/', ''))), loc).to.be.true;
      expect(url.getElementsByTagNameNS('http://schema.org/schemas/schemafeed/0.1', 'contentType')[0].textContent).to.match(/^structuredData\/(schema\.org|rss)$/);
    });
  });

  it('publishes schema.org feeds with one JSON-LD object per line', () => {
    const lines = ['schema.jsonl', 'blog/schema.jsonl'].flatMap(file => read(file).trim().split('\n').map(line => JSON.parse(line)));
    lines.forEach(node => {
      expect(node['@context']).to.equal('https://schema.org');
      expect(node['@type']).to.exist;
    });
    const types = lines.map(n => n['@type']).flat();
    ['Person', 'WebSite', 'ProfilePage', 'AboutPage', 'ContactPage', 'WebAPI', 'Blog'].forEach(type => expect(types).to.include(type));
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

  it('keeps every generated agent file in sync with the HTML and the agent config', () => {
    const { build } = require('../scripts/generate-agent-files');
    Object.entries(build()).forEach(([file, content]) => {
      expect(read(file), `${file} is stale: run npm run generate:agents`).to.equal(content);
    });
  });

  it('keeps the hashed script URLs in sync with the files', () => {
    const { stamp } = require('../scripts/stamp-assets');
    expect(stamp(true).stale, 'run npm run stamp').to.deep.equal([]);
  });

  it('links each content page to its Markdown version', () => {
    [['index.html', '/llms.txt'], ['resume.html', '/resume.md'], ['now.html', '/now.md'], ['404.html', '/404.md'], ['developers/index.html', '/developers/llms.txt']].forEach(([page, href]) => {
      expect(dom(page).querySelector(`link[rel="alternate"][type="text/markdown"][href="${href}"]`), page).to.exist;
      expect(fs.existsSync(path.join(root, href)), href).to.be.true;
    });
  });

  it('opens every Markdown page with front matter: title, description, canonical URL and last update', () => {
    const blogMd = fs.readdirSync(path.join(root, 'blog')).filter(f => f.endsWith('.md')).map(f => `blog/${f}`);
    ['index.md', 'resume.md', 'now.md', ...blogMd].forEach(file => {
      const front = read(file).match(/^---\n([\s\S]*?)\n---\n\n# /);
      expect(front, file).to.exist;
      const fields = Object.fromEntries(front[1].split('\n').map(l => l.match(/^([a-z_]+): (.*)$/)).map(m => [m[1], JSON.parse(m[2])]));
      expect(fields, file).to.include.keys('title', 'description', 'canonical', 'last_updated');
      expect(fields.canonical, file).to.match(/^https:\/\/ifuentes\.net\//);
      expect(fields.last_updated, file).to.match(/^\d{4}-\d{2}-\d{2}$/);
    });
    expect(read('index.md')).to.include(read('llms.txt'));
  });

  it('splits llms.txt by area: the blog and developers have their own, linked from the root', () => {
    const llms = read('llms.txt');
    ['blog/llms.txt', 'developers/llms.txt'].forEach(file => {
      expect(llms).to.include(`https://ifuentes.net/${file}`);
      expect(read(file)).to.match(/^# .+\n\n> /);
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
    ['index.html', 'resume.html', 'privacy.html', 'security-policy.html', 'contact.html', 'developers/index.html'].forEach(page => {
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
    ['index.html', 'resume.html', 'now.html', 'about.html', 'contact.html', 'developers/index.html'].forEach(page => {
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

describe('Agent discovery (Cloudflare agent-readiness checks)', () => {
  const agent = require('../scripts/agent-config');
  const tools = agent.DOCUMENTS.map(d => d.tool);
  const readJson = file => JSON.parse(read(file));

  it('publishes an Agent Skills index (v0.2.0) whose digest matches the skill', () => {
    const index = readJson('.well-known/agent-skills/index.json');
    expect(index.$schema).to.equal('https://schemas.agentskills.io/discovery/0.2.0/schema.json');
    expect(index.skills).to.have.length.greaterThan(0);
    index.skills.forEach(skill => {
      expect(skill.name).to.match(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(skill.type).to.equal('skill-md');
      expect(skill.description.length).to.be.within(20, 1024);
      const body = fs.readFileSync(path.join(root, skill.url));
      const digest = require('crypto').createHash('sha256').update(body).digest('hex');
      expect(skill.digest).to.equal(`sha256:${digest}`);
      const front = body.toString('utf8').match(/^---\nname: (.+)\ndescription: (.+)\n---\n/);
      expect(front, 'SKILL.md frontmatter').to.exist;
      expect(front[1]).to.equal(skill.name);
      expect(JSON.parse(front[2])).to.equal(skill.description);
    });
  });

  it('publishes the same MCP server card at both well-known paths, with registry branding', () => {
    const card = readJson('.well-known/mcp/server-card.json');
    expect(read('.well-known/mcp.json')).to.equal(read('.well-known/mcp/server-card.json'));
    expect(card).to.include.keys('name', 'version', 'description', 'serverUrl', 'icons');
    expect(card.version).to.equal(agent.VERSION);
    expect(card.serverUrl).to.equal(agent.MCP_URL);
    card.icons.forEach(icon => expect(fs.existsSync(path.join(root, icon.src.replace(agent.SITE, ''))), icon.src).to.be.true);
    expect(card.serverInfo).to.include.keys('name', 'version');
    expect(card.url).to.equal(agent.MCP_URL);
    expect(card.transport.type).to.equal('streamable-http');
    expect(card.capabilities.tools).to.equal(true);
    expect(card.tools.map(t => t.name)).to.deep.equal([...tools, agent.POST_TOOL.tool]);
    card.tools.forEach(tool => expect(tool.inputSchema.type, tool.name).to.equal('object'));
  });

  it('describes the REST API and /ask with OpenAPI 3.1, ready for function calling', () => {
    const spec = readJson('openapi.json');
    expect(spec.openapi).to.match(/^3\.1\./);
    expect(spec.servers[0].url).to.equal(agent.SITE);
    const ids = [];
    Object.entries(spec.paths).forEach(([route, item]) => Object.entries(item).forEach(([method, op]) => {
      expect(op.operationId, `${method} ${route}`).to.match(/^[a-z][A-Za-z]+$/);
      expect(op.summary, op.operationId).to.be.a('string');
      expect(op.description, op.operationId).to.be.a('string');
      expect(op.responses, op.operationId).to.have.property('200');
      (op.parameters || []).forEach(p => expect(p.description, `${op.operationId} ${p.name}`).to.be.a('string'));
      ids.push(op.operationId);
    }));
    expect(new Set(ids).size).to.equal(ids.length);
    agent.DOCUMENTS.filter(d => d.api !== false).forEach(d => expect(spec.paths).to.have.property(`/api/${d.id}`));
    ['/api', '/api/posts', '/api/posts/{slug}', '/ask'].forEach(route => expect(spec.paths).to.have.property(route));
    // Every $ref resolves
    JSON.stringify(spec).match(/"\$ref":"[^"]+"/g).map(r => r.slice(8, -1)).forEach(ref => {
      const target = ref.slice(2).split('/').reduce((node, key) => node && node[key], spec);
      expect(target, ref).to.exist;
    });
  });

  it('publishes an A2A agent card with a JSON-RPC interface and one skill per document', () => {
    const card = readJson('.well-known/agent-card.json');
    ['name', 'description', 'version', 'url', 'capabilities', 'skills', 'defaultInputModes', 'defaultOutputModes'].forEach(key => expect(card).to.have.property(key));
    expect(card.url).to.equal(agent.A2A_URL);
    expect(card.supportedInterfaces[0]).to.include({ url: agent.A2A_URL, protocolBinding: 'JSONRPC' });
    expect(card.skills.map(s => s.id)).to.deep.equal(agent.DOCUMENTS.map(d => d.id));
    card.skills.forEach(skill => expect(skill).to.include.keys('id', 'name', 'description'));
  });

  it('lists the REST API, the MCP server and the A2A agent in the RFC 9727 API catalog', () => {
    const catalog = readJson('.well-known/api-catalog');
    const [self, ...apis] = catalog.linkset;
    expect(self.anchor).to.equal(`${agent.SITE}/.well-known/api-catalog`);
    expect(self.item.map(i => i.href)).to.include.members([agent.API_URL, agent.MCP_URL, agent.A2A_URL, agent.ASK_URL]);
    expect(apis.map(entry => entry.anchor)).to.include.members(self.item.map(i => i.href));
    apis.forEach(entry => expect(Object.keys(entry).some(k => ['service-desc', 'service-doc'].includes(k)), entry.anchor).to.be.true);
    const rest = apis.find(entry => entry.anchor === agent.API_URL);
    expect(rest['service-desc'][0].href).to.equal(agent.OPENAPI_URL);
    expect(rest['service-doc'][0].href).to.match(/^https:\/\/ifuentes\.net\/developers\//);
  });

  it('tells agents in auth.md that no authentication is needed', () => {
    const auth = read('auth.md');
    expect(auth).to.match(/^# auth\.md\n\nYou are an agent\./);
    expect(auth).to.include('does not use authentication');
    [agent.MCP_URL, agent.A2A_URL].forEach(url => expect(auth).to.include(url));
  });

  it('registers the same read-only tools with WebMCP on the content pages', () => {
    const script = read('webmcp.js');
    expect(script).to.match(/document\.modelContext \|\| navigator\.modelContext/);
    expect(script).to.include('registerTool(');
    expect(script).to.include('readOnlyHint: true');
    agent.DOCUMENTS.forEach(d => {
      expect(script).to.include(`"name": "${d.tool}"`);
      expect(fs.existsSync(path.join(root, d.path)), d.path).to.be.true;
    });
    ['index.html', 'resume.html', 'now.html'].forEach(page => {
      expect(dom(page).querySelector('script[src^="/webmcp.js?v="][defer]'), page).to.exist;
    });
  });

  it('gives the Worker the same tools and endpoints', () => {
    const workerConfig = readJson('worker/src/config.json');
    expect(workerConfig.documents.map(d => d.tool)).to.deep.equal(tools);
    expect(workerConfig.postTool.tool).to.equal(agent.POST_TOOL.tool);
    workerConfig.documents.forEach(d => expect(fs.existsSync(path.join(root, d.markdown)), d.markdown).to.be.true);
    expect(workerConfig.mcpUrl).to.equal(agent.MCP_URL);
    expect(workerConfig.a2aUrl).to.equal(agent.A2A_URL);
  });

  it('lists the agent endpoints in llms.txt', () => {
    const llms = read('llms.txt');
    expect(llms).to.match(/^## Agent endpoints$/m);
    [agent.MCP_URL, agent.A2A_URL, agent.API_URL, agent.ASK_URL, agent.OPENAPI_URL, '/.well-known/api-catalog', '/.well-known/agent-skills/', '/auth.md'].forEach(url => expect(llms).to.include(url));
  });

  it('publishes an ARD manifest (ard.json and the legacy ai-catalog.json) pointing at real files', () => {
    expect(read('.well-known/ai-catalog.json')).to.equal(read('.well-known/ard.json'));
    const ard = readJson('.well-known/ard.json');
    expect(ard.host.identifier).to.equal('did:web:ifuentes.net');
    ard.entries.forEach(entry => {
      expect(entry.identifier).to.match(/^urn:air:ifuentes\.net:[a-z0-9-]+(:[a-z0-9-]+)*$/);
      expect(entry.displayName).to.be.a('string');
      expect(entry.type).to.match(/^[a-z]+\/[a-z0-9.+-]+$/);
      expect(entry.representativeQueries).to.have.length.within(2, 5);
      const local = entry.url.replace(agent.SITE, '');
      expect(fs.existsSync(path.join(root, local)), entry.url).to.be.true;
    });
    expect(ard.entries.map(e => e.type)).to.include.members(['application/mcp-server-card+json', 'application/a2a-agent-card+json']);
  });

  it('publishes a website-only Personal Agent Protocol declaration without fake auth', () => {
    const poppy = readJson('.well-known/poppy.json');
    expect(poppy.protocol_version).to.match(/^\d+\.\d+$/);
    expect(poppy.organization).to.deep.equal({ name: agent.NAME, domain: 'ifuentes.net' });
    expect(poppy).to.have.property('web');
    ['agent', 'apis', 'auth', 'feedback'].forEach(key => expect(poppy).to.not.have.property(key));
  });
});

describe('Trust pages and developer portal', () => {
  const home = dom('index.html');
  const sitemap = read('sitemap.xml');

  it('links About, Contact and Developers from the home page footer, and lists them in the sitemap', () => {
    ['/about.html', '/contact.html', '/developers/'].forEach(href => {
      expect(home.querySelector(`footer a[href="${href}"]`), href).to.exist;
      expect(sitemap).to.include(`<loc>https://ifuentes.net${href}</loc>`);
    });
    expect(home.querySelector('link[rel="service-desc"][href="/openapi.json"]')).to.exist;
    expect(home.querySelector('link[rel="service-doc"][href="/developers/"]')).to.exist;
  });

  it('marks the pages with AboutPage, ContactPage, WebAPI and breadcrumbs', () => {
    const types = page => nodes(jsonLd(dom(page))).map(n => n['@type']);
    expect(types('about.html')).to.include('AboutPage');
    expect(types('contact.html')).to.include('ContactPage');
    expect(types('developers/index.html')).to.include.members(['WebPage', 'WebAPI']);
    ['about.html', 'contact.html', 'developers/index.html'].forEach(page => {
      const node = nodes(jsonLd(dom(page)))[0];
      expect(node.breadcrumb['@type'], page).to.equal('BreadcrumbList');
    });
  });

  it('gives the organisations a contact point and an address, and the person a contact point', () => {
    const person = jsonLd(home)[0];
    expect(person.contactPoint.email).to.equal('inaki@ifuentes.net');
    person.worksFor.forEach(org => {
      expect(org.contactPoint, org.name).to.exist;
      expect(org.address.addressCountry, org.name).to.equal('ES');
    });
  });

  it('shows the contact email and the same profiles as the home page', () => {
    const contact = dom('contact.html');
    expect(contact.querySelector('a[href="mailto:inaki@ifuentes.net"]')).to.exist;
    ['https://www.linkedin.com/in/inakifuentes/', 'https://github.com/i10s', 'https://x.com/ifuentes'].forEach(href => {
      expect(contact.querySelector(`a[href="${href}"]`), href).to.exist;
      expect(home.querySelector(`a[href="${href}"]`), href).to.exist;
    });
  });

  it('documents every REST endpoint and MCP tool on the developer page', () => {
    const agent = require('../scripts/agent-config');
    const page = read('developers/index.html');
    JSON.parse(read('worker/src/config.json')).apiEndpoints.forEach(e => expect(page).to.include(`<code>${e.path}</code>`));
    [...agent.DOCUMENTS, agent.POST_TOOL].forEach(t => expect(page).to.include(`<code>${t.tool}</code>`));
    ['/openapi.json', '/.well-known/api-catalog', agent.ASK_URL].forEach(url => expect(page).to.include(url));
  });
});
