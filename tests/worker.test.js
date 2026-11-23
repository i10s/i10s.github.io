/**
 * Cloudflare Worker tests (worker/): the A2A agent, REST API and NLWeb logic, and the wiring of routes,
 * config and headers. The MCP server itself is exercised end to end with `wrangler dev` (see worker/README.md).
 */

const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const config = JSON.parse(read('worker/src/config.json'));

describe('Worker: A2A agent', () => {
  let a2a;
  const texts = { '/llms.txt': 'PROFILE TEXT', '/resume.md': 'RESUME TEXT', '/now.md': 'NOW TEXT' };
  const options = { documents: config.documents, site: config.site, load: async p => texts[p], newId: () => 'fixed-id' };
  const send = (text, message = {}, method = 'message/send') => a2a.handleA2A({
    jsonrpc: '2.0',
    id: 7,
    method,
    params: { message: { kind: 'message', role: 'user', messageId: 'm1', parts: [{ kind: 'text', text }], ...message } }
  }, options);

  before(async () => {
    a2a = await import('../worker/src/a2a.js');
  });

  it('answers "who is" questions with the profile', async () => {
    const reply = await send('Who is Iñaki Fuentes?');
    expect(reply.result.metadata.skill).to.equal('profile');
  });

  it('routes questions about now to the Now page, in English and Spanish', async () => {
    expect((await send('Is he still at Travelgate? What is he working on now?')).result.metadata.skill).to.equal('now');
    expect((await send('¿A qué se dedica actualmente?')).result.metadata.skill).to.equal('now');
  });

  it('routes career questions to the résumé, in English and Spanish', async () => {
    expect((await send('Summarise his career and education')).result.metadata.skill).to.equal('resume');
    expect((await send('¿Cuál es su trayectoria?')).result.metadata.skill).to.equal('resume');
  });

  it('honours an explicit skill', async () => {
    expect((await send('anything', { metadata: { skill: 'resume' } })).result.metadata.skill).to.equal('resume');
  });

  it('returns the published document verbatim, citing its source', async () => {
    const { result } = await send('what is he doing now');
    expect(result).to.include({ kind: 'message', role: 'agent', messageId: 'fixed-id' });
    expect(result.parts[0].text).to.match(/^> Source: https:\/\/ifuentes\.net\/now\.md/);
    expect(result.parts[0].text.endsWith('NOW TEXT')).to.be.true;
    expect(result.metadata.source).to.equal('https://ifuentes.net/now.md');
  });

  it('keeps the caller\'s context id', async () => {
    expect((await send('hi', { contextId: 'ctx-1' })).result.contextId).to.equal('ctx-1');
  });

  it('accepts A2A v1 method names', async () => {
    expect((await send('Who is he?', {}, 'SendMessage')).result.kind).to.equal('message');
  });

  it('returns JSON-RPC errors instead of throwing', async () => {
    const { ERRORS, handleA2A } = a2a;
    expect((await handleA2A('nope', options)).error.code).to.equal(ERRORS.INVALID_REQUEST);
    expect((await handleA2A({ jsonrpc: '2.0', id: 1, method: 'message/send', params: {} }, options)).error.code).to.equal(ERRORS.INVALID_PARAMS);
    expect((await handleA2A({ jsonrpc: '2.0', id: 1, method: 'tasks/get', params: { id: 'x' } }, options)).error.code).to.equal(ERRORS.TASK_NOT_FOUND);
    expect((await handleA2A({ jsonrpc: '2.0', id: 1, method: 'message/stream', params: {} }, options)).error.code).to.equal(ERRORS.UNSUPPORTED_OPERATION);
    expect((await handleA2A({ jsonrpc: '2.0', id: 1, method: 'nope' }, options)).error.code).to.equal(ERRORS.METHOD_NOT_FOUND);
    const failing = { ...options, load: async () => { throw new Error('down'); } };
    expect((await handleA2A({ jsonrpc: '2.0', id: 1, method: 'message/send', params: { message: { parts: [] } } }, failing)).error.code).to.equal(ERRORS.INTERNAL);
  });

  it('does not answer notifications', async () => {
    expect(await a2a.handleA2A({ jsonrpc: '2.0', method: 'message/send', params: {} }, options)).to.equal(null);
  });

  it('routes questions about the blog to the blog index', async () => {
    expect((await send('What has he written on his blog?')).result.metadata.skill).to.equal('blog');
    expect((await send('¿Qué artículos ha publicado?')).result.metadata.skill).to.equal('blog');
  });
});

// The published files the Worker reads, as they are on disk
const published = async p => {
  const file = path.join(root, p);
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) throw new Error(`${p}: HTTP 404`);
  return fs.readFileSync(file, 'utf8');
};
const posts = JSON.parse(read('blog/posts.json')).posts;
const request = (url, init) => new Request(`https://ifuentes.net${url}`, init);

describe('Worker: REST API (/api)', () => {
  let api;
  const call = (url, init) => api.handleApi(request(url, init), config, published);
  const body = async response => JSON.parse(await response.text());

  before(async () => {
    api = await import('../worker/src/api.js');
  });

  it('lists every endpoint at /api, with the OpenAPI description', async () => {
    const response = await call('/api');
    expect(response.status).to.equal(200);
    expect(response.headers.get('Content-Type')).to.match(/^application\/json/);
    expect(response.headers.get('Access-Control-Allow-Origin')).to.equal('*');
    const index = await body(response);
    expect(index.openapi).to.equal('https://ifuentes.net/openapi.json');
    expect(index.endpoints.map(e => e.path)).to.include.members(['/api', '/api/profile', '/api/resume', '/api/now', '/api/posts', '/api/posts/{slug}']);
    expect(index.related.mcp).to.equal(config.mcpUrl);
    expect((await body(await call('/api/'))).name).to.equal(index.name);
  });

  it('returns each document as JSON, with its Markdown text and last-updated date', async () => {
    for (const doc of config.documents.filter(d => d.api)) {
      const data = await body(await call(`/api/${doc.id}`));
      expect(data).to.include({ id: doc.id, title: doc.title, html_url: `https://ifuentes.net${doc.html}`, content_type: 'text/markdown' });
      expect(data.updated, doc.id).to.match(/^\d{4}-\d{2}-\d{2}$/);
      expect(data.content, doc.id).to.match(/^# /);
    }
    expect((await call('/api/blog')).status).to.equal(404);
  });

  it('lists blog posts with filters and returns one post with its text', async () => {
    const list = await body(await call('/api/posts'));
    expect(list.count).to.equal(posts.length);
    expect(list.posts[0]).to.include.keys('slug', 'title', 'url', 'markdown_url', 'date', 'topic', 'lang', 'description');
    expect((await body(await call('/api/posts?topic=nope'))).count).to.equal(0);
    expect((await body(await call('/api/posts?limit=1'))).posts).to.have.length.at.most(1);
    const post = await body(await call(`/api/posts/${posts[0].slug}`));
    expect(post).to.include({ slug: posts[0].slug, content_type: 'text/markdown' });
    expect(post.content).to.match(/^# /);
  });

  it('answers errors with RFC 9457 problem details', async () => {
    const expectProblem = async (response, status) => {
      expect(response.status).to.equal(status);
      expect(response.headers.get('Content-Type')).to.match(/^application\/problem\+json/);
      const data = await body(response);
      expect(data).to.include({ status, type: 'about:blank' });
      expect(data.title).to.be.a('string');
      expect(data.detail).to.be.a('string');
      return response;
    };
    await expectProblem(await call('/api/nope'), 404);
    await expectProblem(await call('/api/posts/no-such-post'), 404);
    await expectProblem(await call('/api/posts?limit=0'), 400);
    await expectProblem(await call('/api/posts?lang=spanish'), 400);
    expect((await expectProblem(await call('/api/now', { method: 'POST', body: '{}' }), 405)).headers.get('Allow')).to.equal('GET, HEAD, OPTIONS');
    const down = await api.handleApi(request('/api/now'), config, async () => { throw new Error('down'); });
    await expectProblem(down, 502);
  });

  it('answers CORS preflight and HEAD', async () => {
    expect((await call('/api', { method: 'OPTIONS' })).status).to.equal(204);
    const head = await call('/api/now', { method: 'HEAD' });
    expect(head.status).to.equal(200);
    expect(await head.text()).to.equal('');
  });
});

describe('Worker: NLWeb (/ask)', () => {
  let nlweb;
  const ask = (url, init) => nlweb.handleAsk(request(url, init), config, published, { newId: () => 'q1' });
  const body = async response => JSON.parse(await response.text());

  before(async () => {
    nlweb = await import('../worker/src/nlweb.js');
  });

  it('answers GET ?query= with NLWeb v0.55 results', async () => {
    const response = await ask('/ask?query=What%20is%20he%20working%20on%20now%3F');
    expect(response.headers.get('Content-Type')).to.match(/^application\/json/);
    const data = await body(response);
    expect(data._meta).to.include({ response_type: 'answer', version: '0.55' });
    expect(data.query_id).to.equal('q1');
    expect(data.results[0].url).to.equal('https://ifuentes.net/now.html');
    data.results.forEach(r => {
      expect(r).to.include.keys('url', 'name', 'site', 'score', 'description', 'schema_object');
      expect(r.site).to.equal('ifuentes.net');
      expect(r.score).to.be.within(0, 1);
      expect(r.schema_object['@context']).to.equal('https://schema.org');
    });
  });

  it('accepts v0.55 POST bodies and returns blog posts for blog questions', async () => {
    const data = await body(await ask('/ask', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: { text: 'blog posts' }, prefer: { streaming: false } }) }));
    const types = data.results.map(r => r.schema_object['@type']);
    expect(types).to.include('Blog');
    if (posts.length) expect(types).to.include('BlogPosting');
  });

  it('falls back to the profile when nothing matches', async () => {
    const data = await body(await ask('/ask?query=zzz'));
    expect(data.results).to.have.length(1);
    expect(data.results[0].url).to.equal('https://ifuentes.net/');
  });

  it('streams server-sent events on request', async () => {
    for (const response of [await ask('/ask?query=resume&streaming=true'), await ask('/ask?query=resume', { headers: { Accept: 'text/event-stream' } })]) {
      expect(response.headers.get('Content-Type')).to.match(/^text\/event-stream/);
      const events = (await response.text()).trim().split('\n\n').map(block => ({
        name: block.match(/^event: (.*)$/m)[1],
        data: JSON.parse(block.match(/^data: (.*)$/m)[1])
      }));
      expect(events[0].name).to.equal('start');
      expect(events[0].data._meta.version).to.equal('0.55');
      expect(events[1]).to.deep.include({ name: 'result' });
      expect(events[1].data.item.url).to.equal('https://ifuentes.net/resume.html');
      expect(events[events.length - 1].name).to.equal('complete');
    }
  });

  it('returns NLWeb failures for bad requests', async () => {
    const missing = await ask('/ask');
    expect(missing.status).to.equal(400);
    expect((await body(missing))._meta.response_type).to.equal('failure');
    expect((await ask('/ask', { method: 'POST', body: '{' })).status).to.equal(400);
    expect((await ask('/ask', { method: 'PUT' })).status).to.equal(405);
  });
});

describe('Worker: Markdown for AI assistants', () => {
  let http;
  const req = headers => new Request('https://ifuentes.net/', { headers });

  before(async () => {
    http = await import('../worker/src/http.js');
  });

  it('serves Markdown to Accept: text/markdown and to assistants fetching for a user, not to browsers or crawlers', () => {
    expect(http.prefersMarkdown(req({ Accept: 'text/markdown' }))).to.equal(true);
    ['ChatGPT-User/1.0', 'Mozilla/5.0 (compatible; Claude-User/1.0)', 'Perplexity-User/1.0'].forEach(ua => {
      expect(http.prefersMarkdown(req({ 'User-Agent': ua, Accept: 'text/html' })), ua).to.equal(true);
    });
    ['Mozilla/5.0 (Macintosh) Safari/605', 'GPTBot/1.1', 'ClaudeBot/1.0'].forEach(ua => {
      expect(http.prefersMarkdown(req({ 'User-Agent': ua, Accept: 'text/html' })), ua).to.equal(false);
    });
  });

  it('splits generated front matter from Markdown', () => {
    const { meta, body } = http.splitFrontMatter(read('now.md'));
    expect(meta.canonical).to.equal('https://ifuentes.net/now.html');
    expect(meta.last_updated).to.match(/^\d{4}-\d{2}-\d{2}$/);
    expect(body).to.match(/^# /);
    expect(http.splitFrontMatter('# No front matter').body).to.equal('# No front matter');
  });
});

describe('Worker: wiring', () => {
  const source = read('worker/src/index.js');
  const wrangler = JSON.parse(read('worker/wrangler.jsonc').replace(/^\s*\/\/.*$/gm, ''));

  it('registers one MCP tool and resource per published document, from the generated config', () => {
    expect(source).to.match(/for \(const doc of config\.documents\)/);
    expect(source).to.include('server.registerTool(');
    expect(source).to.include('server.registerResource(');
    expect(source).to.include('readOnlyHint: true');
  });

  it('registers the blog post tool with a validated slug', () => {
    expect(source).to.include('config.postTool.tool');
    expect(source).to.match(/z\.string\(\)\.regex\(SLUG\)/);
  });

  it('serves the whole site on the apex, www and mta-sts, with the Worker in front of every asset', () => {
    expect(wrangler.routes.map(r => r.pattern)).to.have.members(['ifuentes.net/*', 'www.ifuentes.net/*', 'mta-sts.ifuentes.net/*']);
    expect(new URL(config.mcpUrl).pathname).to.equal('/mcp');
    expect(new URL(config.a2aUrl).pathname).to.equal('/a2a');
    wrangler.routes.forEach(r => expect(r.zone_name).to.equal('ifuentes.net'));
    expect(wrangler.workers_dev).to.equal(false);
    expect(wrangler.assets).to.include({ directory: '..', binding: 'ASSETS', run_worker_first: true, html_handling: 'none' });
  });

  it('does not publish the repository tooling', () => {
    const ignored = read('.assetsignore').split('\n').map(l => l.trim());
    ['.git', '.github', 'node_modules', 'worker', 'tests', 'scripts', 'package.json'].forEach(entry => expect(ignored, entry).to.include(entry));
  });

  it('adds the security headers to every response and falls back to the plain home page', () => {
    expect(source).to.include('withSecurityHeaders(await route(request, env, ctx))');
    expect(source).to.include('home(request).catch(() => serveStatic(request, env.ASSETS))');
    expect(source).not.to.match(/[^.]fetch\(request\)/);
  });

  it('advertises the endpoints agents look for in the home page Link header', () => {
    ['rel="api-catalog"', 'rel="service-desc"', 'rel="service-doc"', 'rel="describedby"'].forEach(rel => expect(config.linkHeader).to.include(rel));
    expect(config.linkHeader).to.include('</openapi.json>; rel="service-desc"');
    config.linkHeader.match(/<([^>]+)>/g).map(l => l.slice(1, -1)).forEach(href => {
      expect(fs.existsSync(path.join(root, href)), href).to.be.true;
    });
  });

  it('pins exact dependency versions', () => {
    const pkg = JSON.parse(read('worker/package.json'));
    Object.values({ ...pkg.dependencies, ...pkg.devDependencies }).forEach(version => expect(version).to.match(/^\d+\.\d+\.\d+$/));
  });
});

describe('Worker: static site', () => {
  let site;
  const files = {
    '/index.html': '<h1>home</h1>',
    '/now.html': 'now',
    '/blog/index.html': 'blog',
    '/404.html': 'missing'
  };
  const assets = { fetch: async req => {
    const body = files[new URL(req.url).pathname];
    return body === undefined ? new Response('', { status: 404 }) : new Response(body, { headers: { 'Content-Type': 'text/html' } });
  } };
  const get = (url, method = 'GET') => site.serveStatic(new Request(url, { method }), assets);

  before(async () => {
    site = await import('../worker/src/site.js');
  });

  it('resolves paths like GitHub Pages did', async () => {
    expect(await (await get('https://ifuentes.net/')).text()).to.equal('<h1>home</h1>');
    expect(await (await get('https://ifuentes.net/now.html')).text()).to.equal('now');
    expect(await (await get('https://ifuentes.net/now')).text()).to.equal('now');
    expect(await (await get('https://ifuentes.net/blog/')).text()).to.equal('blog');
    const dir = await get('https://ifuentes.net/blog?x=1');
    expect(dir.status).to.equal(301);
    expect(dir.headers.get('Location')).to.equal('https://ifuentes.net/blog/?x=1');
  });

  it('answers unknown paths with the 404 page and a 404 status', async () => {
    const response = await get('https://ifuentes.net/nope');
    expect(response.status).to.equal(404);
    expect(await response.text()).to.equal('missing');
    expect(await (await get('https://ifuentes.net/nope', 'HEAD')).text()).to.equal('');
  });

  it('keeps CORS open on public files, as GitHub Pages did', async () => {
    expect((await get('https://ifuentes.net/now.html')).headers.get('Access-Control-Allow-Origin')).to.equal('*');
  });

  it('adds the security headers without overriding the ones a handler set', () => {
    const response = site.withSecurityHeaders(new Response('x', { headers: { 'X-Frame-Options': 'SAMEORIGIN' } }));
    expect(response.headers.get('Content-Security-Policy')).to.include("frame-ancestors 'none'");
    expect(response.headers.get('Content-Security-Policy')).to.include("object-src 'none'");
    expect(response.headers.get('Referrer-Policy')).to.equal('strict-origin-when-cross-origin');
    expect(response.headers.get('X-Frame-Options')).to.equal('SAMEORIGIN');
  });

  it('allows inline scripts by hash only, with the hashes of the published pages', () => {
    const csp = require('../scripts/csp-hashes');
    const scriptSrc = site.CSP.split('; ').find(d => d.startsWith('script-src '));
    expect(scriptSrc).not.to.include("'unsafe-inline'");
    expect(read('worker/src/csp-hashes.js')).to.equal(csp.build());
    const [registration] = csp.inlineScripts(read('index.html')).filter(body => body.includes('serviceWorker'));
    expect(scriptSrc).to.include(csp.digest(registration));
    expect(csp.inlineScripts('<script type="application/ld+json">{}</script><script src="/a.js"></script>')).to.deep.equal([]);
  });

  it('redirects www to the apex, keeping path and query', () => {
    const response = site.hostResponse(new Request('https://www.ifuentes.net/now.html?a=1'));
    expect(response.status).to.equal(301);
    expect(response.headers.get('Location')).to.equal('https://ifuentes.net/now.html?a=1');
    expect(site.hostResponse(new Request('https://ifuentes.net/'))).to.equal(null);
  });

  it('serves an enforcing MTA-STS policy for the Proton MX hosts on mta-sts only', async () => {
    const policy = site.hostResponse(new Request('https://mta-sts.ifuentes.net/.well-known/mta-sts.txt'));
    const text = await policy.text();
    expect(text).to.match(/^version: STSv1\r\nmode: enforce\r\n/);
    expect(text).to.include('mx: mail.protonmail.ch').and.include('mx: mailsec.protonmail.ch');
    expect(site.hostResponse(new Request('https://mta-sts.ifuentes.net/')).status).to.equal(404);
  });
});
