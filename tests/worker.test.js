/**
 * Cloudflare Worker tests (worker/): the A2A agent logic and the wiring of routes, config and headers.
 * The MCP server itself is exercised end to end with `wrangler dev` (see worker/README.md).
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

  it('runs only on the agent paths; GitHub Pages keeps serving everything else', () => {
    const paths = wrangler.routes.map(r => r.pattern.replace('ifuentes.net', ''));
    expect(paths).to.have.members(['/mcp', '/a2a', '/', '/.well-known/api-catalog']);
    expect(new URL(config.mcpUrl).pathname).to.equal('/mcp');
    expect(new URL(config.a2aUrl).pathname).to.equal('/a2a');
    wrangler.routes.forEach(r => expect(r.zone_name).to.equal('ifuentes.net'));
    expect(wrangler.workers_dev).to.equal(false);
  });

  it('fails open on the home page and API catalog', () => {
    expect(source.match(/passThroughOnException\(\)/g)).to.have.length(2);
  });

  it('advertises the endpoints agents look for in the home page Link header', () => {
    ['rel="api-catalog"', 'rel="service-desc"', 'rel="describedby"'].forEach(rel => expect(config.linkHeader).to.include(rel));
    config.linkHeader.match(/<([^>]+)>/g).map(l => l.slice(1, -1)).forEach(href => {
      expect(fs.existsSync(path.join(root, href)), href).to.be.true;
    });
  });

  it('pins exact dependency versions', () => {
    const pkg = JSON.parse(read('worker/package.json'));
    Object.values({ ...pkg.dependencies, ...pkg.devDependencies }).forEach(version => expect(version).to.match(/^\d+\.\d+\.\d+$/));
  });
});
